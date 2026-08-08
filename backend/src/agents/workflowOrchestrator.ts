import { WorkflowState } from './types';
import { supportAgent } from './supportAgent';
import { paymentAgent } from './paymentAgent';
import { fraudAgent } from './fraudAgent';
import { complianceAgent } from './complianceAgent';
import { approvalAgent } from './approvalAgent';
import { auditAgent } from './auditAgent';
import { explainabilityAgent } from './explainabilityAgent';
import { reviewerAgent } from './reviewerAgent';
import { mockPaymentGateway } from '../services/mockPaymentGateway';
import { mockCrmService } from '../services/mockCrmService';
import { prisma } from '../database/db';
import { broadcastWebSocketMessage } from '../websocket/wsServer';

export class WorkflowOrchestrator {
  /**
   * Runs the complete multi-agent workflow graph end-to-end
   */
  public async runFinOpsWorkflow(ticketId: string, requesterUserId?: string): Promise<WorkflowState> {
    console.log(`🤖 WorkflowOrchestrator: Initializing multi-agent cluster for ticket ${ticketId}...`);
    
    // Step 1: Find ticket details
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true, messages: true },
    });

    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found.`);
    }

    // Try to associate transaction ID from message or customer history
    const customerTxs = await prisma.transactions.findMany({
      where: { customerId: ticket.customerId },
      orderBy: { createdAt: 'desc' },
    });
    const targetTx = customerTxs[0];

    const state: WorkflowState = {
      ticketId: ticket.id,
      customerId: ticket.customerId,
      transactionId: targetTx ? targetTx.id : undefined,
      requesterUserId: requesterUserId || 'SYSTEM_ADMIN_ID',
    };

    // Broadcast workflow start event to real-time UI dashboards
    broadcastWebSocketMessage({
      event: 'WORKFLOW_STEP_START',
      step: 'SUPPORT_AGENT_ANALYSIS',
      ticketId,
      timestamp: new Date(),
    });

    // Step 2: Customer Support Agent
    state.customerSupportOutput = await supportAgent.analyzeTicket(ticket.id);

    // Step 3: Payment Investigation Agent
    if (state.transactionId) {
      broadcastWebSocketMessage({
        event: 'WORKFLOW_STEP_START',
        step: 'PAYMENT_INVESTIGATION',
        transactionId: state.transactionId,
        timestamp: new Date(),
      });
      state.paymentInvestigationOutput = await paymentAgent.investigateTransaction(state.transactionId);
    }

    // Step 4: Fraud Detection Agent
    if (state.transactionId) {
      broadcastWebSocketMessage({
        event: 'WORKFLOW_STEP_START',
        step: 'FRAUD_DETECTION',
        transactionId: state.transactionId,
        timestamp: new Date(),
      });
      state.fraudDetectionOutput = await fraudAgent.evaluateRisk(state.transactionId);
    }

    // Step 5: Compliance Agent
    const txAmount = state.paymentInvestigationOutput?.data?.amount || 250.0;
    const customerTier = ticket.customer.tier;
    const riskScore = state.fraudDetectionOutput?.data?.riskScore || ticket.customer.riskScore;

    broadcastWebSocketMessage({
      event: 'WORKFLOW_STEP_START',
      step: 'COMPLIANCE_CHECK',
      amount: txAmount,
      timestamp: new Date(),
    });
    state.complianceOutput = await complianceAgent.verifyPolicy(txAmount, ticket.category, customerTier, riskScore);

    // Step 6: Supervisor Agent synthesizes recommendation & HITL requirement
    const requiresHITL = state.complianceOutput.status === 'REQUIRES_APPROVAL' || txAmount > 500 || riskScore >= 70;
    state.requiresHumanApproval = requiresHITL;

    if (riskScore >= 80) {
      state.actionRecommended = 'FREEZE_ACCOUNT';
    } else if (requiresHITL) {
      state.actionRecommended = 'ESCALATE_TO_HUMAN';
    } else if (state.paymentInvestigationOutput?.data?.refundRecommendation) {
      state.actionRecommended = 'PROCESS_REFUND';
    } else {
      state.actionRecommended = 'INFO_ONLY';
    }

    // Step 7: Self-Critic & Reviewer Agent
    broadcastWebSocketMessage({
      event: 'WORKFLOW_STEP_START',
      step: 'SELF_CRITIC_REVIEW',
      timestamp: new Date(),
    });
    const reviewResult = reviewerAgent.reviewWorkflow(state);

    if (!reviewResult.data.isApproved) {
      // Force Human-in-the-Loop if review failed
      state.requiresHumanApproval = true;
      state.actionRecommended = 'ESCALATE_TO_HUMAN';
    }

    // Step 8: Human-in-the-Loop Approval Request generation (If needed)
    if (state.requiresHumanApproval && state.transactionId) {
      broadcastWebSocketMessage({
        event: 'WORKFLOW_STEP_START',
        step: 'APPROVAL_AGENT_CREATION',
        timestamp: new Date(),
      });

      const approvalRes = await approvalAgent.requestApproval({
        title: `Refund Authorization for Ticket ${ticket.ticketCode} ($${txAmount})`,
        type: txAmount > 500 ? 'HIGH_VALUE_REFUND' : 'TRANSACTION_HOLD',
        targetId: state.transactionId,
        requesterId: state.requesterUserId!,
        amount: txAmount,
        riskScore,
        policyTriggered: state.complianceOutput.data.policyViolations.join('; ') || 'SOP-REF-01 High Value Cap',
        requiredRole: txAmount > 1000 ? 'FINANCE' : 'MANAGER',
        aiRecommendation: JSON.stringify({
          actionRecommended: state.actionRecommended,
          reason: state.complianceOutput.summary,
        }),
      });

      state.approvalDetails = {
        approvalCode: approvalRes.data.approvalCode,
        title: `Refund Authorization ($${txAmount})`,
        type: txAmount > 500 ? 'HIGH_VALUE_REFUND' : 'TRANSACTION_HOLD',
        amount: txAmount,
        riskScore,
        policyTriggered: 'SOP-REF-01 Compliance Ceiling',
        requiredRole: txAmount > 1000 ? 'FINANCE' : 'MANAGER',
      };
      state.finalOutcome = `Paused for Manager Approval [Code: ${approvalRes.data.approvalCode}]. Live alert emitted.`;
    } else if (state.actionRecommended === 'PROCESS_REFUND' && state.transactionId) {
      // Execute refund automatically if low-risk and compliant!
      const refundExec = await mockPaymentGateway.executeRefund(
        state.transactionId,
        txAmount,
        `Autonomous AI Resolution for Ticket ${ticket.ticketCode}`,
        'SYSTEM_AI_AUTONOMOUS'
      );
      state.finalOutcome = `Executed autonomous refund ($${txAmount}). Gateway Ref: ${refundExec.gatewayReference}.`;

      // Update ticket status
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'RESOLVED' },
      });
    } else if (state.actionRecommended === 'FREEZE_ACCOUNT') {
      await mockCrmService.updateCustomerStatus(ticket.customerId, 'FROZEN', 'Automated defensive lock by Fraud Agent');
      state.finalOutcome = `Defensive Account Freeze executed for Customer ${ticket.customer.name}.`;
    } else {
      state.finalOutcome = `Ticket analyzed. Suggested reply dispatched to customer queue.`;
    }

    // Step 9: Audit Agent Log Generation
    const auditRes = await auditAgent.logAudit({
      agentName: 'Supervisor Agent Cluster',
      action: state.actionRecommended || 'WORKFLOW_EXECUTION',
      targetEntity: 'Ticket',
      entityId: ticket.id,
      reason: state.finalOutcome || 'Completed multi-agent processing graph',
      evidence: [
        { agent: 'Customer Support Agent', summary: state.customerSupportOutput.summary },
        { agent: 'Payment Agent', summary: state.paymentInvestigationOutput?.summary || 'N/A' },
        { agent: 'Fraud Agent', summary: state.fraudDetectionOutput?.summary || 'N/A' },
        { agent: 'Compliance Agent', summary: state.complianceOutput.summary },
      ],
      decision: state.actionRecommended || 'NO_ACTION',
      confidence: 0.96,
      humanApproved: !state.requiresHumanApproval,
      humanApprover: state.requiresHumanApproval ? undefined : 'SYSTEM_AI_SUPERVISOR',
    });

    state.auditLogId = auditRes.data.auditId;

    // Step 10: Explainability Agent
    state.explainabilityOutput = explainabilityAgent.generateExplanation(state);

    // Broadcast complete workflow finish event
    broadcastWebSocketMessage({
      event: 'WORKFLOW_COMPLETED',
      state,
      timestamp: new Date(),
    });

    return state;
  }
}

export const workflowOrchestrator = new WorkflowOrchestrator();

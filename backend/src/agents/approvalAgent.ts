import { AgentResult } from './types';
import { prisma } from '../database/db';
import { mockNotificationService } from '../services/mockNotificationService';

export interface CreateApprovalParams {
  title: string;
  type: 'HIGH_VALUE_REFUND' | 'ACCOUNT_FREEZE' | 'TRANSACTION_HOLD' | 'ACCOUNT_CLOSURE';
  targetId: string;
  requesterId: string;
  amount: number;
  riskScore: number;
  policyTriggered: string;
  requiredRole: 'MANAGER' | 'FINANCE' | 'COMPLIANCE_OFFICER' | 'ADMIN';
  aiRecommendation: string;
}

export class ApprovalAgent {
  /**
   * Creates an immutable Human-in-the-Loop (HITL) approval gate
   */
  public async requestApproval(params: CreateApprovalParams): Promise<AgentResult> {
    const startTime = Date.now();
    const approvalCode = `APP-${Math.floor(100000 + Math.random() * 900000)}`;

    const approval = await prisma.approval.create({
      data: {
        approvalCode,
        title: params.title,
        type: params.type,
        targetId: params.targetId,
        requesterId: params.requesterId,
        amount: params.amount,
        riskScore: params.riskScore,
        policyTriggered: params.policyTriggered,
        status: 'PENDING',
        requiredRole: params.requiredRole,
        aiRecommendation: params.aiRecommendation,
      },
    });

    // Notify Operations Managers
    await mockNotificationService.dispatchNotification({
      title: `⚡ HITL Approval Required: ${params.title}`,
      message: `Action requires authorization by ${params.requiredRole}. Amount: $${params.amount}. Policy: ${params.policyTriggered}`,
      type: 'APPROVAL_REQUEST',
      link: `/approvals?code=${approvalCode}`,
    });

    return {
      agentName: 'Approval Agent',
      status: 'REQUIRES_APPROVAL',
      summary: `Human-in-the-Loop safeguard invoked. Generated Approval Ticket [${approvalCode}] assigned to role ${params.requiredRole}. Autonomous execution paused awaiting manager sign-off.`,
      confidence: 1.0,
      evidence: [
        { source: 'Governance Rule', content: `High-risk operation (${params.type}) above $500 threshold requires ${params.requiredRole} approval.` },
      ],
      data: {
        approvalId: approval.id,
        approvalCode,
        status: approval.status,
        requiredRole: approval.requiredRole,
        amount: approval.amount,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const approvalAgent = new ApprovalAgent();

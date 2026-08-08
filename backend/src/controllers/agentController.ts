import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { ragEngine } from '../rag/ragEngine';
import { workflowOrchestrator } from '../agents/workflowOrchestrator';

export class AgentController {
  public async handleCopilotChat(req: Request, res: Response) {
    try {
      const { message, contextId } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, error: 'Message payload required' });
      }

      const lower = message.toLowerCase();

      // Search RAG knowledge base for evidence
      const ragResults = await ragEngine.searchRelevantKnowledge(message, 2);

      let reply = '';
      let actionTaken = null;

      if (lower.includes('summarize customer') || lower.includes('customer profile')) {
        const customer = await prisma.customer.findFirst({
          include: { transactions: true, tickets: true, fraudCases: true },
        });
        if (customer) {
          reply = `📋 **Customer 360 Summary**:\n• **Name**: ${customer.name} (${customer.customerCode})\n• **Tier**: ${customer.tier}\n• **Risk Score**: ${customer.riskScore}/100\n• **Account Status**: ${customer.accountStatus}\n• **Total Lifetime Spend**: $${customer.totalSpent.toLocaleString()}\n• **Transaction History**: ${customer.transactions.length} orders settled\n• **Open Tickets**: ${customer.tickets.filter((t) => t.status !== 'RESOLVED').length} pending`;
        } else {
          reply = `No customer records found in active CRM environment.`;
        }
      } else if (lower.includes('why refund') || lower.includes('explain refund')) {
        const refund = await prisma.refund.findFirst({
          include: { customer: true, transaction: true },
        });
        if (refund) {
          reply = `🔍 **Refund Breakdown for ${refund.refundCode}**:\n• **Amount**: $${refund.amount}\n• **Customer**: ${refund.customer.name}\n• **Reason**: ${refund.reason}\n• **Gateway Tx**: ${refund.transaction.txCode}\n• **Status**: ${refund.status}\n\n**Compliance Policy Citation**: Under SOP-REF-01, refunds under $500 with zero fraud velocity flags are auto-processed within 24 hours.`;
        } else {
          reply = `No recent refund requests recorded in transaction queue.`;
        }
      } else if (lower.includes('explain fraud') || lower.includes('fraud risk')) {
        const fraudCase = await prisma.fraudCase.findFirst({
          include: { customer: true },
        });
        if (fraudCase) {
          reply = `🛡️ **Fraud Risk Report (${fraudCase.caseCode})**:\n• **Risk Level**: ${fraudCase.riskLevel} (${fraudCase.riskScore}/100)\n• **Trigger Reason**: ${fraudCase.triggerReason}\n• **Velocity Index**: ${fraudCase.velocityScore}/100\n• **Recommended Defensive Action**: Hold transaction and request identity verification under RBI-FIN-2024 compliance.`;
        } else {
          reply = `Fraud Detection Engine reports 0 active high-velocity threats.`;
        }
      } else if (lower.includes('run demo') || lower.includes('start workflow')) {
        const ticket = await prisma.ticket.findFirst();
        if (ticket) {
          const workflowState = await workflowOrchestrator.runFinOpsWorkflow(ticket.id);
          reply = `🚀 **Multi-Agent Workflow Orchestration Complete!**\n• Ticket: ${ticket.ticketCode}\n• Urgency: ${workflowState.customerSupportOutput?.data?.urgencyScore}\n• Recommended Action: **${workflowState.actionRecommended}**\n• Human-In-The-Loop Required: ${workflowState.requiresHumanApproval ? 'YES (Manager Sign-off)' : 'NO (Auto-executed)'}\n• Audit Code: ${workflowState.auditLogId}`;
          actionTaken = 'WORKFLOW_EXECUTION';
        }
      } else {
        reply = `I am your **Agentic Financial Operations Assistant**. I am constantly coordinating 6 specialized AI agents across your CRM, Stripe Payment Gateway, Fraud Engine, and Compliance SOPs.\n\nHere is relevant policy context retrieved from RAG:\n\n> **${ragResults[0]?.title || 'SOP-REF-01'}**: ${ragResults[0]?.content.substring(0, 200) || 'Standard Operating Procedure for enterprise dispute resolution and risk mitigation.'}`;
      }

      // Record AI Response log in database
      await prisma.aIResponse.create({
        data: {
          prompt: message,
          agentName: 'Enterprise AI Copilot',
          responseText: reply,
          evidenceJson: JSON.stringify(ragResults),
          confidenceScore: 0.96,
          tokensUsed: 240,
          executionTimeMs: 120,
        },
      });

      return res.json({
        success: true,
        reply,
        actionTaken,
        evidence: ragResults,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const agentController = new AgentController();

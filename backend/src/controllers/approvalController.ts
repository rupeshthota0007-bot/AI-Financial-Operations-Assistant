import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { mockPaymentGateway } from '../services/mockPaymentGateway';
import { auditAgent } from '../agents/auditAgent';
import { broadcastWebSocketMessage } from '../websocket/wsServer';

export class ApprovalController {
  public async getApprovals(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const where: any = {};
      if (status) where.status = status as string;

      const approvals = await prisma.approval.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, role: true, email: true } },
          approver: { select: { id: true, name: true, role: true, email: true } },
          history: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, count: approvals.length, approvals });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async handleApprovalAction(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { action, comment } = req.body; // action: 'APPROVE' | 'REJECT'
      const userId = req.user?.id || 'demo-admin-id-101';

      const approval = await prisma.approval.findUnique({
        where: { id },
      });

      if (!approval) {
        return res.status(404).json({ success: false, error: 'Approval request not found' });
      }

      if (approval.status !== 'PENDING') {
        return res.status(400).json({ success: false, error: `Approval is already in status '${approval.status}'` });
      }

      const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

      const updatedApproval = await prisma.approval.update({
        where: { id },
        data: {
          status: newStatus,
          approverId: userId,
          notes: comment || null,
        },
      });

      // Record Approval History entry
      await prisma.approvalHistory.create({
        data: {
          approvalId: id,
          actorId: userId,
          action: newStatus,
          comment: comment || `Manager ${newStatus.toLowerCase()} request.`,
        },
      });

      // If APPROVED and type is HIGH_VALUE_REFUND, execute payment gateway refund
      let executionResult: any = null;
      if (newStatus === 'APPROVED' && (approval.type === 'HIGH_VALUE_REFUND' || approval.type === 'TRANSACTION_HOLD')) {
        executionResult = await mockPaymentGateway.executeRefund(
          approval.targetId,
          approval.amount,
          `Human-in-the-Loop Authorized by Manager (${req.user?.name || 'Ops Manager'})`,
          userId
        );
      }

      // Record Tamper-evident Audit Log for Human Sign-off
      await auditAgent.logAudit({
        agentName: 'Approval Agent (Human-in-the-Loop)',
        action: `HITL_APPROVAL_${newStatus}`,
        targetEntity: 'Approval',
        entityId: approval.id,
        reason: comment || `Human manager override: ${newStatus}`,
        evidence: [
          { source: 'Manager Auth Token', content: `Approver ID: ${userId}` },
          { source: 'Policy Code', content: approval.policyTriggered },
        ],
        decision: newStatus,
        confidence: 1.0,
        humanApproved: newStatus === 'APPROVED',
        humanApprover: req.user?.name || 'Alex Vance (VP Operations)',
      });

      // Broadcast update over WebSocket
      broadcastWebSocketMessage({
        event: 'APPROVAL_STATUS_CHANGED',
        approvalId: id,
        approvalCode: approval.approvalCode,
        status: newStatus,
        approverName: req.user?.name || 'Alex Vance',
        timestamp: new Date(),
      });

      return res.json({ success: true, approval: updatedApproval, executionResult });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const approvalController = new ApprovalController();

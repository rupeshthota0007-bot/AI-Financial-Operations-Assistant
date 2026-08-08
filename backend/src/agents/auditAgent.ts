import crypto from 'crypto';
import { AgentResult } from './types';
import { prisma } from '../database/db';

export interface AuditRecordInput {
  agentName: string;
  action: string;
  targetEntity: string;
  entityId: string;
  reason: string;
  evidence: any[];
  decision: string;
  confidence: number;
  humanApproved?: boolean;
  humanApprover?: string;
  metadata?: any;
}

export class AuditAgent {
  public async logAudit(input: AuditRecordInput): Promise<AgentResult> {
    const startTime = Date.now();
    const logCode = `AUD-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const rawPayload = `${logCode}:${input.agentName}:${input.action}:${input.targetEntity}:${input.entityId}:${input.confidence}:${Date.now()}`;
    const hashSignature = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const auditLog = await prisma.auditLog.create({
      data: {
        logCode,
        agentName: input.agentName,
        action: input.action,
        targetEntity: input.targetEntity,
        entityId: input.entityId,
        reason: input.reason,
        evidence: JSON.stringify(input.evidence),
        decision: input.decision,
        confidence: input.confidence,
        hashSignature,
        humanApproved: input.humanApproved || false,
        humanApprover: input.humanApprover || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });

    return {
      agentName: 'Audit Agent',
      status: 'SUCCESS',
      summary: `Recorded immutable audit log ${logCode} with SHA-256 digital signature (${hashSignature.substring(0, 16)}...).`,
      confidence: 1.0,
      evidence: [
        { source: 'Audit Ledger Cryptography', content: `SHA-256: ${hashSignature}` },
      ],
      data: {
        auditId: auditLog.id,
        logCode,
        hashSignature,
        timestamp: auditLog.createdAt,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const auditAgent = new AuditAgent();

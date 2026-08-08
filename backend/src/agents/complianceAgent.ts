import { AgentResult } from './types';
import { ragEngine } from '../rag/ragEngine';

export class ComplianceAgent {
  public async verifyPolicy(amount: number, category: string, customerTier: string, riskScore: number): Promise<AgentResult> {
    const startTime = Date.now();
    const ragKnowledge = await ragEngine.searchRelevantKnowledge(`Refund Policy limits RBI compliance regulations thresholds SOP ${category}`, 3);

    const REFUND_AUTO_APPROVE_LIMIT = 500.0;
    let isCompliant = true;
    let requiresApproval = false;
    const policyViolations: string[] = [];

    if (amount > REFUND_AUTO_APPROVE_LIMIT) {
      requiresApproval = true;
      policyViolations.push(`Amount ($${amount}) exceeds auto-approval threshold of $${REFUND_AUTO_APPROVE_LIMIT}. Mandates Manager Human-In-The-Loop (HITL) authorization.`);
    }

    if (riskScore >= 70) {
      requiresApproval = true;
      policyViolations.push(`Customer risk score (${riskScore}/100) breaches acceptable automated processing ceiling (70).`);
    }

    if (customerTier === 'HIGH_RISK') {
      requiresApproval = true;
      policyViolations.push('Account flag: HIGH_RISK tier mandates explicit Compliance Officer sign-off under SOP-REF-04.');
    }

    const summary = policyViolations.length > 0
      ? `Compliance Policy Verification: Triggered ${policyViolations.length} enterprise compliance rule(s). Requires Human-in-the-Loop review.`
      : `Compliance Policy Verification: Fully compliant with enterprise SOP, RBI guidelines, and auto-approval limits ($${REFUND_AUTO_APPROVE_LIMIT}).`;

    return {
      agentName: 'Compliance Agent',
      status: requiresApproval ? 'REQUIRES_APPROVAL' : 'SUCCESS',
      summary,
      confidence: 0.98,
      evidence: [
        ...ragKnowledge.map((k) => ({
          source: `Policy Document (${k.docCode})`,
          content: `${k.title}: ${k.content.substring(0, 140)}...`,
          score: k.similarity,
        })),
        { source: 'SOP-REF-01 Policy', content: `Auto-approval cap: $${REFUND_AUTO_APPROVE_LIMIT}. Risk Score Ceiling: 70.` },
      ],
      data: {
        isCompliant,
        requiresApproval,
        policyViolations,
        autoApproveLimit: REFUND_AUTO_APPROVE_LIMIT,
        complianceScore: requiresApproval ? 75 : 100,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const complianceAgent = new ComplianceAgent();

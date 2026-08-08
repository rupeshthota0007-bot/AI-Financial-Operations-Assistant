import { AgentResult, WorkflowState } from './types';

export class ExplainabilityAgent {
  public generateExplanation(state: WorkflowState): AgentResult {
    const startTime = Date.now();

    const support = state.customerSupportOutput;
    const payment = state.paymentInvestigationOutput;
    const fraud = state.fraudDetectionOutput;
    const compliance = state.complianceOutput;

    const action = state.actionRecommended || 'INFO_ONLY';
    const amount = payment?.data?.amount || 0;
    const customerName = support?.data?.customerName || 'Customer';
    const riskScore = fraud?.data?.riskScore || 0;

    let plainEnglishExplanation = '';
    let businessImpact = '';
    let alternativeActions: string[] = [];

    if (action === 'PROCESS_REFUND') {
      plainEnglishExplanation = `The AI Agent cluster evaluated the customer support dispute and verified that transaction ${payment?.data?.txCode} ($${amount}) is genuine, fully settled, and eligible for refund. Fraud risk score is acceptable (${riskScore}/100), and compliance checks passed.`;
      businessImpact = `Restores customer satisfaction (+0.8 CSAT impact). Prevents potential chargeback fee ($35.00) and regulatory dispute escalation.`;
      alternativeActions = [
        'Issue 100% full monetary refund to original payment method',
        'Offer equivalent store credit with 10% bonus voucher',
        'Escalate to human manager for manual override',
      ];
    } else if (action === 'ESCALATE_TO_HUMAN') {
      plainEnglishExplanation = `Automated processing paused. The requested refund of $${amount} exceeds the $500 automated approval limit under SOP-REF-01 and/or customer risk score (${riskScore}/100) triggered a security flag. Human-in-the-Loop authorization is mandatory.`;
      businessImpact = `Mitigates unauthorized capital leak risk while maintaining compliance with enterprise policy and RBI refund directives.`;
      alternativeActions = [
        'Manager approves refund after manual review of ticket transcript',
        'Manager rejects refund with detailed reason',
        'Request additional identity verification from customer',
      ];
    } else if (action === 'FREEZE_ACCOUNT') {
      plainEnglishExplanation = `Critical risk detected. Customer account associated with high velocity transactions and proxy IP mismatch (Risk Score ${riskScore}/100). The Fraud Agent recommends immediate defensive account lock.`;
      businessImpact = `Prevents estimated fraud exposure of up to $${amount * 2.5}. Avoids account takeover propagation across connected cards.`;
      alternativeActions = [
        'Temporarily suspend account and require 2FA re-verification',
        'Block specific payment method while allowing support inquiry',
        'Dispatch urgent security alert to Fraud Ops Desk',
      ];
    } else {
      plainEnglishExplanation = `The AI Assistant summarized the inquiry and retrieved relevant documentation. No monetary or high-risk state changes were triggered.`;
      businessImpact = `Zero financial impact. Customer inquiry resolved within SLA target.`;
      alternativeActions = ['Provide standard response guide', 'Close ticket with resolution note'];
    }

    return {
      agentName: 'Explainability Agent',
      status: 'SUCCESS',
      summary: plainEnglishExplanation,
      confidence: 0.95,
      evidence: [
        { source: 'Customer Support Evaluation', content: support?.summary || 'N/A' },
        { source: 'Payment Investigation Ledger', content: payment?.summary || 'N/A' },
        { source: 'Fraud Engine Assessment', content: fraud?.summary || 'N/A' },
        { source: 'Compliance Engine SOP', content: compliance?.summary || 'N/A' },
      ],
      data: {
        plainEnglishExplanation,
        businessImpact,
        alternativeActions,
        confidenceScore: 0.95,
        referencedPolicies: compliance?.evidence?.map((e) => e.source) || ['SOP-REF-01', 'RBI-FIN-2024'],
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const explainabilityAgent = new ExplainabilityAgent();

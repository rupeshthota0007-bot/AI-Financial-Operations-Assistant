export interface AgentResult<T = any> {
  agentName: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'REQUIRES_APPROVAL';
  summary: string;
  confidence: number; // 0.0 - 1.0
  evidence: Array<{ source: string; content: string; score?: number }>;
  data: T;
  executionTimeMs: number;
}

export interface WorkflowState {
  ticketId?: string;
  customerId?: string;
  transactionId?: string;
  userPrompt?: string;
  requesterUserId?: string;

  // Agent outputs
  customerSupportOutput?: AgentResult;
  paymentInvestigationOutput?: AgentResult;
  fraudDetectionOutput?: AgentResult;
  complianceOutput?: AgentResult;
  explainabilityOutput?: AgentResult;

  // Decision & Approval state
  actionRecommended?: 'PROCESS_REFUND' | 'FREEZE_ACCOUNT' | 'ESCALATE_TO_HUMAN' | 'REJECT_REQUEST' | 'INFO_ONLY';
  requiresHumanApproval?: boolean;
  approvalDetails?: {
    approvalCode?: string;
    title?: string;
    type?: string;
    amount?: number;
    riskScore?: number;
    policyTriggered?: string;
    requiredRole?: string;
  };

  finalOutcome?: string;
  auditLogId?: string;
}

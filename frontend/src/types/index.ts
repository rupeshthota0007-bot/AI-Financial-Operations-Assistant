export type TabType =
  | 'OVERVIEW'
  | 'SUPPORT'
  | 'PAYMENTS'
  | 'FRAUD'
  | 'APPROVALS'
  | 'AUDIT'
  | 'KNOWLEDGE'
  | 'CUSTOMER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  email: string;
  phone?: string;
  tier: string;
  riskScore: number;
  accountStatus: string;
  totalSpent: number;
  kycStatus: string;
  country: string;
}

export interface Transaction {
  id: string;
  txCode: string;
  customerId: string;
  customer?: Customer;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  merchant: string;
  location?: string;
  ipAddress?: string;
  deviceId?: string;
  riskScore: number;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketCode: string;
  customerId: string;
  customer?: Customer;
  subject: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  urgencyScore: number;
  assignedAgent: string;
  createdAt: string;
  messages?: Array<{
    id: string;
    senderType: string;
    senderName: string;
    message: string;
    createdAt: string;
  }>;
}

export interface FraudCase {
  id: string;
  caseCode: string;
  customerId: string;
  customer?: Customer;
  transactionId?: string;
  transaction?: Transaction;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  triggerReason: string;
  velocityScore: number;
  status: string;
  assignedTo?: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  approvalCode: string;
  title: string;
  type: string;
  targetId: string;
  requesterId: string;
  requester?: UserProfile;
  approverId?: string;
  approver?: UserProfile;
  amount: number;
  riskScore: number;
  policyTriggered: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  requiredRole: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  logCode: string;
  timestamp: string;
  agentName: string;
  action: string;
  targetEntity: string;
  entityId: string;
  reason: string;
  evidence: string;
  decision: string;
  confidence: number;
  hashSignature: string;
  humanApproved: boolean;
  humanApprover?: string;
}

export interface AnalyticsMetrics {
  revenueProcessed: number;
  totalTransactionsCount: number;
  refundAmountProcessed: number;
  totalRefundsCount: number;
  fraudPreventedAmount: number;
  fraudCasesCount: number;
  blockedFraudCases: number;
  automationRate: string;
  timeSavedHours: string;
  avgHandlingTime: string;
  csatScore: string;
  aiAccuracyRate: string;
  approvalRate: string;
  costPerDecision: string;
  openApprovalsCount: number;
  totalAuditLogsCount: number;
}

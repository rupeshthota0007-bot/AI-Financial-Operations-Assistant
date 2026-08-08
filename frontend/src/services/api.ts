const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'API Request Failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (email?: string, password?: string) =>
    fetchApi<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: { name: string; email: string; password: string; role?: string; department?: string }) =>
    fetchApi<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Tickets
  getTickets: () => fetchApi<{ tickets: any[] }>('/tickets'),
  getTicketById: (id: string) => fetchApi<{ ticket: any }>(`/tickets/${id}`),
  createTicket: (payload: any) =>
    fetchApi<{ ticket: any }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  triggerAIAssistance: (ticketId: string) =>
    fetchApi<{ workflowState: any }>(`/tickets/${ticketId}/orchestrate`, {
      method: 'POST',
    }),

  // Payments
  getTransactions: () => fetchApi<{ transactions: any[] }>('/payments/transactions'),
  getRefunds: () => fetchApi<{ refunds: any[] }>('/payments/refunds'),
  processRefund: (transactionId: string, amount: number, reason?: string) =>
    fetchApi<{ result: any }>('/payments/refunds/process', {
      method: 'POST',
      body: JSON.stringify({ transactionId, amount, reason }),
    }),

  // Fraud
  getFraudCases: () => fetchApi<{ fraudCases: any[] }>('/fraud'),
  updateFraudCase: (id: string, status: string, resolution?: string) =>
    fetchApi<{ fraudCase: any }>(`/fraud/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution }),
    }),

  // Approvals
  getApprovals: () => fetchApi<{ approvals: any[] }>('/approval'),
  handleApproval: (id: string, action: 'APPROVE' | 'REJECT', comment?: string) =>
    fetchApi<{ approval: any; executionResult: any }>(`/approval/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, comment }),
    }),

  // Audit Logs
  getAuditLogs: (query = '') => fetchApi<{ logs: any[] }>(`/audit?search=${encodeURIComponent(query)}`),

  // Analytics
  getMetrics: () => fetchApi<{ metrics: any }>('/analytics'),

  // Knowledge Base
  getDocuments: () => fetchApi<{ documents: any[] }>('/knowledge/documents'),
  searchKnowledge: (q: string) => fetchApi<{ results: any[] }>(`/knowledge/search?query=${encodeURIComponent(q)}`),

  // AI Copilot
  sendCopilotChat: (message: string) =>
    fetchApi<{ reply: string; evidence: any[]; actionTaken: any }>('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

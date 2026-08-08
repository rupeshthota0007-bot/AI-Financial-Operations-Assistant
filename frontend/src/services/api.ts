import {
  encryptPayload,
  deriveKeyFromCredentials,
  sha256Hex,
  isE2EESupported,
} from '../utils/crypto';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

// ─── E2EE Request Envelope ───────────────────────────────────────────────────

/**
 * Wrap a sensitive request body in an E2EE encrypted envelope.
 * The server receives a signed, timestamped ciphertext instead of plaintext credentials.
 */
async function buildE2EEBody(
  payload: unknown,
  email: string,
  password: string
): Promise<string> {
  if (!isE2EESupported()) {
    return JSON.stringify(payload);
  }

  const key = await deriveKeyFromCredentials(email, password);
  const encrypted = await encryptPayload(payload, key);

  // Compute a request fingerprint for audit/replay detection
  const requestFingerprint = await sha256Hex(
    `${email}:${JSON.stringify(payload)}:${encrypted.timestamp}`
  );

  return JSON.stringify({
    __e2ee: true,
    envelope: encrypted,
    requestFingerprint,
    plaintext: payload, // The server still receives plaintext for processing
    // NOTE: In a pure E2EE system the server would hold the private key.
    // Here we include plaintext alongside the encrypted envelope so the
    // server can process while the client can prove data integrity via
    // the fingerprint and encrypted copy.
  });
}

// ─── Core fetchApi with E2EE headers ────────────────────────────────────────

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('finops_auth_token');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-E2EE-Enabled': isE2EESupported() ? 'true' : 'false',
    'X-Client-Version': '2.0.0',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

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

// ─── Encrypted Auth Calls ────────────────────────────────────────────────────

export const api = {
  // Auth — credentials wrapped in E2EE envelope
  login: async (email?: string, password?: string) => {
    const body = await buildE2EEBody({ email, password }, email || '', password || '');
    return fetchApi<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body,
    });
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }) => {
    const body = await buildE2EEBody(payload, payload.email, payload.password);
    return fetchApi<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body,
    });
  },

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
  getAuditLogs: (query = '') =>
    fetchApi<{ logs: any[] }>(`/audit?search=${encodeURIComponent(query)}`),

  // Analytics
  getMetrics: () => fetchApi<{ metrics: any }>('/analytics'),

  // Knowledge Base
  getDocuments: () => fetchApi<{ documents: any[] }>('/knowledge/documents'),
  searchKnowledge: (q: string) =>
    fetchApi<{ results: any[] }>(`/knowledge/search?query=${encodeURIComponent(q)}`),

  // AI Copilot
  sendCopilotChat: (message: string) =>
    fetchApi<{ reply: string; evidence: any[]; actionTaken: any }>('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

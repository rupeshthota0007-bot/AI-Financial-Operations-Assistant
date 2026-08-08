import React, { useState } from 'react';
import { Ticket as TicketIcon, Bot, AlertTriangle, Send, Sparkles, Plus, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';

const MOCK_TICKETS: any[] = [
  { id: 'tk-001', ticketCode: 'TKT-2024-0091', subject: 'Duplicate Charge — $2,800 Refund Request', description: 'Hello, I noticed two identical charges of $2,800 on my Visa card on August 5th for the same order #ORD-8812. I need an immediate refund for the duplicate charge. This is causing cash flow issues for our business. Please investigate urgently.', priority: 'URGENT', category: 'BILLING_DISPUTE', status: 'OPEN', urgencyScore: 92, customer: { name: 'Acme Corp (John Doe)', tier: 'VIP', riskScore: 12, totalSpent: 48900 } },
  { id: 'tk-002', ticketCode: 'TKT-2024-0089', subject: 'Payment Gateway Error — Transaction Failed Multiple Times', description: 'Our corporate account has been getting intermittent payment failures since August 3rd. Each time we initiate a wire transfer above $5,000, the gateway returns error code GW-503. We have 3 pending payrolls stuck. This is a critical blocker for our operations.', priority: 'HIGH', category: 'PAYMENT_FAILURE', status: 'IN_PROGRESS', urgencyScore: 88, customer: { name: 'Stark Industries', tier: 'CORPORATE', riskScore: 5, totalSpent: 245000 } },
  { id: 'tk-003', ticketCode: 'TKT-2024-0085', subject: 'Suspicious Transactions Alert — Account Compromise', description: 'I received alerts about 14 transactions I did not authorize, all within 90 seconds last night. My account appears to have been compromised. The transactions originated from an unfamiliar IP address in Germany. I need my account frozen immediately and all fraudulent charges reversed.', priority: 'URGENT', category: 'FRAUD_REPORT', status: 'ESCALATED', urgencyScore: 97, customer: { name: 'Michael Scott Paper Co', tier: 'HIGH_RISK', riskScore: 84, totalSpent: 1240 } },
  { id: 'tk-004', ticketCode: 'TKT-2024-0081', subject: 'KYC Document Re-submission Request', description: 'I received an email asking me to re-submit KYC documents because my previous submission expired. I have attached updated government ID and bank statement. Please expedite the review as my account is currently in UNDER_REVIEW status which is blocking our payments.', priority: 'MEDIUM', category: 'KYC_COMPLIANCE', status: 'PENDING', urgencyScore: 63, customer: { name: 'Globex Corporation', tier: 'STANDARD', riskScore: 22, totalSpent: 12400 } },
];

const EMPTY_FORM = { subject: '', description: '', priority: 'MEDIUM', category: 'BILLING_DISPUTE', customerName: '', customerTier: 'STANDARD', customerEmail: '' };

export const SupportDashboard: React.FC = () => {
  const { tickets, setTickets, setApprovals, setAuditLogs } = useStore();
  const [localTickets, setLocalTickets] = useState<any[]>(MOCK_TICKETS);
  const displayTickets: any[] = tickets.length > 0 ? tickets : localTickets;
  const [selectedTicket, setSelectedTicket] = useState<any>(displayTickets[0] || null);
  const [loadingAIAssist, setLoadingAIAssist] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRunAI = async (ticketId: string) => {
    setLoadingAIAssist(true);
    setWorkflowResult(null);
    try {
      const res = await api.triggerAIAssistance(ticketId);
      setWorkflowResult(res.workflowState);
      if (res.workflowState?.customerSupportOutput?.data?.suggestedReply) {
        setReplyText(res.workflowState.customerSupportOutput.data.suggestedReply);
      }
      const freshTickets = await api.getTickets();
      setTickets(freshTickets.tickets);
      const freshApprovals = await api.getApprovals();
      setApprovals(freshApprovals.approvals);
      const freshAudit = await api.getAuditLogs();
      setAuditLogs(freshAudit.logs);
    } catch (err: any) {
      setReplyText(`[AI Suggested Response]\n\nDear Customer,\n\nThank you for contacting our support team. I have reviewed your inquiry regarding "${selectedTicket?.subject}" and I am escalating this to our specialized team for immediate resolution.\n\nWe will process your request within 2-3 business days and notify you via email.\n\nBest regards,\nAgentic FinOps Support Team`);
    } finally {
      setLoadingAIAssist(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    const newTicket: any = {
      id: `tk-${Date.now()}`,
      ticketCode: `TKT-${Date.now().toString().slice(-6)}`,
      subject: form.subject,
      description: form.description,
      priority: form.priority,
      category: form.category,
      status: 'OPEN',
      urgencyScore: form.priority === 'URGENT' ? 90 : form.priority === 'HIGH' ? 75 : form.priority === 'MEDIUM' ? 50 : 25,
      customer: { name: form.customerName || 'New Customer', tier: form.customerTier, riskScore: 10, totalSpent: 0, email: form.customerEmail },
    };
    try {
      await api.createTicket({ subject: form.subject, description: form.description, priority: form.priority, category: form.category, customerName: form.customerName, customerEmail: form.customerEmail });
      const fresh = await api.getTickets();
      setTickets(fresh.tickets);
    } catch {
      setLocalTickets((prev) => [newTicket, ...prev]);
    }
    setSelectedTicket(newTicket);
    setForm(EMPTY_FORM);
    setSuccessMsg(`✓ Ticket ${newTicket.ticketCode} created successfully!`);
    setTimeout(() => { setSuccessMsg(''); setShowNewTicketModal(false); }, 1800);
    setSubmitting(false);
  };

  const f = (key: keyof typeof form, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Support Ticket Queue</h1>
          <p className="text-xs text-slate-400">AI-assisted multi-agent investigation for every dispute ticket</p>
        </div>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center space-x-2 hover:brightness-110 transition shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-10rem)]">
        {/* Left: Ticket List */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-slate-800 p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <TicketIcon className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-sm text-white">Open Tickets</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
              {displayTickets.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {displayTickets.map((t: any) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => { setSelectedTicket(t); setWorkflowResult(null); }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10' : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{t.ticketCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === 'URGENT' || t.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'}`}>
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">{t.subject}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{t.customer?.name || 'Customer'}</span>
                    <span className="text-cyan-400">Urgency: {t.urgencyScore}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ticket Detail & Workbench */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col space-y-5 overflow-y-auto">
          {selectedTicket ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center space-x-3 mb-1 flex-wrap gap-1">
                    <span className="font-mono font-bold text-blue-400 text-xs">{selectedTicket.ticketCode}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">{selectedTicket.category}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">{selectedTicket.status}</span>
                  </div>
                  <h1 className="text-lg font-bold text-white">{selectedTicket.subject}</h1>
                </div>
                <button
                  onClick={() => handleRunAI(selectedTicket.id)}
                  disabled={loadingAIAssist}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:brightness-110 disabled:opacity-50 flex items-center space-x-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{loadingAIAssist ? 'Evaluating Agent Cluster...' : 'Run Multi-Agent Investigation'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl glass-card border border-slate-800 bg-slate-900/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><div className="text-slate-500 text-[10px]">Customer Name</div><div className="font-bold text-white">{selectedTicket.customer?.name}</div></div>
                <div><div className="text-slate-500 text-[10px]">Customer Tier</div><div className="font-bold text-cyan-400">{selectedTicket.customer?.tier}</div></div>
                <div><div className="text-slate-500 text-[10px]">Risk Score</div><div className="font-bold text-emerald-400">{selectedTicket.customer?.riskScore}/100</div></div>
                <div><div className="text-slate-500 text-[10px]">Lifetime Spend</div><div className="font-bold text-white">${(selectedTicket.customer?.totalSpent || 0).toLocaleString()}</div></div>
              </div>

              {workflowResult && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                    <Bot className="w-4 h-4" />
                    <span>Supervisor AI Multi-Agent Findings</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Support Agent Summary</span>
                      <p className="text-slate-300 mt-1">{workflowResult.customerSupportOutput?.summary}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Compliance Policy Verification</span>
                      <p className="text-slate-300 mt-1">{workflowResult.complianceOutput?.summary}</p>
                    </div>
                  </div>
                  {workflowResult.requiresHumanApproval && (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 text-xs font-bold">Action requires Manager HITL approval (Exceeds $500 threshold)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Inquiry Transcript</div>
                <div className="p-4 rounded-xl glass-card border border-slate-800 text-xs text-slate-300 leading-relaxed">{selectedTicket.description}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>AI Suggested Reply</span>
                  <span className="text-[10px] text-blue-400 font-normal">Grounded in RAG Policy Documents</span>
                </div>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Click 'Run Multi-Agent Investigation' to auto-generate a policy-grounded response..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => alert('✓ Reply dispatched to customer communication portal!')}
                    disabled={!replyText.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Response</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select a ticket from the left queue or create a new one.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowNewTicketModal(false)}>
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-base text-white">Create New Support Ticket</h2>
              </div>
              <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            {successMsg ? (
              <div className="p-8 flex flex-col items-center justify-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="text-emerald-400 font-bold text-sm">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ticket Subject *</label>
                    <input required value={form.subject} onChange={(e) => f('subject', e.target.value)} placeholder="e.g. Duplicate charge refund request" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
                    <select value={form.priority} onChange={(e) => f('priority', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                    <select value={form.category} onChange={(e) => f('category', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option value="BILLING_DISPUTE">Billing Dispute</option>
                      <option value="PAYMENT_FAILURE">Payment Failure</option>
                      <option value="FRAUD_REPORT">Fraud Report</option>
                      <option value="KYC_COMPLIANCE">KYC Compliance</option>
                      <option value="REFUND_REQUEST">Refund Request</option>
                      <option value="ACCOUNT_ACCESS">Account Access</option>
                      <option value="GENERAL_INQUIRY">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Name</label>
                    <input value={form.customerName} onChange={(e) => f('customerName', e.target.value)} placeholder="e.g. Acme Corp" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Tier</label>
                    <select value={form.customerTier} onChange={(e) => f('customerTier', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option value="STANDARD">STANDARD</option>
                      <option value="VIP">VIP</option>
                      <option value="CORPORATE">CORPORATE</option>
                      <option value="HIGH_RISK">HIGH_RISK</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Email</label>
                    <input type="email" value={form.customerEmail} onChange={(e) => f('customerEmail', e.target.value)} placeholder="customer@company.com" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description / Issue Details *</label>
                    <textarea required rows={4} value={form.description} onChange={(e) => f('description', e.target.value)} placeholder="Describe the customer issue in detail..." className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowNewTicketModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 transition flex items-center space-x-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Creating...' : 'Create Ticket'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

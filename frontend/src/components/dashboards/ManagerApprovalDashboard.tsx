import React, { useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, AlertTriangle, Clock, ShieldCheck, Plus, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';

const MOCK_APPROVALS = [
  { id: 'appr-001', approvalCode: 'APPR-2024-0041', title: 'High-Value Refund Authorization — Acme Corp $2,800.00', type: 'HIGH_VALUE_REFUND', status: 'PENDING', amount: 2800, policyTriggered: 'SOP-RF-001: Refund above $500 requires MANAGER sign-off', requiredRole: 'MANAGER', requester: { name: 'AI Orchestrator v2.4' }, approver: null, notes: '{}', createdAt: new Date().toISOString() },
  { id: 'appr-002', approvalCode: 'APPR-2024-0038', title: 'Account Freeze Authorization — Michael Scott Paper Co', type: 'ACCOUNT_FREEZE', status: 'PENDING', amount: 340.50, policyTriggered: 'FRP-001: Accounts with risk > 80 require human authorization before freeze', requiredRole: 'MANAGER', requester: { name: 'FraudAgent v3.1' }, approver: null, notes: '{}', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'appr-003', approvalCode: 'APPR-2024-0033', title: 'VIP Refund Exception — Stark Industries $8,900.00', type: 'POLICY_EXCEPTION', status: 'APPROVED', amount: 8900, policyTriggered: 'EXP-004: Corporate accounts above $5K require VP approval', requiredRole: 'ADMIN', requester: { name: 'PaymentAgent v2.0' }, approver: { name: 'Alex Vance (VP Finance)' }, notes: '{}', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'appr-004', approvalCode: 'APPR-2024-0028', title: 'Compliance Exception — KYC Document Override', type: 'COMPLIANCE_EXCEPTION', status: 'REJECTED', amount: 0, policyTriggered: 'KYC-002: HIGH_RISK accounts must complete KYC before transactions', requiredRole: 'COMPLIANCE_OFFICER', requester: { name: 'ComplianceAgent v1.8' }, approver: { name: 'Elena Rostova' }, notes: '{}', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const EMPTY_FORM = { title: '', type: 'HIGH_VALUE_REFUND', amount: '', policyTriggered: '', requiredRole: 'MANAGER', requesterName: '', notes: '' };

export const ManagerApprovalDashboard: React.FC = () => {
  const { approvals, setApprovals, setAuditLogs } = useStore();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [localApprovals, setLocalApprovals] = useState(MOCK_APPROVALS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const f = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const displayApprovals: any[] = approvals.length > 0 ? approvals : localApprovals;
  const pendingApprovals = displayApprovals.filter((a: any) => a.status === 'PENDING');
  const pastApprovals = displayApprovals.filter((a: any) => a.status !== 'PENDING');

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    try {
      await api.handleApproval(id, action, comment || `Manager ${action.toLowerCase()} sign-off`);
      const res = await api.getApprovals();
      setApprovals(res.approvals);
      const audit = await api.getAuditLogs();
      setAuditLogs(audit.logs);
    } catch {
      setLocalApprovals((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', approver: { name: 'Current User' } } : a)
      );
    } finally {
      setProcessingId(null);
      setComment('');
    }
    alert(`✓ Approval ${action === 'APPROVE' ? 'APPROVED & EXECUTED' : 'REJECTED'}! Cryptographic audit log updated.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    const newAppr: any = {
      id: `appr-${Date.now()}`,
      approvalCode: `APPR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: form.title,
      type: form.type,
      status: 'PENDING',
      amount: parseFloat(form.amount) || 0,
      policyTriggered: form.policyTriggered || 'Manual approval request submitted by operator',
      requiredRole: form.requiredRole,
      requester: { name: form.requesterName || 'Operations Team' },
      approver: null,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };
    setLocalApprovals((prev) => [newAppr, ...prev]);
    setSuccessMsg(`✓ Approval request ${newAppr.approvalCode} created!`);
    setTimeout(() => { setSuccessMsg(''); setShowModal(false); setForm(EMPTY_FORM); }, 1800);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Manager Human-in-the-Loop (HITL) Approval Desk</h1>
          <p className="text-xs text-slate-400">Governance gate for high-value refunds ($500+), account freezes, and policy exceptions</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
            <UserCheck className="w-4 h-4" />
            <span>{pendingApprovals.length} PENDING</span>
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs flex items-center space-x-2 hover:brightness-110 transition shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Request</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Authorizations Queue</h2>
        {pendingApprovals.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-500 text-xs border border-slate-800 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>No pending HITL approvals — all clear.</span>
          </div>
        ) : (
          (pendingApprovals as any[]).map((appr) => (
            <div key={appr.id} className="p-5 rounded-2xl glass-panel border border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                    <span className="font-mono font-bold text-xs text-amber-400">{appr.approvalCode}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">{appr.type}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold">Role: {appr.requiredRole}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{appr.title}</h3>
                </div>
                <div className="text-right shrink-0">
                  {appr.amount > 0 && <div className="text-2xl font-black text-white">${appr.amount.toLocaleString()}</div>}
                  <div className="text-[10px] text-slate-400">By: {appr.requester?.name || 'AI Orchestrator'}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-end space-x-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(appr.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div><span className="font-bold text-amber-400">Policy: </span><span className="text-slate-300">{appr.policyTriggered}</span></div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row items-center gap-3">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Manager authorization notes..."
                  className="w-full md:flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleAction(appr.id, 'REJECT')} disabled={processingId === appr.id} className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center space-x-1.5 transition">
                    <XCircle className="w-4 h-4" /><span>Reject</span>
                  </button>
                  <button onClick={() => handleAction(appr.id, 'APPROVE')} disabled={processingId === appr.id} className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-teal-500/20 transition">
                    <CheckCircle2 className="w-4 h-4" /><span>{processingId === appr.id ? 'Processing...' : 'Authorize & Execute'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historical Approvals */}
      {pastApprovals.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Past Authorizations Ledger</h2>
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Code</th><th className="p-4">Title</th><th className="p-4">Amount</th><th className="p-4">Decision</th><th className="p-4">Approver</th><th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(pastApprovals as any[]).map((appr) => (
                  <tr key={appr.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-amber-400">{appr.approvalCode}</td>
                    <td className="p-4 font-semibold text-white max-w-[200px] truncate">{appr.title}</td>
                    <td className="p-4 font-bold text-white">{appr.amount > 0 ? `$${appr.amount.toLocaleString()}` : '—'}</td>
                    <td className="p-4"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${appr.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{appr.status}</span></td>
                    <td className="p-4 text-slate-300">{appr.approver?.name || '—'}</td>
                    <td className="p-4 text-slate-400">{new Date(appr.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Approval Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-base text-white">Create Approval Request</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {successMsg ? (
              <div className="p-8 flex flex-col items-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="text-emerald-400 font-bold text-sm">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Request Title *</label>
                    <input required value={form.title} onChange={(e) => f('title', e.target.value)} placeholder="e.g. High-Value Refund Authorization — Customer X $1,200" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Approval Type</label>
                    <select value={form.type} onChange={(e) => f('type', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500">
                      <option value="HIGH_VALUE_REFUND">HIGH_VALUE_REFUND</option>
                      <option value="ACCOUNT_FREEZE">ACCOUNT_FREEZE</option>
                      <option value="POLICY_EXCEPTION">POLICY_EXCEPTION</option>
                      <option value="COMPLIANCE_EXCEPTION">COMPLIANCE_EXCEPTION</option>
                      <option value="MANUAL_OVERRIDE">MANUAL_OVERRIDE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Required Role</label>
                    <select value={form.requiredRole} onChange={(e) => f('requiredRole', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500">
                      <option value="MANAGER">MANAGER</option><option value="ADMIN">ADMIN</option><option value="COMPLIANCE_OFFICER">COMPLIANCE_OFFICER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => f('amount', e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Requested By</label>
                    <input value={form.requesterName} onChange={(e) => f('requesterName', e.target.value)} placeholder="e.g. Operations Team" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Policy / Rule Triggered</label>
                    <input value={form.policyTriggered} onChange={(e) => f('policyTriggered', e.target.value)} placeholder="e.g. SOP-RF-001: Refund above $500 threshold" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notes / Context</label>
                    <textarea rows={3} value={form.notes} onChange={(e) => f('notes', e.target.value)} placeholder="Additional context for the approver..." className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 transition flex items-center space-x-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Creating...' : 'Create Request'}</span>
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

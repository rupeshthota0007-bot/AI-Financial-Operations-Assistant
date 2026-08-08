import React, { useState } from 'react';
import { ShieldAlert, MapPin, Laptop, Lock, TrendingUp, AlertOctagon, Activity, Plus, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';

const MOCK_FRAUD_CASES = [
  { id: 'fc-001', caseCode: 'FC-2024-0091', riskLevel: 'CRITICAL', riskScore: 97, velocityScore: 99, triggerReason: 'Tor Proxy IP detected — 14 rapid-fire transactions in 90 seconds', status: 'OPEN', createdAt: new Date().toISOString(), customer: { name: 'Michael Scott (CUST-4421)', customerCode: 'CUST-4421' }, transaction: { location: 'Onion Router Node / Unknown', ipAddress: '185.220.101.47', deviceId: 'UNK-FINGERPRINT-9x2' } },
  { id: 'fc-002', caseCode: 'FC-2024-0088', riskLevel: 'HIGH', riskScore: 82, velocityScore: 76, triggerReason: 'Geo mismatch — Account registered US, transaction attempted from Lagos, NG', status: 'UNDER_REVIEW', createdAt: new Date(Date.now() - 3600000).toISOString(), customer: { name: 'Acme Corp (CUST-8910)', customerCode: 'CUST-8910' }, transaction: { location: 'Lagos, Nigeria', ipAddress: '102.89.47.12', deviceId: 'MOB-ANDROID-7a3' } },
  { id: 'fc-003', caseCode: 'FC-2024-0085', riskLevel: 'MEDIUM', riskScore: 61, velocityScore: 54, triggerReason: 'Unusual spending pattern — 3x above 90-day average in 2 hours', status: 'BLOCKED', createdAt: new Date(Date.now() - 7200000).toISOString(), customer: { name: 'Stark Industries (CUST-9920)', customerCode: 'CUST-9920' }, transaction: { location: 'New York, US', ipAddress: '104.18.22.19', deviceId: 'WIN-CHROME-aa1' } },
  { id: 'fc-004', caseCode: 'FC-2024-0079', riskLevel: 'HIGH', riskScore: 88, velocityScore: 91, triggerReason: 'Card testing attack — 32 micro-transactions of $0.01 in 4 minutes', status: 'OPEN', createdAt: new Date(Date.now() - 1800000).toISOString(), customer: { name: 'Unknown / Guest Checkout', customerCode: 'CUST-0000' }, transaction: { location: 'Frankfurt, Germany', ipAddress: '88.99.48.52', deviceId: 'BOT-HEADLESS-3f7' } },
];

const EMPTY_FORM = { customerName: '', customerCode: '', triggerReason: '', riskLevel: 'HIGH', riskScore: '', velocityScore: '', ipAddress: '', location: '', deviceId: '', status: 'OPEN' };

export const FraudDashboard: React.FC = () => {
  const { fraudCases, setFraudCases } = useStore();
  const [localCases, setLocalCases] = useState(MOCK_FRAUD_CASES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const displayCases: any[] = fraudCases.length > 0 ? fraudCases : localCases;
  const f = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleUpdateStatus = async (id: string, status: string, resolution: string) => {
    try {
      await api.updateFraudCase(id, status, resolution);
      const res = await api.getFraudCases();
      setFraudCases(res.fraudCases);
    } catch {
      setLocalCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    }
    alert(`✓ Fraud case updated to ${status}. Customer account modified accordingly.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.triggerReason || !form.customerName) return;
    setSubmitting(true);
    const newCase: any = {
      id: `fc-${Date.now()}`,
      caseCode: `FC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      riskLevel: form.riskLevel,
      riskScore: parseInt(form.riskScore) || 75,
      velocityScore: parseInt(form.velocityScore) || 60,
      triggerReason: form.triggerReason,
      status: form.status,
      createdAt: new Date().toISOString(),
      customer: { name: form.customerName, customerCode: form.customerCode || 'CUST-NEW' },
      transaction: { location: form.location || 'Unknown', ipAddress: form.ipAddress || 'Unknown', deviceId: form.deviceId || 'Unknown' },
    };
    setLocalCases((prev) => [newCase, ...prev]);
    setSuccessMsg(`✓ Fraud case ${newCase.caseCode} reported successfully!`);
    setTimeout(() => { setSuccessMsg(''); setShowModal(false); setForm(EMPTY_FORM); }, 1800);
    setSubmitting(false);
  };

  const critical = displayCases.filter((c) => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length;
  const open = displayCases.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_REVIEW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Fraud Operations &amp; Risk Heatmap</h1>
          <p className="text-xs text-slate-400">Real-time velocity attack detection, Tor proxy alerts, and automated defensive account locks</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>VELOCITY PROTECTION ACTIVE</span>
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs flex items-center space-x-2 hover:brightness-110 transition shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Report Case</span>
          </button>
        </div>
      </div>

      {/* Stat Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Cases', value: displayCases.length, color: 'text-white', bg: 'border-slate-800' },
          { label: 'Critical / High', value: critical, color: 'text-rose-400', bg: 'border-rose-500/30' },
          { label: 'Open / Review', value: open, color: 'text-amber-400', bg: 'border-amber-500/30' },
          { label: 'Fraud Prevented', value: '$13,950', color: 'text-emerald-400', bg: 'border-emerald-500/30' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl glass-card border ${s.bg} space-y-1`}>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">{s.label}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Fraud Case Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayCases.map((fCase: any) => {
          const isHigh = fCase.riskLevel === 'CRITICAL' || fCase.riskLevel === 'HIGH';
          return (
            <div key={fCase.id} className={`p-5 rounded-2xl glass-panel border transition space-y-4 ${isHigh ? 'border-rose-500/40 bg-rose-950/20' : 'border-amber-500/30 bg-amber-950/10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className="font-mono font-bold text-xs text-rose-400">{fCase.caseCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    fCase.riskLevel === 'CRITICAL' ? 'bg-rose-500/30 text-rose-200' :
                    fCase.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>{fCase.riskLevel} RISK ({fCase.riskScore}/100)</span>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(fCase.createdAt).toLocaleTimeString()}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{fCase.triggerReason}</span>
                </h3>
                <p className="text-xs text-slate-400">Target: {fCase.customer?.name} ({fCase.customer?.customerCode})</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{fCase.transaction?.location || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{fCase.transaction?.deviceId || 'Unknown Device'}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 col-span-2">
                  <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>IP: {fCase.transaction?.ipAddress || 'Unknown'}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] text-cyan-400 font-semibold">Velocity: {fCase.velocityScore}/100</span>
                </div>
                {fCase.status !== 'BLOCKED' ? (
                  <button onClick={() => handleUpdateStatus(fCase.id, 'BLOCKED', 'Defensive lock by Fraud Analyst')} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-rose-500/20">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Freeze &amp; Lock</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-rose-400 flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-900/30 border border-rose-500/30">
                    <Lock className="w-3.5 h-3.5" />
                    <span>FROZEN</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Fraud Case Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h2 className="font-bold text-base text-white">Report New Fraud Case</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            {successMsg ? (
              <div className="p-8 flex flex-col items-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="text-emerald-400 font-bold text-sm">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Name *</label>
                    <input required value={form.customerName} onChange={(e) => f('customerName', e.target.value)} placeholder="e.g. John Doe" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Code</label>
                    <input value={form.customerCode} onChange={(e) => f('customerCode', e.target.value)} placeholder="CUST-XXXX" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trigger Reason / Description *</label>
                    <input required value={form.triggerReason} onChange={(e) => f('triggerReason', e.target.value)} placeholder="e.g. Multiple failed login attempts from suspicious IP" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Level</label>
                    <select value={form.riskLevel} onChange={(e) => f('riskLevel', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500">
                      <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Initial Status</label>
                    <select value={form.status} onChange={(e) => f('status', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500">
                      <option value="OPEN">OPEN</option><option value="UNDER_REVIEW">UNDER_REVIEW</option><option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Score (0–100)</label>
                    <input type="number" min="0" max="100" value={form.riskScore} onChange={(e) => f('riskScore', e.target.value)} placeholder="e.g. 85" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Velocity Score (0–100)</label>
                    <input type="number" min="0" max="100" value={form.velocityScore} onChange={(e) => f('velocityScore', e.target.value)} placeholder="e.g. 90" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Suspicious IP Address</label>
                    <input value={form.ipAddress} onChange={(e) => f('ipAddress', e.target.value)} placeholder="e.g. 185.220.101.47" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Transaction Location</label>
                    <input value={form.location} onChange={(e) => f('location', e.target.value)} placeholder="e.g. Lagos, Nigeria" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Device Fingerprint / ID</label>
                    <input value={form.deviceId} onChange={(e) => f('deviceId', e.target.value)} placeholder="e.g. MOB-ANDROID-7a3" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 transition flex items-center space-x-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Reporting...' : 'Report Fraud Case'}</span>
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

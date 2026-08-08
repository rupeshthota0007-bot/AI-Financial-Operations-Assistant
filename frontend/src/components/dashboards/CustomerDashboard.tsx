import React, { useState } from 'react';
import { Users, Shield, CreditCard, Ticket, Plus, X, CheckCircle2, Edit3 } from 'lucide-react';
import { useStore } from '../../store/useStore';

const DEFAULT_CUSTOMERS = [
  { customerCode: 'CUST-8910', name: 'Acme Corp (John Doe)', email: 'john.doe@acme.com', tier: 'VIP', riskScore: 12.5, accountStatus: 'ACTIVE', totalSpent: 48900.0, kycStatus: 'VERIFIED', country: 'US', phone: '+1-555-0101' },
  { customerCode: 'CUST-4421', name: 'Michael Scott Paper Co', email: 'm.scott@dundermifflin.com', tier: 'HIGH_RISK', riskScore: 84.0, accountStatus: 'UNDER_REVIEW', totalSpent: 1240.0, kycStatus: 'PENDING_DOCS', country: 'NG', phone: '+1-555-0155' },
  { customerCode: 'CUST-9920', name: 'Stark Industries', email: 'tony@stark.com', tier: 'CORPORATE', riskScore: 5.0, accountStatus: 'ACTIVE', totalSpent: 245000.0, kycStatus: 'VERIFIED', country: 'US', phone: '+1-555-0199' },
];

const EMPTY_FORM = { name: '', email: '', phone: '', tier: 'STANDARD', country: 'US', kycStatus: 'PENDING_DOCS', accountStatus: 'ACTIVE', totalSpent: '', riskScore: '' };

export const CustomerDashboard: React.FC = () => {
  const { tickets, transactions } = useStore();
  const [customerList, setCustomerList] = useState(DEFAULT_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState(DEFAULT_CUSTOMERS[0]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const f = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSubmitting(true);
    const newCust = {
      customerCode: `CUST-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      tier: form.tier,
      riskScore: parseFloat(form.riskScore) || 10,
      accountStatus: form.accountStatus,
      totalSpent: parseFloat(form.totalSpent) || 0,
      kycStatus: form.kycStatus,
      country: form.country,
    };
    setCustomerList((prev) => [newCust, ...prev]);
    setSelectedCustomer(newCust);
    setSuccessMsg(`✓ Customer ${newCust.customerCode} added successfully!`);
    setTimeout(() => { setSuccessMsg(''); setShowModal(false); setForm(EMPTY_FORM); }, 1800);
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Customer 360° View</h1>
          <p className="text-xs text-slate-400">Unified Salesforce CRM profiles with KYC, risk, spend, and ticket history</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center space-x-2 hover:brightness-110 transition shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Selector Sidebar */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm text-white">CRM Profiles ({customerList.length})</h2>
          </div>
          <div className="space-y-2">
            {customerList.map((cust) => {
              const isSelected = selectedCustomer.customerCode === cust.customerCode;
              return (
                <div
                  key={cust.customerCode}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white truncate">{cust.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ml-1 ${
                      cust.tier === 'VIP' ? 'bg-amber-500/20 text-amber-400' :
                      cust.tier === 'HIGH_RISK' ? 'bg-rose-500/20 text-rose-400' :
                      cust.tier === 'CORPORATE' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>{cust.tier}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{cust.email}</div>
                  <div className="mt-2 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Risk: {cust.riskScore}/100</span>
                    <span className="font-bold text-white">${cust.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unified 360 Detail View */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-slate-800">
            <div>
              <span className="font-mono text-xs font-bold text-blue-400">{selectedCustomer.customerCode}</span>
              <h2 className="text-xl font-bold text-white mt-0.5">{selectedCustomer.name}</h2>
              <p className="text-xs text-slate-400">{selectedCustomer.email}</p>
              {(selectedCustomer as any).phone && <p className="text-xs text-slate-500">{(selectedCustomer as any).phone}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedCustomer.accountStatus === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                ACCOUNT {selectedCustomer.accountStatus}
              </span>
              <span className="text-[10px] text-slate-500">Country: {(selectedCustomer as any).country || 'N/A'}</span>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl glass-card border border-slate-800 text-xs">
              <div className="text-slate-500 text-[10px]">Total Lifetime Spend</div>
              <div className="font-black text-base text-white mt-1">${selectedCustomer.totalSpent.toLocaleString()}</div>
            </div>
            <div className="p-3.5 rounded-xl glass-card border border-slate-800 text-xs">
              <div className="text-slate-500 text-[10px]">Fraud Risk Index</div>
              <div className={`font-black text-base mt-1 ${selectedCustomer.riskScore > 70 ? 'text-rose-400' : selectedCustomer.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedCustomer.riskScore}/100</div>
            </div>
            <div className="p-3.5 rounded-xl glass-card border border-slate-800 text-xs">
              <div className="text-slate-500 text-[10px]">KYC Verification</div>
              <div className={`font-black text-base mt-1 ${selectedCustomer.kycStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedCustomer.kycStatus}</div>
            </div>
            <div className="p-3.5 rounded-xl glass-card border border-slate-800 text-xs">
              <div className="text-slate-500 text-[10px]">Account Tier</div>
              <div className="font-black text-base text-amber-400 mt-1">{selectedCustomer.tier}</div>
            </div>
          </div>

          {/* Ticket History */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-blue-400" />
              <span>Recent Dispute Tickets</span>
            </h3>
            <div className="space-y-2">
              {(tickets.length > 0 ? tickets : [
                { id: 'tk-001', subject: 'Duplicate Charge — $2,800 Refund Request', ticketCode: 'TKT-2024-0091', status: 'OPEN' },
                { id: 'tk-003', subject: 'Suspicious Transactions Alert', ticketCode: 'TKT-2024-0085', status: 'ESCALATED' },
              ]).slice(0, 4).map((t: any) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-white">{t.subject}</div>
                    <div className="text-[10px] text-slate-500">Code: {t.ticketCode}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'ESCALATED' ? 'bg-rose-500/20 text-rose-400' :
                    t.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'
                  }`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Recent Transactions</span>
            </h3>
            <div className="space-y-2">
              {(transactions.length > 0 ? transactions : [
                { id: 'tx-001', txCode: 'TXN-20240892', amount: 1250, currency: 'USD', status: 'SETTLED' },
                { id: 'tx-004', txCode: 'TXN-20240876', amount: 2800, currency: 'USD', status: 'REFUNDED' },
              ]).slice(0, 4).map((t: any) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-blue-400">{t.txCode}</div>
                    <div className="font-bold text-white">${t.amount?.toLocaleString()} {t.currency}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'REFUNDED' ? 'bg-purple-500/20 text-purple-400' :
                    t.status === 'SETTLED' || t.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-base text-white">Add New Customer Profile</h2>
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
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name / Company *</label>
                    <input required value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="e.g. Globex Corporation" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address *</label>
                    <input required type="email" value={form.email} onChange={(e) => f('email', e.target.value)} placeholder="contact@company.com" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input value={form.phone} onChange={(e) => f('phone', e.target.value)} placeholder="+1-555-0100" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Tier</label>
                    <select value={form.tier} onChange={(e) => f('tier', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option value="STANDARD">STANDARD</option><option value="VIP">VIP</option><option value="CORPORATE">CORPORATE</option><option value="HIGH_RISK">HIGH_RISK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Country Code</label>
                    <input value={form.country} onChange={(e) => f('country', e.target.value)} placeholder="US, IN, UK, NG..." className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">KYC Status</label>
                    <select value={form.kycStatus} onChange={(e) => f('kycStatus', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option value="VERIFIED">VERIFIED</option><option value="PENDING_DOCS">PENDING_DOCS</option><option value="UNDER_REVIEW">UNDER_REVIEW</option><option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Status</label>
                    <select value={form.accountStatus} onChange={(e) => f('accountStatus', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option value="ACTIVE">ACTIVE</option><option value="UNDER_REVIEW">UNDER_REVIEW</option><option value="SUSPENDED">SUSPENDED</option><option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Spend ($)</label>
                    <input type="number" min="0" value={form.totalSpent} onChange={(e) => f('totalSpent', e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Score (0–100)</label>
                    <input type="number" min="0" max="100" value={form.riskScore} onChange={(e) => f('riskScore', e.target.value)} placeholder="e.g. 15" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 transition flex items-center space-x-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Adding...' : 'Add Customer'}</span>
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

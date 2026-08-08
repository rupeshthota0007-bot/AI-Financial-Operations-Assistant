import React, { useState } from 'react';
import { CreditCard, RefreshCw, CheckCircle2, AlertCircle, DollarSign, TrendingDown, Plus, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';

const MOCK_TRANSACTIONS = [
  { id: 'tx-001', txCode: 'TXN-20240892', customer: { name: 'Acme Corp (John Doe)', customerCode: 'CUST-8910' }, amount: 1250.00, currency: 'USD', paymentMethod: 'Visa •••• 4242', status: 'SETTLED', riskScore: 12, createdAt: new Date().toISOString() },
  { id: 'tx-002', txCode: 'TXN-20240887', customer: { name: 'Stark Industries', customerCode: 'CUST-9920' }, amount: 8900.00, currency: 'USD', paymentMethod: 'Wire Transfer', status: 'COMPLETED', riskScore: 5, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'tx-003', txCode: 'TXN-20240881', customer: { name: 'Michael Scott Paper Co', customerCode: 'CUST-4421' }, amount: 340.50, currency: 'USD', paymentMethod: 'Mastercard •••• 8811', status: 'PENDING', riskScore: 84, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'tx-004', txCode: 'TXN-20240876', customer: { name: 'Acme Corp (John Doe)', customerCode: 'CUST-8910' }, amount: 2800.00, currency: 'USD', paymentMethod: 'Visa •••• 4242', status: 'REFUNDED', riskScore: 18, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'tx-005', txCode: 'TXN-20240871', customer: { name: 'Globex Corporation', customerCode: 'CUST-7718' }, amount: 5500.00, currency: 'USD', paymentMethod: 'AMEX •••• 3771', status: 'SETTLED', riskScore: 22, createdAt: new Date(Date.now() - 28800000).toISOString() },
];

const EMPTY_TX = { customerName: '', customerCode: '', amount: '', currency: 'USD', paymentMethod: 'Credit Card', status: 'PENDING', riskScore: '' };

export const PaymentDashboard: React.FC = () => {
  const { transactions, setTransactions } = useStore();
  const [localTxs, setLocalTxs] = useState(MOCK_TRANSACTIONS);
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_TX);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const displayTxs: any[] = transactions.length > 0 ? transactions : localTxs;
  const total = displayTxs.reduce((sum, t: any) => sum + t.amount, 0);
  const refunded = displayTxs.filter((t: any) => t.status === 'REFUNDED').length;
  const pending = displayTxs.filter((t: any) => t.status === 'PENDING').length;

  const f = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleManualRefund = async (txId: string, amount: number) => {
    if (!confirm(`Confirm: Process manual refund of $${amount.toLocaleString()}?`)) return;
    setProcessingTxId(txId);
    try {
      await api.processRefund(txId, amount, 'Manual Ops Manager Override');
      const res = await api.getTransactions();
      setTransactions(res.transactions);
    } catch {
      setLocalTxs((prev) => prev.map((t) => (t.id === txId ? { ...t, status: 'REFUNDED' } : t)));
    } finally {
      setProcessingTxId(null);
    }
    alert(`✓ Refund of $${amount.toLocaleString()} processed via Payment Gateway!`);
  };

  const handleRefresh = async () => {
    try {
      const res = await api.getTransactions();
      setTransactions(res.transactions);
    } catch { }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.amount) return;
    setSubmitting(true);
    const newTx: any = {
      id: `tx-${Date.now()}`,
      txCode: `TXN-${Date.now().toString().slice(-8)}`,
      customer: { name: form.customerName, customerCode: form.customerCode || 'CUST-NEW' },
      amount: parseFloat(form.amount),
      currency: form.currency,
      paymentMethod: form.paymentMethod,
      status: form.status,
      riskScore: parseInt(form.riskScore) || 10,
      createdAt: new Date().toISOString(),
    };
    try {
      await api.getTransactions(); // ping backend
    } catch { }
    setLocalTxs((prev) => [newTx, ...prev]);
    setSuccessMsg(`✓ Transaction ${newTx.txCode} recorded!`);
    setTimeout(() => { setSuccessMsg(''); setShowModal(false); setForm(EMPTY_TX); }, 1800);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Payment Systems &amp; Refund Ledger</h1>
          <p className="text-xs text-slate-400">Real-time Stripe Gateway transactions, duplicate detection, and settlement status</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleRefresh} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center space-x-2 hover:brightness-110 transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Volume', value: `$${total.toLocaleString()}`, icon: DollarSign, color: 'text-white', border: 'border-slate-800' },
          { label: 'Transactions', value: displayTxs.length, icon: CreditCard, color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: 'Refunded', value: refunded, icon: TrendingDown, color: 'text-purple-400', border: 'border-purple-500/20' },
          { label: 'Pending Review', value: pending, icon: AlertCircle, color: 'text-amber-400', border: 'border-amber-500/20' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl glass-card border ${s.border} flex items-center space-x-3`}>
            <s.icon className={`w-6 h-6 ${s.color} opacity-70`} />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">{s.label}</div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction Code</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Gateway Status</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayTxs.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-blue-400">{tx.txCode}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{tx.customer?.name || 'Customer'}</div>
                    <div className="text-[10px] text-slate-500">{tx.customer?.customerCode}</div>
                  </td>
                  <td className="p-4 font-bold text-white">${tx.amount.toLocaleString()} {tx.currency}</td>
                  <td className="p-4 text-slate-300">{tx.paymentMethod}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      tx.status === 'REFUNDED' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      tx.status === 'SETTLED' || tx.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>{tx.status}</span>
                  </td>
                  <td className={`p-4 font-bold ${tx.riskScore > 70 ? 'text-rose-400' : tx.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{tx.riskScore}/100</td>
                  <td className="p-4 text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {tx.status !== 'REFUNDED' ? (
                      <button
                        onClick={() => handleManualRefund(tx.id, tx.amount)}
                        disabled={processingTxId === tx.id}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-[10px] font-bold transition"
                      >
                        {processingTxId === tx.id ? 'Processing...' : 'Process Refund'}
                      </button>
                    ) : (
                      <span className="flex items-center justify-end space-x-1 text-[10px] text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Refunded</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-base text-white">Add New Transaction</h2>
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Name *</label>
                    <input required value={form.customerName} onChange={(e) => f('customerName', e.target.value)} placeholder="e.g. Acme Corp" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Code</label>
                    <input value={form.customerCode} onChange={(e) => f('customerCode', e.target.value)} placeholder="CUST-XXXX" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount (USD) *</label>
                    <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => f('amount', e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Currency</label>
                    <select value={form.currency} onChange={(e) => f('currency', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option><option>SGD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Method</label>
                    <select value={form.paymentMethod} onChange={(e) => f('paymentMethod', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option>Credit Card</option><option>Debit Card</option><option>Wire Transfer</option><option>UPI</option><option>NEFT</option><option>SWIFT</option><option>AMEX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select value={form.status} onChange={(e) => f('status', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500">
                      <option value="PENDING">PENDING</option><option value="SETTLED">SETTLED</option><option value="COMPLETED">COMPLETED</option><option value="FAILED">FAILED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Score (0–100)</label>
                    <input type="number" min="0" max="100" value={form.riskScore} onChange={(e) => f('riskScore', e.target.value)} placeholder="e.g. 25" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 transition flex items-center space-x-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Saving...' : 'Add Transaction'}</span>
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

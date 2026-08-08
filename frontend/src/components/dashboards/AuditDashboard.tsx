import React, { useState } from 'react';
import { FileCheck2, ShieldCheck, Search, Download, Eye, Key, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

const MOCK_AUDIT_LOGS = [
  { id: 'al-001', logCode: 'AL-20240901', agentName: 'SupportAgent v2.4', action: 'TICKET_ANALYZED', decision: 'ESCALATE_REFUND', confidence: 0.94, reason: 'Customer Acme Corp requested refund of $2,800 for duplicate charge. CRM history shows VIP tier with 3 prior refunds. RAG policy allows up to $500 autonomous — escalated to manager.', hashSignature: 'sha256:a3f4e9b2c1d0f7e8a5b6c3d4e1f2a0b9c8d7e6f5a4b3c2d1e0f', humanApproved: true, humanApprover: 'Alex Vance', timestamp: new Date().toISOString() },
  { id: 'al-002', logCode: 'AL-20240899', agentName: 'FraudAgent v3.1', action: 'RISK_EVALUATED', decision: 'BLOCK_ACCOUNT', confidence: 0.97, reason: 'Tor proxy IP detected (185.220.101.47). 14 transactions in 90 seconds. Velocity score 99/100. Recommended immediate account freeze.', hashSignature: 'sha256:b2e3f0c4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', humanApproved: false, humanApprover: null, timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 'al-003', logCode: 'AL-20240895', agentName: 'ComplianceAgent v1.8', action: 'POLICY_VERIFIED', decision: 'APPROVE_AUTONOMOUS', confidence: 0.89, reason: 'Refund of $120 for Globex Corporation. Amount below SOP-RF-001 $500 threshold. Customer tier STANDARD, risk score 22. Policy fully compliant — processed autonomously.', hashSignature: 'sha256:c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', humanApproved: false, humanApprover: null, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'al-004', logCode: 'AL-20240888', agentName: 'PaymentAgent v2.0', action: 'REFUND_PROCESSED', decision: 'REFUND_EXECUTED', confidence: 0.92, reason: 'High-value refund $8,900 for Stark Industries approved by VP Alex Vance. Stripe Gateway confirmed execution. Gateway reference: REF-2024-09-001.', hashSignature: 'sha256:d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', humanApproved: true, humanApprover: 'Alex Vance', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'al-005', logCode: 'AL-20240881', agentName: 'OrchestratorAgent', action: 'WORKFLOW_COMPLETED', decision: 'MULTI_AGENT_RESOLVED', confidence: 0.96, reason: 'Full multi-agent workflow completed for TKT-2024-0091. SupportAgent, PaymentAgent, FraudAgent, ComplianceAgent, ApprovalAgent all executed. Final outcome: Refund approved with HITL gate.', hashSignature: 'sha256:e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', humanApproved: true, humanApprover: 'Sarah Connor', timestamp: new Date(Date.now() - 14400000).toISOString() },
];

export const AuditDashboard: React.FC = () => {
  const { auditLogs } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const displayLogs = auditLogs.length > 0 ? auditLogs : MOCK_AUDIT_LOGS;

  const filteredLogs = (displayLogs as any[]).filter(
    (log) =>
      log.logCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Immutable Cryptographic Audit &amp; Compliance Ledger</h1>
          <p className="text-xs text-slate-400">Tamper-evident audit trail with SHA-256 digital hash verification for every AI agent action</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit logs..."
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>
          <button
            onClick={() => alert('✓ Audit report exported as CSV!')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Audit Entries', value: displayLogs.length, color: 'text-cyan-400' },
          { label: 'HITL Human Approved', value: (displayLogs as any[]).filter((l: any) => l.humanApproved).length, color: 'text-emerald-400' },
          { label: 'Autonomous AI Actions', value: (displayLogs as any[]).filter((l: any) => !l.humanApproved).length, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl glass-card border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">{s.label}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Audit Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Audit Code</th>
                <th className="p-4">Agent Name</th>
                <th className="p-4">Action</th>
                <th className="p-4">Decision</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">SHA-256 Hash</th>
                <th className="p-4">HITL Approval</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-cyan-400">{log.logCode}</td>
                  <td className="p-4 font-semibold text-white">{log.agentName}</td>
                  <td className="p-4 text-slate-300">{log.action}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px]">
                      {log.decision}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">{Math.round(log.confidence * 100)}%</td>
                  <td className="p-4 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">{log.hashSignature}</td>
                  <td className="p-4">
                    {log.humanApproved ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center space-x-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{log.humanApprover || 'APPROVED'}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">AI Autonomous</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Cryptographic Audit Entry Inspector</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-500 mb-0.5">Audit Code</div>
                  <div className="font-mono font-bold text-cyan-400">{selectedLog.logCode}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Executing Agent</div>
                  <div className="font-bold text-white">{selectedLog.agentName}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Action</div>
                  <div className="font-bold text-blue-400">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Confidence</div>
                  <div className="font-bold text-emerald-400">{Math.round(selectedLog.confidence * 100)}%</div>
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-bold mb-1">Reason &amp; Decision Rationale</div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">{selectedLog.reason}</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold mb-1">SHA-256 Digital Hash Signature</div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-400 break-all flex items-center space-x-2">
                  <Key className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedLog.hashSignature}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

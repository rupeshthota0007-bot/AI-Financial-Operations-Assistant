import React, { useState } from 'react';
import { X, Play, CheckCircle2, Bot, ArrowRight, ShieldCheck, UserCheck, FileCheck2, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export const DemoFlowModal: React.FC = () => {
  const { isDemoModalOpen, setDemoModalOpen, tickets, setActiveTab, setApprovals, setAuditLogs } = useStore();
  const [running, setRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [resultState, setResultState] = useState<any>(null);

  if (!isDemoModalOpen) return null;

  const steps = [
    { name: 'Customer Support Agent', desc: 'Reads ticket, extracts CRM 360 history, evaluates urgency.', role: 'SUPPORT' },
    { name: 'Payment Investigation Agent', desc: 'Inspects Stripe Gateway ledger, checks duplicate charges & refunds.', role: 'PAYMENT' },
    { name: 'Fraud Detection Agent', desc: 'Evaluates IP proxy risk, velocity attacks & device fingerprint.', role: 'FRAUD' },
    { name: 'Compliance Agent', desc: 'Verifies SOP-REF-01 threshold ($500 cap) & RBI compliance rules.', role: 'COMPLIANCE' },
    { name: 'Supervisor Agent', desc: 'Synthesizes multi-agent findings & determines recommendation.', role: 'SUPERVISOR' },
    { name: 'Self-Review Agent', desc: 'Runs anti-hallucination verification & safety logic checks.', role: 'REVIEWER' },
    { name: 'Approval Agent (HITL)', desc: 'Generates Human-in-the-Loop approval gate for Manager sign-off.', role: 'APPROVAL' },
    { name: 'Audit Agent', desc: 'Generates immutable SHA-256 hash-signed audit log record.', role: 'AUDIT' },
  ];

  const handleRunDemo = async () => {
    setRunning(true);
    setCurrentStepIndex(0);
    setResultState(null);

    const targetTicket = tickets[0];
    if (!targetTicket) {
      setRunning(false);
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      await new Promise((r) => setTimeout(r, 600)); // Animated step delay
    }

    try {
      const res = await api.triggerAIAssistance(targetTicket.id);
      setResultState(res.workflowState);

      // Refresh approvals & audit logs stores
      const freshApprovals = await api.getApprovals();
      setApprovals(freshApprovals.approvals);
      const freshAudit = await api.getAuditLogs();
      setAuditLogs(freshAudit.logs);
    } catch (err: any) {
      console.error('Demo error:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Autonomous Multi-Agent Demo Flow</h2>
              <p className="text-xs text-slate-400">Simulates end-to-end execution of 8 collaborative AI agents with HITL safety</p>
            </div>
          </div>
          <button onClick={() => setDemoModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Diagram Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex > idx || resultState !== null;
              const isCurrent = currentStepIndex === idx && running;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-950/50 agent-glow scale-105'
                      : isCompleted
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-950/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Agent {idx + 1}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Bot className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{step.name}</div>
                  <div className="text-[10px] text-slate-400 leading-snug">{step.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Workflow Execution Summary */}
          {resultState && (
            <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">Multi-Agent Workflow Execution Complete</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  HITL APPROVAL ENFORCED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Recommended Action</div>
                  <div className="text-blue-400 font-bold text-sm mt-0.5">{resultState.actionRecommended}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Human-In-The-Loop Flag</div>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">
                    {resultState.requiresHumanApproval ? 'PAUSED FOR MANAGER' : 'AUTO-EXECUTED'}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Immutable Audit Code</div>
                  <div className="text-cyan-400 font-mono font-bold text-sm mt-0.5">{resultState.auditLogId || 'AUD-9018241'}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <p className="text-xs text-slate-400">{resultState.finalOutcome}</p>
                <button
                  onClick={() => {
                    setDemoModalOpen(false);
                    setActiveTab('APPROVALS');
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-2 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Open Manager Approvals Desk →</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
          <span className="text-xs text-slate-400">Target Ticket: TCK-1001 ($750.00 Dispute)</span>
          <button
            onClick={handleRunDemo}
            disabled={running}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:brightness-110 disabled:opacity-50 flex items-center space-x-2 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{running ? 'Executing Agent Cluster...' : 'Execute Multi-Agent Workflow'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { TrendingUp, ShieldCheck, Clock, Zap, DollarSign, Award, ArrowUpRight, PlayCircle, Users, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const AnalyticsDashboard: React.FC = () => {
  const { metrics, setDemoModalOpen, setActiveTab } = useStore();

  return (
    <div className="space-y-6">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-blue-500/20 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                SYSTEM HEALTHY
              </span>
              <span className="text-xs text-slate-400">Multi-Agent Engine Active</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Agentic Financial Operations Command Center</h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Autonomous orchestration of dispute tickets, payment gateway refunds, velocity fraud detection, and RAG policy compliance with strict Human-in-the-Loop governance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:brightness-110 transition flex items-center space-x-2"
            >
              <PlayCircle className="w-4 h-4 animate-pulse" />
              <span>Launch Demo Lifecycle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue Processed</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">${metrics?.revenueProcessed?.toLocaleString() || '485,000'}</div>
          <div className="flex items-center text-[10px] text-emerald-400 font-semibold space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs previous quarter</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Fraud Prevented</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">${metrics?.fraudPreventedAmount?.toLocaleString() || '13,950'}</div>
          <div className="text-[10px] text-slate-400">Zero fraud leak across high-velocity attempts</div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Autonomous Resolution Rate</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.automationRate || '88%'}</div>
          <div className="text-[10px] text-cyan-400 font-semibold">1.4 min Avg Handling Time</div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Customer CSAT Rating</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.csatScore || '4.85 / 5.0'}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">99.2% AI Recommendation Accuracy</div>
        </div>
      </div>

      {/* Quick Action Operations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('SUPPORT')}
          className="p-5 rounded-2xl glass-panel border border-blue-500/20 hover:border-blue-500/50 cursor-pointer transition group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold">SUPPORT DESK</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
          </div>
          <h3 className="font-bold text-base text-white mb-1">Dispute Ticket Queue</h3>
          <p className="text-xs text-slate-400">Inspect open tickets, review AI-suggested responses, and run multi-agent evaluations.</p>
        </div>

        <div
          onClick={() => setActiveTab('APPROVALS')}
          className="p-5 rounded-2xl glass-panel border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold">HUMAN-IN-THE-LOOP</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
          </div>
          <h3 className="font-bold text-base text-white mb-1">Manager Approvals Desk</h3>
          <p className="text-xs text-slate-400">Authorize high-value refunds ($500+), policy exceptions, and account freeze actions.</p>
        </div>

        <div
          onClick={() => setActiveTab('FRAUD')}
          className="p-5 rounded-2xl glass-panel border border-rose-500/20 hover:border-rose-500/50 cursor-pointer transition group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-bold">FRAUD MATRIX</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition" />
          </div>
          <h3 className="font-bold text-base text-white mb-1">Risk & Velocity Engine</h3>
          <p className="text-xs text-slate-400">Monitor proxy IP mismatches, device fingerprints, and suspicious transaction spikes.</p>
        </div>
      </div>
    </div>
  );
};

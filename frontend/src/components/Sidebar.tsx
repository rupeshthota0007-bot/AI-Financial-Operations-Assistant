import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  CreditCard,
  ShieldAlert,
  UserCheck,
  FileCheck2,
  BookOpen,
  Users,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { TabType } from '../types';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tickets, approvals, fraudCases } = useStore();

  const openTicketsCount = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const criticalFraudCount = fraudCases.filter((f) => f.riskLevel === 'CRITICAL' || f.riskLevel === 'HIGH').length;

  const navItems: NavItem[] = [
    { id: 'OVERVIEW', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'SUPPORT', label: 'Support Queue', icon: Ticket, badge: openTicketsCount, badgeColor: 'bg-blue-500/20 text-blue-400' },
    { id: 'PAYMENTS', label: 'Payments & Refunds', icon: CreditCard },
    { id: 'FRAUD', label: 'Fraud Operations', icon: ShieldAlert, badge: criticalFraudCount, badgeColor: 'bg-rose-500/20 text-rose-400' },
    { id: 'APPROVALS', label: 'Manager Approvals', icon: UserCheck, badge: pendingApprovalsCount, badgeColor: 'bg-amber-500/20 text-amber-400 font-bold animate-pulse' },
    { id: 'AUDIT', label: 'Audit & Compliance', icon: FileCheck2 },
    { id: 'KNOWLEDGE', label: 'RAG Knowledge SOPs', icon: BookOpen },
    { id: 'CUSTOMER', label: 'Customer 360 View', icon: Users },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-xl flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 z-20">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Enterprise Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-xs transition ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Agent Status Footer Box */}
      <div className="p-4 m-3 rounded-xl glass-card border border-blue-500/20 bg-gradient-to-b from-slate-900/80 to-blue-950/30">
        <div className="flex items-center space-x-2 mb-2">
          <BrainCircuit className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-semibold text-white">Multi-Agent Engine</span>
        </div>
        <div className="text-[11px] text-slate-300 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Orchestrator:</span>
            <span className="text-emerald-400 font-mono text-[10px]">Supervisor v2.4</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Active Agents:</span>
            <span className="text-cyan-300 font-semibold text-[10px]">14 Specialized</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">HITL Approval:</span>
            <span className="text-amber-400 font-semibold text-[10px]">ENFORCED</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>OpenAI GPT-4.5</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">100% ONLINE</span>
        </div>
      </div>
    </aside>
  );
};

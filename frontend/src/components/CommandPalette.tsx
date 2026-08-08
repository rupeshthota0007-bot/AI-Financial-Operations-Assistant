import React, { useEffect, useState } from 'react';
import { Search, Ticket, CreditCard, ShieldAlert, UserCheck, BookOpen, Sparkles, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TabType } from '../types';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveTab, setCopilotOpen, setDemoModalOpen } = useStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    { title: 'Run End-to-End Multi-Agent Demo', tab: 'DEMO', icon: Sparkles, category: 'AI Orchestration' },
    { title: 'Go to Support Ticket Queue', tab: 'SUPPORT', icon: Ticket, category: 'Navigation' },
    { title: 'Go to Payments & Refunds Queue', tab: 'PAYMENTS', icon: CreditCard, category: 'Navigation' },
    { title: 'Go to Fraud Operations Desk', tab: 'FRAUD', icon: ShieldAlert, category: 'Navigation' },
    { title: 'Go to Manager Approvals Queue', tab: 'APPROVALS', icon: UserCheck, category: 'Navigation' },
    { title: 'View RAG Policy Knowledge Base', tab: 'KNOWLEDGE', icon: BookOpen, category: 'Compliance' },
    { title: 'Open AI Copilot Chat Drawer', tab: 'COPILOT', icon: Sparkles, category: 'AI Assistant' },
  ];

  const filtered = actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (action: (typeof actions)[0]) => {
    setCommandPaletteOpen(false);
    if (action.tab === 'DEMO') {
      setDemoModalOpen(true);
    } else if (action.tab === 'COPILOT') {
      setCopilotOpen(true);
    } else {
      setActiveTab(action.tab as TabType);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Search className="w-5 h-5 text-blue-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type command or jump to feature..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No matching commands found</div>
          ) : (
            filtered.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(act)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white">{act.title}</div>
                      <div className="text-[10px] text-slate-500">{act.category}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-400 font-mono">Jump →</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

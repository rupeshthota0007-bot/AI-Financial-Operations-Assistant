import React, { useState } from 'react';
import { Search, Bell, Sparkles, Command, ShieldCheck, PlayCircle, LogIn, LogOut, UserCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { LoginModal } from './LoginModal';

export const Navbar: React.FC = () => {
  const { setCopilotOpen, setCommandPaletteOpen, setDemoModalOpen, approvals, currentUser, logoutUser } = useStore();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : 'AV';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: Brand & Search */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-white">Agentic FinOps</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">Autonomous Financial Operations</p>
          </div>
        </div>

        {/* Global Search Command Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-slate-400 hover:border-slate-700 transition"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>Search everywhere or run command...</span>
          <kbd className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
            <Command className="w-3 h-3" />
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right: Demo trigger, Copilot Button & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Launch Live Demo Flow Button */}
        <button
          onClick={() => setDemoModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium text-xs shadow-lg shadow-teal-500/20 hover:brightness-110 transition active:scale-95"
        >
          <PlayCircle className="w-4 h-4 animate-pulse" />
          <span>Run End-to-End Demo</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={() => setCopilotOpen(true)}
          className="relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-xs shadow-lg shadow-blue-500/20 hover:brightness-110 transition"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>AI Copilot</span>
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button className="p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition">
            <Bell className="w-4 h-4" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        {/* User Profile & Account Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLoginOpen(true)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-800/60 border border-slate-800/60 transition group text-left"
            title="Switch User Account"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20 border border-blue-500/30 shrink-0">
              {initials}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center space-x-1">
                <span>{currentUser?.name || 'Alex Vance'}</span>
                <UserCheck className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-[10px] text-cyan-400 font-medium">{currentUser?.role || 'VP Financial Operations'}</div>
            </div>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => logoutUser()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/20 transition flex items-center space-x-1"
            title="Sign Out to Login Screen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
};

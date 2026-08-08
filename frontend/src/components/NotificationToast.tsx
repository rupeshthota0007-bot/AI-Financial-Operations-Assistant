import React from 'react';
import { ShieldAlert, Bell, CheckCircle2, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const NotificationToastContainer: React.FC = () => {
  const { notifications, removeNotification, setActiveTab } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`p-4 rounded-xl shadow-2xl glass-card border flex items-start space-x-3 transition animate-in slide-in-from-bottom-5 ${
            n.type === 'APPROVAL_REQUEST'
              ? 'border-amber-500/40 bg-amber-950/40'
              : n.type === 'FRAUD_ALERT'
              ? 'border-rose-500/40 bg-rose-950/40'
              : 'border-blue-500/40 bg-slate-900/90'
          }`}
        >
          {n.type === 'APPROVAL_REQUEST' ? (
            <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
          ) : n.type === 'FRAUD_ALERT' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="text-xs font-bold text-white mb-0.5">{n.title}</div>
            <div className="text-[11px] text-slate-300 leading-snug">{n.message}</div>
            {n.type === 'APPROVAL_REQUEST' && (
              <button
                onClick={() => {
                  setActiveTab('APPROVALS');
                  removeNotification(n.id);
                }}
                className="mt-2 text-[10px] font-bold text-amber-400 hover:underline uppercase tracking-wider block"
              >
                Open Manager Approval Desk →
              </button>
            )}
          </div>

          <button onClick={() => removeNotification(n.id)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

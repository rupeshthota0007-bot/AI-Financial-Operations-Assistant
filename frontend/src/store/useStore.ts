import { create } from 'zustand';
import { TabType, Ticket, Transaction, FraudCase, Approval, AuditLog, AnalyticsMetrics } from '../types';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'APPROVAL_REQUEST' | 'FRAUD_ALERT' | 'TICKET_UPDATE' | 'SYSTEM_INFO';
  timestamp: Date;
}

interface AppState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // UI Drawer states
  isCopilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isDemoModalOpen: boolean;
  setDemoModalOpen: (open: boolean) => void;

  // Domain data
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  fraudCases: FraudCase[];
  setFraudCases: (cases: FraudCase[]) => void;
  approvals: Approval[];
  setApprovals: (approvals: Approval[]) => void;
  auditLogs: AuditLog[];
  setAuditLogs: (logs: AuditLog[]) => void;
  metrics: AnalyticsMetrics | null;
  setMetrics: (metrics: AnalyticsMetrics) => void;

  // Notifications
  notifications: NotificationToast[];
  addNotification: (notification: Omit<NotificationToast, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;

  // Active Demo Run State
  isDemoRunning: boolean;
  demoStepName: string;
  setDemoState: (running: boolean, stepName?: string) => void;
}

export const useStore = create<AppState>((set) => ({
  activeTab: 'OVERVIEW',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isCopilotOpen: false,
  setCopilotOpen: (open) => set({ isCopilotOpen: open }),
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  isDemoModalOpen: false,
  setDemoModalOpen: (open) => set({ isDemoModalOpen: open }),

  tickets: [],
  setTickets: (tickets) => set({ tickets }),
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  fraudCases: [],
  setFraudCases: (fraudCases) => set({ fraudCases }),
  approvals: [],
  setApprovals: (approvals) => set({ approvals }),
  auditLogs: [],
  setAuditLogs: (auditLogs) => set({ auditLogs }),
  metrics: null,
  setMetrics: (metrics) => set({ metrics }),

  notifications: [],
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        { ...n, id: Math.random().toString(36).substring(2, 9), timestamp: new Date() },
        ...state.notifications,
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  isDemoRunning: false,
  demoStepName: '',
  setDemoState: (running, stepName = '') => set({ isDemoRunning: running, demoStepName: stepName }),
}));

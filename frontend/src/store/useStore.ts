import { create } from 'zustand';
import { TabType, Ticket, Transaction, FraudCase, Approval, AuditLog, AnalyticsMetrics } from '../types';
import {
  setEncryptedItem,
  getEncryptedItem,
  removeEncryptedItem,
  clearSessionKey,
} from '../utils/crypto';

export interface UserState {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
}

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

  // Authentication State
  currentUser: UserState | null;
  isAuthenticated: boolean;
  loginUser: (user: UserState, token: string) => void;
  logoutUser: () => void;
  bootstrapAuth: () => Promise<void>; // Async: loads encrypted session on mount

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

  // Auth — initially unauthenticated; bootstrapAuth() will restore session
  currentUser: null,
  isAuthenticated: false,

  loginUser: (user, token) => {
    // Persist encrypted to localStorage (async — fire and forget)
    setEncryptedItem('finops_auth_token', token);
    setEncryptedItem('finops_user', user);
    // Also write plain token for Authorization header access in api.ts
    localStorage.setItem('finops_auth_token', token);
    set({ currentUser: user, isAuthenticated: true });
  },

  logoutUser: () => {
    removeEncryptedItem('finops_auth_token');
    removeEncryptedItem('finops_user');
    localStorage.removeItem('finops_auth_token');
    clearSessionKey();
    set({ currentUser: null, isAuthenticated: false });
  },

  bootstrapAuth: async () => {
    try {
      const token = await getEncryptedItem<string>('finops_auth_token');
      const user = await getEncryptedItem<UserState>('finops_user');
      if (token && user) {
        localStorage.setItem('finops_auth_token', token);
        set({ currentUser: user, isAuthenticated: true });
      }
    } catch {
      // If decryption fails, force re-login (secure default)
      set({ currentUser: null, isAuthenticated: false });
    }
  },

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

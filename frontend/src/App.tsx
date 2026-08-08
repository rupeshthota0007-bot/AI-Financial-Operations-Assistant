import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CopilotDrawer } from './components/CopilotDrawer';
import { CommandPalette } from './components/CommandPalette';
import { NotificationToastContainer } from './components/NotificationToast';
import { DemoFlowModal } from './components/DemoFlowModal';
import { LoginPage } from './components/LoginPage';

import { AnalyticsDashboard } from './components/dashboards/AnalyticsDashboard';
import { SupportDashboard } from './components/dashboards/SupportDashboard';
import { PaymentDashboard } from './components/dashboards/PaymentDashboard';
import { FraudDashboard } from './components/dashboards/FraudDashboard';
import { ManagerApprovalDashboard } from './components/dashboards/ManagerApprovalDashboard';
import { AuditDashboard } from './components/dashboards/AuditDashboard';
import { KnowledgeBaseDashboard } from './components/dashboards/KnowledgeBaseDashboard';
import { CustomerDashboard } from './components/dashboards/CustomerDashboard';

export const App: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    setTickets,
    setTransactions,
    setFraudCases,
    setApprovals,
    setAuditLogs,
    setMetrics,
    addNotification,
    setApprovals: updateApprovals,
    setAuditLogs: updateAuditLogs,
  } = useStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch of enterprise data
    const loadInitialData = async () => {
      try {
        const [ticketsRes, txsRes, fraudRes, approvalsRes, auditRes, metricsRes] = await Promise.all([
          api.getTickets(),
          api.getTransactions(),
          api.getFraudCases(),
          api.getApprovals(),
          api.getAuditLogs(),
          api.getMetrics(),
        ]);

        setTickets(ticketsRes.tickets);
        setTransactions(txsRes.transactions);
        setFraudCases(fraudRes.fraudCases);
        setApprovals(approvalsRes.approvals);
        setAuditLogs(auditRes.logs);
        setMetrics(metricsRes.metrics);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadInitialData();

    // WebSocket real-time event listener
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = (import.meta.env.VITE_WS_URL as string) || `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'NOTIFICATION_RECEIVED') {
          addNotification({
            title: msg.data.title,
            message: msg.data.message,
            type: msg.data.type,
          });
        }
        if (msg.event === 'APPROVAL_STATUS_CHANGED') {
          api.getApprovals().then((res) => updateApprovals(res.approvals));
          api.getAuditLogs().then((res) => updateAuditLogs(res.logs));
        }
      } catch (err) {
        // Ignore non-json
      }
    };

    return () => ws.close();
  }, [isAuthenticated]);

  // If user is not authenticated, render the Enterprise Login Page UI first
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderDashboard = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return <AnalyticsDashboard />;
      case 'SUPPORT':
        return <SupportDashboard />;
      case 'PAYMENTS':
        return <PaymentDashboard />;
      case 'FRAUD':
        return <FraudDashboard />;
      case 'APPROVALS':
        return <ManagerApprovalDashboard />;
      case 'AUDIT':
        return <AuditDashboard />;
      case 'KNOWLEDGE':
        return <KnowledgeBaseDashboard />;
      case 'CUSTOMER':
        return <CustomerDashboard />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">{renderDashboard()}</main>
      </div>
      <CopilotDrawer />
      <CommandPalette />
      <NotificationToastContainer />
      <DemoFlowModal />
    </div>
  );
};

export default App;

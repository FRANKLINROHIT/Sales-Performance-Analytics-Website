import React, { useState, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { NotificationToast } from '../components/NotificationToast';
import { DashboardPage } from '../pages/DashboardPage';
import { SalesAnalyticsPage } from '../pages/SalesAnalyticsPage';
import { EmployeePerformancePage } from '../pages/EmployeePerformancePage';
import { ProductAnalyticsPage } from '../pages/ProductAnalyticsPage';
import { CustomerAnalyticsPage } from '../pages/CustomerAnalyticsPage';
import { TargetManagementPage } from '../pages/TargetManagementPage';
import { AdvancedAnalyticsPage } from '../pages/AdvancedAnalyticsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AdminPanelPage } from '../pages/AdminPanelPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  // Incremented whenever a new sale is created — triggers data refetch in all pages
  const [dataVersion, setDataVersion] = useState(0);

  const { addToast } = useContext(NotificationContext);

  const handleSaleCreated = () => {
    setDataVersion(v => v + 1);
    addToast('Sale recorded — analytics updated across all views.', 'success');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage dataVersion={dataVersion} />;
      case 'sales':
        return <SalesAnalyticsPage onSaleCreated={handleSaleCreated} />;
      case 'employees':
        return <EmployeePerformancePage />;
      case 'products':
        return <ProductAnalyticsPage />;
      case 'customers':
        return <CustomerAnalyticsPage />;
      case 'targets':
        return <TargetManagementPage />;
      case 'analytics':
        return <AdvancedAnalyticsPage dataVersion={dataVersion} />;
      case 'reports':
        return <ReportsPage />;
      case 'admin':
        return <AdminPanelPage />;
      case 'audit':
        return <AuditLogsPage />;
      default:
        return <DashboardPage dataVersion={dataVersion} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)' }}>
      {/* Collapsible Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onSearch={setGlobalSearch} activeTitle={activeTab.replace('-', ' ')} />
        <main style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>

      {/* Floating Notifications */}
      <NotificationToast />
    </div>
  );
};

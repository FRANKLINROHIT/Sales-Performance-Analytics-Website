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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
    <div className="app-layout">
      {/* Collapsible / Responsive Drawer Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Topbar
          onSearch={setGlobalSearch}
          activeTitle={activeTab.replace('-', ' ')}
          onToggleNav={() => setIsMobileNavOpen(prev => !prev)}
        />
        <main className="page-content">
          {renderContent()}
        </main>
      </div>

      {/* Floating Notifications */}
      <NotificationToast />
    </div>
  );
};

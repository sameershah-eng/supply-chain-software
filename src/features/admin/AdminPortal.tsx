import React from 'react';
import { AdminDashboard } from './AdminDashboard';
import { AdminHeatmap } from './AdminHeatmap';
import { AdminRequestsQueue } from './AdminRequestsQueue';
import { AdminPartners } from './AdminPartners';
import { AdminAlerts } from './AdminAlerts';
import { AdminReports } from './AdminReports';

interface AdminPortalProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeTab, onSelectTab }) => {
  switch (activeTab) {
    case 'overview':
      return <AdminDashboard onNavigateTab={onSelectTab} />;
    case 'heatmap':
      return <AdminHeatmap />;
    case 'requests':
      return <AdminRequestsQueue />;
    case 'partners':
      return <AdminPartners />;
    case 'alerts':
      return <AdminAlerts onNavigateTab={onSelectTab} />;
    case 'reports':
      return <AdminReports />;
    default:
      return <AdminDashboard onNavigateTab={onSelectTab} />;
  }
};

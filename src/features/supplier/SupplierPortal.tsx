import React from 'react';
import { SupplierInventory } from './SupplierInventory';
import { SupplierRequests } from './SupplierRequests';
import { SupplierTimeline } from './SupplierTimeline';
import { SupplierPerformance } from './SupplierPerformance';

interface SupplierPortalProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const SupplierPortal: React.FC<SupplierPortalProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'inventory':
      return <SupplierInventory />;
    case 'requests':
      return <SupplierRequests />;
    case 'timeline':
      return <SupplierTimeline />;
    case 'performance':
      return <SupplierPerformance />;
    default:
      return <SupplierInventory />;
  }
};

import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { LoginScreen } from './features/auth/LoginScreen';
import { AdminPortal } from './features/admin/AdminPortal';
import { CMPortal } from './features/cm/CMPortal';
import { SupplierPortal } from './features/supplier/SupplierPortal';
import { CustomerPortal } from './features/customer/CustomerPortal';
import { useStore } from './store/useStore';

export function CaporaApp() {
  const { currentUser, currentRole, isLiveTickerActive, simulateLiveTick } = useStore();

  // Role default tabs
  const getDefaultTabForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'overview';
      case 'cm':
        return 'production';
      case 'supplier':
        return 'inventory';
      case 'customer':
        return 'orders';
      default:
        return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getDefaultTabForRole(currentRole));

  // Sync active tab when role changes
  useEffect(() => {
    setActiveTab(getDefaultTabForRole(currentRole));
  }, [currentRole]);

  // Real-time background simulation ticker: runs every 25 seconds if active
  useEffect(() => {
    if (!isLiveTickerActive || !currentUser) return;

    const interval = setInterval(() => {
      simulateLiveTick();
    }, 25000);

    return () => clearInterval(interval);
  }, [isLiveTickerActive, currentUser, simulateLiveTick]);

  // If logged out, render the Login screen with 4 persona cards
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {currentRole === 'admin' && (
        <AdminPortal activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
      {currentRole === 'cm' && (
        <CMPortal activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
      {currentRole === 'supplier' && (
        <SupplierPortal activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
      {currentRole === 'customer' && (
        <CustomerPortal activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CaporaApp />
    </ToastProvider>
  );
}

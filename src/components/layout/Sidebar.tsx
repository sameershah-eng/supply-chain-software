import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  Grid,
  Inbox,
  Users,
  AlertTriangle,
  BarChart3,
  Layers,
  Wrench,
  Clock,
  Package,
  Boxes,
  FileCheck2,
  TrendingUp,
  Compass,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Role } from '../../types';
import { cn } from '../../lib/utils';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeAlert?: boolean;
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const { currentRole, currentUser, requests, orders, alerts, materialRequests, resetToDefaults } = useStore();

  // Badges calculation
  const pendingRequestsCount = requests.filter((r) => r.status === 'pending_match').length;
  const cmIncomingCount = requests.filter(
    (r) => r.status === 'matched' && r.assignedCmId === currentUser?.companyId
  ).length;
  const pendingMaterialRequestsCount = materialRequests.filter((m) => m.status === 'pending').length;
  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  const getNavItems = (role: Role): NavItem[] => {
    switch (role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'heatmap', label: 'Capacity Heatmap', icon: Grid },
          { id: 'requests', label: 'Requests Queue', icon: Inbox, badge: pendingRequestsCount },
          { id: 'partners', label: 'Partners & Directory', icon: Users },
          { id: 'alerts', label: 'Alerts Feed', icon: AlertTriangle, badge: unreadAlertsCount, badgeAlert: true },
          { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
        ];
      case 'cm':
        return [
          { id: 'lines', label: 'My Capacity Lines', icon: Layers },
          { id: 'calendar', label: 'Capacity Calendar', icon: Calendar },
          { id: 'incoming', label: 'Incoming Jobs', icon: Inbox, badge: cmIncomingCount },
          { id: 'production', label: 'Active Production', icon: Wrench },
        ];
      case 'supplier':
        return [
          { id: 'inventory', label: 'Inventory Materials', icon: Boxes },
          { id: 'requests', label: 'Material Requests', icon: FileCheck2, badge: pendingMaterialRequestsCount },
          { id: 'timeline', label: 'Commitments Timeline', icon: Clock },
          { id: 'performance', label: 'Supplier Performance', icon: TrendingUp },
        ];
      case 'customer':
        return [
          { id: 'explorer', label: 'Capacity Explorer', icon: Compass },
          { id: 'orders', label: 'My Orders', icon: Package },
          { id: 'new-request', label: 'Request Capacity', icon: PlusCircle },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(currentRole);

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-[#ECECEA] flex flex-col justify-between select-none shrink-0 h-[calc(100vh-3.5rem)]',
        isMobileDrawer ? 'h-full border-r-0' : 'hidden md:flex'
      )}
    >
      {/* Top: Current User/Org Badge */}
      <div className="p-4 border-b border-slate-100">
        <div className="bg-[#FAFAF8] p-3 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Workspace
          </p>
          <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">
            {currentUser?.companyName}
          </p>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {currentUser?.name} · {currentUser?.title?.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group text-left',
                isActive
                  ? 'text-teal-900 bg-teal-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveBar"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#0EA5A4] to-[#4F46E5] rounded-r-md"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <div className="flex items-center gap-2.5 min-w-0">
                <IconComponent
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ml-2',
                    item.badgeAlert
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-teal-100 text-teal-800'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info / Reset Data */}
      <div className="p-4 border-t border-slate-100 bg-[#FAFAF8]/50">
        <button
          type="button"
          onClick={resetToDefaults}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Capora v1.4 · Supply Chain OS
        </p>
      </div>
    </aside>
  );
};

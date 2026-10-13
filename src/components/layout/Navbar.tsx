import React from 'react';
import { Search, Zap, RotateCcw, User, LogOut, Menu } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Role } from '../../types';
import { APP_NAME } from '../../lib/constants';
import { NotificationDropdown } from './NotificationDropdown';
import { useToast } from '../ui/Toast';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    setCommandPaletteOpen,
    isLiveTickerActive,
    toggleLiveTicker,
    simulateLiveTick,
    logout,
  } = useStore();

  const { showToast } = useToast();

  const handleManualLiveTick = () => {
    simulateLiveTick();
    showToast({
      type: 'info',
      title: 'Live Telemetry Synced',
      message: 'Simulated real-time status change across active production lines and inventory.',
    });
  };

  const roleLabels: Record<Role, string> = {
    admin: 'Admin Portal',
    cm: 'Contract Manufacturer',
    supplier: 'Supplier Portal',
    customer: 'Customer Interface',
  };

  return (
    <header className="h-14 bg-white border-b border-[#ECECEA] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#0EA5A4] to-[#4F46E5] flex items-center justify-center text-white text-xs font-black shadow-2xs">
              C
            </span>
            {APP_NAME}
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-300 font-normal">/</span>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-600 truncate max-w-[160px]">
            {roleLabels[currentRole]}
          </span>
        </div>
      </div>

      {/* Center: Global Search Command Palette Button */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#FAFAF8] hover:bg-slate-100/80 border border-slate-200/90 rounded-lg text-xs text-slate-500 transition-colors cursor-pointer group"
        >
          <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-700">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search orders, lines, materials...</span>
          </span>
          <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Live Ticker + Role Switcher Demo Control + Notifications + User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live Simulator Ticker Button */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1">
          <div className="relative flex h-2 w-2">
            {isLiveTickerActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveTickerActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </div>
          <span className="text-[11px] font-medium text-slate-600 hidden sm:inline">Live</span>
          <button
            type="button"
            title="Simulate live background event"
            onClick={handleManualLiveTick}
            className="text-[11px] text-teal-700 hover:text-teal-900 font-medium ml-1 cursor-pointer flex items-center gap-1 hover:underline"
          >
            <Zap className="w-3 h-3 text-teal-600" />
            <span className="hidden md:inline">Sync</span>
          </button>
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="flex items-center">
          <select
            value={currentRole}
            onChange={(e) => switchRole(e.target.value as Role)}
            className="text-xs font-semibold bg-white text-slate-800 border border-slate-200/90 rounded-lg px-2.5 py-1.5 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0EA5A4] cursor-pointer"
            aria-label="Demo Role Switcher"
          >
            <option value="admin">Admin Portal</option>
            <option value="cm">Contract Manufacturer</option>
            <option value="supplier">Supplier Portal</option>
            <option value="customer">Customer Portal</option>
          </select>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Identity / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <button
            type="button"
            onClick={logout}
            title="Switch User / Log out"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

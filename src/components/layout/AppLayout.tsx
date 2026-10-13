import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { useStore } from '../../store/useStore';

interface AppLayoutProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeTab, onSelectTab, children }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { currentRole } = useStore();

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col antialiased select-none text-slate-800">
      {/* Top Navbar */}
      <Navbar onToggleMobileSidebar={() => setMobileDrawerOpen(true)} />

      {/* Main Workspace layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-40 md:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-50 w-72 bg-white h-full shadow-2xl flex flex-col"
              >
                <Sidebar
                  activeTab={activeTab}
                  onSelectTab={onSelectTab}
                  isMobileDrawer
                  onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={`${currentRole}_${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Check, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatRelativeTime } from '../../lib/utils';

export const NotificationDropdown: React.FC = () => {
  const { notifications, currentRole, markNotificationRead, markAllNotificationsRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter notifications for current role or 'all'
  const relevantNotifications = notifications.filter(
    (n) => n.roleTarget === 'all' || n.roleTarget === currentRole
  );

  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        aria-label="Open notifications"
      >
        <Bell className="w-4.5 h-4.5 stroke-[1.5]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#FAFAF8]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 bg-teal-50 text-teal-700 border border-teal-200/70 rounded-full tabular-nums">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {relevantNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No notifications for your current role.
                </div>
              ) : (
                relevantNotifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3.5 transition-colors cursor-pointer text-left ${
                      n.read ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/25 hover:bg-teal-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs ${n.read ? 'text-slate-800 font-medium' : 'text-slate-900 font-semibold'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(n.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

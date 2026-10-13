import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, ArrowRight, Building2, Package, Layers, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    orders,
    requests,
    productionLines,
    materials,
    partners,
    switchRole,
  } = useStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Filter items
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedOrders = orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((o) => ({
        id: o.id,
        title: `${o.orderNumber} - ${o.productName}`,
        subtitle: `${o.customerName} · Stage: ${o.currentStage} (${o.stageProgress}%)`,
        category: 'Orders',
        icon: <Package className="w-4 h-4 text-indigo-500" />,
        action: () => {
          switchRole('customer');
          setCommandPaletteOpen(false);
        },
      }));

    const matchedLines = productionLines
      .filter((l) => l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q) || l.cmName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((l) => ({
        id: l.id,
        title: l.name,
        subtitle: `${l.cmName} · ${l.unitsPerWeek.toLocaleString()} units/wk`,
        category: 'Production Lines',
        icon: <Layers className="w-4 h-4 text-teal-600" />,
        action: () => {
          switchRole('cm');
          setCommandPaletteOpen(false);
        },
      }));

    const matchedMaterials = materials
      .filter((m) => m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q) || m.supplierName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((m) => ({
        id: m.id,
        title: `${m.sku} - ${m.name}`,
        subtitle: `${m.supplierName} · On hand: ${m.quantityOnHand.toLocaleString()} ${m.unit}`,
        category: 'Raw Materials',
        icon: <Building2 className="w-4 h-4 text-sky-600" />,
        action: () => {
          switchRole('supplier');
          setCommandPaletteOpen(false);
        },
      }));

    const matchedPartners = partners
      .filter((p) => p.name.toLowerCase().includes(q) || p.contactPerson.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `${p.type.toUpperCase()} · ${p.location}`,
        category: 'Partners',
        icon: <Building2 className="w-4 h-4 text-slate-500" />,
        action: () => {
          switchRole('admin');
          setCommandPaletteOpen(false);
        },
      }));

    return [...matchedOrders, ...matchedLines, ...matchedMaterials, ...matchedPartners];
  }, [query, orders, productionLines, materials, partners, switchRole, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs"
          onClick={() => setCommandPaletteOpen(false)}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-10"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-[#FAFAF8]">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              placeholder="Search orders, capacity lines, materials, partners..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
            />
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg ml-2"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick shortcuts or Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {!query.trim() ? (
              <div className="p-4 text-xs text-slate-500">
                <p className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                  Quick Navigation
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs cursor-pointer"
                  >
                    <span>Switch to Admin Portal</span>
                    <span className="text-[11px] text-slate-400">Admin</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('cm');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs cursor-pointer"
                  >
                    <span>Switch to Contract Manufacturer Portal</span>
                    <span className="text-[11px] text-slate-400">CM</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('supplier');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs cursor-pointer"
                  >
                    <span>Switch to Supplier Portal</span>
                    <span className="text-[11px] text-slate-400">Supplier</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('customer');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs cursor-pointer"
                  >
                    <span>Switch to Customer Interface</span>
                    <span className="text-[11px] text-slate-400">Customer</span>
                  </button>
                </div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No matching results found for &quot;{query}&quot;.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredResults.map((item) => (
                  <button
                    key={`${item.category}_${item.id}`}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 group cursor-pointer transition-colors"
                  >
                    <div className="p-1.5 bg-slate-100 rounded-md shrink-0 group-hover:bg-white border border-slate-200/60">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Press ESC to close</span>
            <span>Tip: type SKU, Order #, or Company Name</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Factory, Truck, Sparkles, Building2, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, DEMO_USERS } from '../../lib/constants';
import { Role } from '../../types';
import { useStore } from '../../store/useStore';

export const LoginScreen: React.FC = () => {
  const { login } = useStore();

  const roleCards: {
    role: Role;
    title: string;
    description: string;
    icon: React.ReactNode;
    userName: string;
    company: string;
    titleRole: string;
    highlight: string;
  }[] = [
    {
      role: 'admin',
      title: 'Platform Admin',
      description: 'Oversee multi-tier capacity, match open customer requests, audit bottlenecks, and approve partner tiers.',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      userName: DEMO_USERS.admin.name,
      company: DEMO_USERS.admin.companyName,
      titleRole: DEMO_USERS.admin.title,
      highlight: 'Global capacity control & matching engine',
    },
    {
      role: 'cm',
      title: 'Contract Manufacturer',
      description: 'Publish production line availability, block maintenance weeks, accept or decline jobs, and advance live stage progress.',
      icon: <Factory className="w-5 h-5 text-teal-600" />,
      userName: DEMO_USERS.cm.name,
      company: DEMO_USERS.cm.companyName,
      titleRole: DEMO_USERS.cm.title,
      highlight: 'Line scheduling & floor execution tracking',
    },
    {
      role: 'supplier',
      title: 'Material Supplier',
      description: 'Monitor stock on hand, confirm raw material requests tied to CM jobs, flag lead time risks, and track commitments.',
      icon: <Truck className="w-5 h-5 text-sky-600" />,
      userName: DEMO_USERS.supplier.name,
      company: DEMO_USERS.supplier.companyName,
      titleRole: DEMO_USERS.supplier.title,
      highlight: 'Inventory availability & lead time sync',
    },
    {
      role: 'customer',
      title: 'Hardware Customer',
      description: 'Book manufacturing capacity, review instant availability estimates, and track orders across multi-stage production.',
      icon: <Building2 className="w-5 h-5 text-slate-700" />,
      userName: DEMO_USERS.customer.name,
      company: DEMO_USERS.customer.companyName,
      titleRole: DEMO_USERS.customer.title,
      highlight: 'Capacity exploration & live order visibility',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Subtle ambient gradient mesh background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-teal-100/30 via-indigo-100/20 to-transparent blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-[#ECECEA]/80 bg-white/60 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0EA5A4] to-[#4F46E5] flex items-center justify-center text-white text-sm font-bold shadow-xs">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">{APP_NAME}</span>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
          Enterprise Capacity Coordination Platform
        </span>
      </header>

      {/* Hero & Role Selectors */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 sm:py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-xs font-medium mb-3">
            <span>Direct Demo Portal Access</span>
            <span aria-hidden="true">·</span>
            <span>Select Any Persona</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Real-time supply chain capacity management
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed text-balance">
            Connect Contract Manufacturers, Suppliers, and Customers in one shared state. Select a demo persona below to explore their dedicated portal.
          </p>
        </motion.div>

        {/* 4 Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {roleCards.map((card, idx) => (
            <motion.div
              key={card.role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              onClick={() => login(card.role)}
              className="group bg-white rounded-2xl border border-[#ECECEA] p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl group-hover:bg-slate-100 transition-colors">
                      {card.icon}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {card.title}
                      </h2>
                      <span className="text-[11px] text-teal-700 font-medium">
                        {card.highlight}
                      </span>
                    </div>
                  </div>
                  <span className="p-1.5 rounded-lg text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {card.description}
                </p>
              </div>

              {/* Persona Profile Badge */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{card.userName}</p>
                  <p className="text-[11px] text-slate-500">{card.company}</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 bg-slate-50 group-hover:bg-teal-50 px-2 py-1 rounded-md border border-slate-200/70 transition-colors">
                  Sign in
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-12 py-5 border-t border-[#ECECEA] bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 {APP_NAME} Technologies. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Unified State Architecture</span>
          <span>·</span>
          <span>Zero Server Mock Engine</span>
          <span>·</span>
          <span>Framer Motion Animated</span>
        </div>
      </footer>
    </div>
  );
};

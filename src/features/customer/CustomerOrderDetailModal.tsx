import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Order } from '../../types';
import { formatNumber, formatDate, formatRelativeTime, getStageColor } from '../../lib/utils';
import { PRODUCTION_STAGES } from '../../lib/constants';
import { Clock, Factory, CheckCircle2, ShieldCheck, Box, FileText, Truck } from 'lucide-react';

interface CustomerOrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerOrderDetailModal: React.FC<CustomerOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{order.orderNumber}</span>
          <Badge variant={order.status === 'delayed' ? 'coral' : order.status === 'at_risk' ? 'amber' : 'emerald'}>
            {order.status === 'delayed' ? 'Delayed' : order.status === 'at_risk' ? 'At Risk' : 'On Track'}
          </Badge>
        </div>
      }
      description={`${order.productName} · Ordered by ${order.customerName}`}
      maxWidth="lg"
    >
      <div className="space-y-5 pt-2 text-xs">
        {/* Core Attributes Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#FAFAF8] rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-400 block text-[11px]">Assigned CM</span>
            <span className="font-bold text-slate-900 block truncate">{order.cmName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Production Line</span>
            <span className="font-semibold text-slate-800 block truncate">{order.lineName || 'Line 1'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Volume</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatNumber(order.quantity)} units
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Estimated ETA</span>
            <span className="font-bold text-teal-800">{formatDate(order.estimatedDeliveryDate)}</span>
          </div>
        </div>

        {/* Current Execution Stage Details */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-700">
              Current Stage: <strong className="text-slate-900">{order.currentStage}</strong>
            </span>
            <span className="font-bold text-slate-900 tabular-nums">{order.overallProgress}% Overall</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${order.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Audit Log / Stage Transition Timeline */}
        <div>
          <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
            Audited Execution History & Timestamp Logs
          </h3>

          <div className="relative pl-6 space-y-4 border-l-2 border-slate-200/80 ml-2">
            {order.history && order.history.length > 0 ? (
              order.history.map((h, i) => (
                <div key={i} className="relative">
                  {/* Pin Dot */}
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-teal-600 ring-2 ring-teal-100" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{h.stage}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(h.timestamp)} · {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed bg-[#FAFAF8] p-2 rounded-lg border border-slate-200/60">
                      {h.note}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Logged by {h.updatedBy}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No historical log entries available.</p>
            )}
          </div>
        </div>

        {/* Specs & Quality Protocols */}
        {order.specs && (
          <div className="pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block mb-1">
              Purchase Order Specifications
            </span>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-xs leading-relaxed">
              {order.specs}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspection Log
          </Button>
        </div>
      </div>
    </Modal>
  );
};

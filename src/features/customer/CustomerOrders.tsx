import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CustomerOrderDetailModal } from './CustomerOrderDetailModal';
import { useStore } from '../../store/useStore';
import { Order, ProductionStage } from '../../types';
import { formatNumber, formatDate, getStageIndex } from '../../lib/utils';
import { PRODUCTION_STAGES } from '../../lib/constants';
import { Package, Clock, CheckCircle2, ChevronRight, FileText, Factory } from 'lucide-react';

interface CustomerOrdersProps {
  onOpenNewRequestModal: () => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ onOpenNewRequestModal }) => {
  const { orders, currentUser } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Orders for current customer
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentUser?.companyId || o.customerName === currentUser?.companyName
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Manufacturing Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status across active Contract Manufacturer lines from scheduling to delivery dock receipt.
          </p>
        </div>

        <Button size="sm" variant="gradient" onClick={onOpenNewRequestModal}>
          Request New Capacity
        </Button>
      </div>

      <div className="space-y-4">
        {customerOrders.length === 0 ? (
          <Card className="py-16 text-center text-slate-500">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active production orders</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Submit your first capacity booking request to begin production.
            </p>
            <Button size="sm" variant="gradient" onClick={onOpenNewRequestModal}>
              Book Capacity Now
            </Button>
          </Card>
        ) : (
          customerOrders.map((order) => {
            const currentStageIdx = getStageIndex(order.currentStage);

            return (
              <Card
                key={order.id}
                className="p-5 hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 mb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{order.orderNumber}</span>
                      <Badge variant={order.status === 'delayed' ? 'coral' : order.status === 'at_risk' ? 'amber' : 'emerald'}>
                        {order.status === 'delayed' ? 'Delayed' : order.status === 'at_risk' ? 'At Risk' : order.status === 'completed' ? 'Delivered' : 'On Track'}
                      </Badge>
                      <span className="text-xs text-slate-400">Target: {formatDate(order.targetDeliveryDate)}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mt-1">{order.productName}</h3>
                    <p className="text-xs text-slate-500">
                      Manufacturer: <strong>{order.cmName}</strong> · Line: {order.lineName || 'Line 1'} · Volume: {formatNumber(order.quantity)} units
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Estimated Arrival</span>
                      <span className="text-sm font-bold text-slate-900">{formatDate(order.estimatedDeliveryDate)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                    >
                      Audit Details
                    </Button>
                  </div>
                </div>

                {/* Horizontal Progress Tracker */}
                <div className="my-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {PRODUCTION_STAGES.map((st, idx) => {
                      const isPast = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      return (
                        <div
                          key={st}
                          className={`p-2 rounded-lg border text-xs text-center transition-all ${
                            isCurrent
                              ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-400/20'
                              : isPast
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                              : 'bg-[#FAFAF8] border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            {isPast ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            )}
                            <span className="text-[10px] font-mono text-slate-400">Step {idx + 1}</span>
                          </div>
                          <span
                            className={`block truncate font-medium text-[11px] ${
                              isCurrent ? 'font-bold text-teal-900' : isPast ? 'text-emerald-900' : 'text-slate-400'
                            }`}
                          >
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overall completion bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>Current Status: <strong className="text-slate-800">{order.currentStage} ({order.stageProgress}%)</strong></span>
                  <span className="font-bold text-slate-900 tabular-nums">{order.overallProgress}% Complete</span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <CustomerOrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

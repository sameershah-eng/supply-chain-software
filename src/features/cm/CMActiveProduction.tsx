import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PRODUCTION_STAGES } from '../../lib/constants';
import { Order, ProductionStage } from '../../types';
import { useStore } from '../../store/useStore';
import { formatNumber, formatDate, getStageIndex } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { supplyChainApi } from '../../services/api';
import {
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Layers,
  AlertTriangle,
  Sliders,
} from 'lucide-react';

export const CMActiveProduction: React.FC = () => {
  const { orders, currentUser, materialRequests } = useStore();
  const { showToast } = useToast();

  const [advancingOrder, setAdvancingOrder] = useState<Order | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProductionStage>('In Production');
  const [stageProgress, setStageProgress] = useState(50);
  const [stageNote, setStageNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active orders assigned to this CM
  const cmOrders = orders.filter(
    (o) =>
      (o.cmId === currentUser?.companyId || o.cmName === currentUser?.companyName) &&
      o.currentStage !== 'Delivered'
  );

  const handleOpenAdvanceModal = (order: Order) => {
    setAdvancingOrder(order);
    const currentIndex = getStageIndex(order.currentStage);
    const nextStage =
      currentIndex < PRODUCTION_STAGES.length - 1
        ? PRODUCTION_STAGES[currentIndex + 1]
        : order.currentStage;
    setSelectedStage(nextStage);
    setStageProgress(order.stageProgress);
    setStageNote(`Advancing ${order.orderNumber} to ${nextStage}`);
  };

  const handleConfirmStageAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advancingOrder) return;
    setIsSubmitting(true);

    try {
      await supplyChainApi.advanceProductionStage(
        advancingOrder.id,
        selectedStage,
        stageProgress,
        stageNote
      );

      showToast({
        type: 'success',
        title: 'Production Stage Updated',
        message: `${advancingOrder.orderNumber} advanced to ${selectedStage} (${stageProgress}% stage progress).`,
      });
      setAdvancingOrder(null);
    } catch {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update stage. Please retry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Active Shop Floor Execution</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor running jobs across manufacturing stages. Advance job stages, log quality milestones, and inspect material readiness.
          </p>
        </div>

        <Badge variant="indigo">{cmOrders.length} Active Orders in Plant</Badge>
      </div>

      <div className="space-y-4">
        {cmOrders.length === 0 ? (
          <Card className="py-16 text-center text-slate-500">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active production jobs</p>
            <p className="text-xs text-slate-400 mt-1">Accept incoming jobs to populate shop floor execution.</p>
          </Card>
        ) : (
          cmOrders.map((order) => {
            const currentStageIdx = getStageIndex(order.currentStage);
            // Linked material request
            const mreq = materialRequests.find((m) => m.orderId === order.id);

            return (
              <Card key={order.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{order.orderNumber}</span>
                      <Badge variant={order.status === 'delayed' ? 'coral' : order.status === 'at_risk' ? 'amber' : 'emerald'}>
                        {order.status === 'delayed' ? 'Delayed' : order.status === 'at_risk' ? 'At Risk' : 'On Track'}
                      </Badge>
                      <span className="text-xs text-slate-400">Target Delivery: {formatDate(order.targetDeliveryDate)}</span>
                    </div>

                    <h3 className="font-semibold text-slate-800 text-sm mt-1">{order.productName}</h3>
                    <p className="text-xs text-slate-500">
                      Line: {order.lineName || 'Line 1'} · Volume: {formatNumber(order.quantity)} units · Customer: {order.customerName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="gradient"
                      leftIcon={<Sliders className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenAdvanceModal(order)}
                    >
                      Advance Stage / Progress
                    </Button>
                  </div>
                </div>

                {/* Horizontal Progress Tracker */}
                <div className="my-3">
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

                {/* Progress bar + Material Status pulled from Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100 text-xs">
                  {/* Progress Slider Display */}
                  <div className="bg-[#FAFAF8] p-3 rounded-xl border border-slate-200/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 font-medium">
                        Current Stage Completion: <strong className="text-slate-900">{order.currentStage}</strong>
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">{order.stageProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${order.stageProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Material Status from Supplier Side */}
                  <div className="bg-[#FAFAF8] p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Supplier Material Feed</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5">
                        {mreq ? mreq.materialName : 'Raw Materials Provisioned'}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {mreq ? `${mreq.supplierName} (${mreq.quantityNeeded} ${mreq.unit})` : 'In warehouse storage'}
                      </span>
                    </div>
                    <div>
                      <Badge
                        variant={
                          order.materialStatus === 'ready' || order.materialStatus === 'confirmed'
                            ? 'emerald'
                            : order.materialStatus === 'delayed'
                            ? 'coral'
                            : 'amber'
                        }
                      >
                        {order.materialStatus === 'ready'
                          ? 'Materials Staged'
                          : order.materialStatus === 'confirmed'
                          ? 'Supplier Confirmed'
                          : order.materialStatus === 'delayed'
                          ? 'Material Delayed'
                          : 'Awaiting Supplier'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Advance Stage Modal */}
      {advancingOrder && (
        <Modal
          isOpen={!!advancingOrder}
          onClose={() => setAdvancingOrder(null)}
          title={`Update Execution Stage: ${advancingOrder.orderNumber}`}
          description={`Update progress for ${advancingOrder.productName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmStageAdvance} className="space-y-4 pt-2">
            <Select
              label="Production Stage"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as ProductionStage)}
            >
              {PRODUCTION_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-medium text-slate-700">Stage Progress (%)</label>
                <span className="font-bold text-slate-900 tabular-nums">{stageProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={stageProgress}
                onChange={(e) => setStageProgress(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <Input
              label="Milestone Note / Inspection Log"
              placeholder="e.g. SMT Solder paste inspection passed, high speed placement running."
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setAdvancingOrder(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                Save Stage Update
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

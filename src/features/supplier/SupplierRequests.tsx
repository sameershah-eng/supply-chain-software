import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useStore } from '../../store/useStore';
import { MaterialRequest } from '../../types';
import { formatNumber, formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { supplyChainApi } from '../../services/api';
import { Check, Clock, AlertTriangle, FileCheck2, Calendar } from 'lucide-react';

export const SupplierRequests: React.FC = () => {
  const { materialRequests, currentUser } = useStore();
  const { showToast } = useToast();

  const [activeModalReq, setActiveModalReq] = useState<MaterialRequest | null>(null);
  const [responseStatus, setResponseStatus] = useState<'confirmed' | 'partial' | 'delayed'>('confirmed');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Material requests for this supplier
  const supplierReqs = materialRequests.filter(
    (m) =>
      m.supplierId === currentUser?.companyId || m.supplierName === currentUser?.companyName
  );

  const handleOpenActionModal = (req: MaterialRequest) => {
    setActiveModalReq(req);
    setResponseStatus(req.status === 'pending' ? 'confirmed' : req.status);
    setConfirmedDate(req.confirmedDeliveryDate || req.requestedDeliveryDate);
    setSupplierNotes(req.supplierNotes || 'Lot allocated and cleared for dispatch.');
  };

  const handleConfirmResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalReq) return;
    setIsSubmitting(true);

    try {
      await supplyChainApi.respondToMaterialRequest(
        activeModalReq.id,
        responseStatus,
        supplierNotes,
        confirmedDate
      );

      showToast({
        type: responseStatus === 'confirmed' ? 'success' : 'warning',
        title: `Material Request ${responseStatus.toUpperCase()}`,
        message: `${activeModalReq.materialName} status synced to CM floor and customer tracker.`,
      });
      setActiveModalReq(null);
    } catch {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update material request. Please retry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<MaterialRequest>[] = [
    {
      header: 'Linked Order',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.orderNumber}</span>
          <span className="text-[11px] text-slate-500">CM: {row.cmName}</span>
        </div>
      ),
    },
    {
      header: 'Material Requested',
      cell: (row) => (
        <div>
          <span className="font-medium text-slate-900 block">{row.materialName}</span>
          <span className="text-[11px] text-slate-400">Created: {formatDate(row.createdAt)}</span>
        </div>
      ),
    },
    {
      header: 'Quantity Needed',
      align: 'right',
      cell: (row) => (
        <span className="font-bold text-slate-900 tabular-nums">
          {formatNumber(row.quantityNeeded)} {row.unit}
        </span>
      ),
    },
    {
      header: 'Target Delivery',
      cell: (row) => (
        <div>
          <span className="text-slate-800 font-medium block">
            {formatDate(row.confirmedDeliveryDate || row.requestedDeliveryDate)}
          </span>
          {row.confirmedDeliveryDate && row.confirmedDeliveryDate !== row.requestedDeliveryDate && (
            <span className="text-[10px] text-amber-700 block">
              Req: {formatDate(row.requestedDeliveryDate)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        switch (row.status) {
          case 'confirmed':
            return <Badge variant="emerald">Confirmed</Badge>;
          case 'pending':
            return <Badge variant="amber">Pending Supplier</Badge>;
          case 'partial':
            return <Badge variant="sky">Partial Delivery</Badge>;
          case 'delayed':
            return <Badge variant="coral">Delayed</Badge>;
        }
      },
    },
    {
      header: 'Supplier Notes',
      cell: (row) => (
        <span className="text-xs text-slate-500 italic truncate max-w-xs block">
          {row.supplierNotes || '—'}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      cell: (row) => (
        <Button
          size="sm"
          variant={row.status === 'pending' ? 'gradient' : 'outline'}
          onClick={() => handleOpenActionModal(row)}
        >
          {row.status === 'pending' ? 'Respond' : 'Update'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Job-Linked Material Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Raw material requisitions tied directly to Contract Manufacturer production lines. Confirm batches, adjust delivery dates, or flag supply bottlenecks.
          </p>
        </div>

        <Badge variant="sky">{supplierReqs.length} Material Requests</Badge>
      </div>

      <Table
        columns={columns}
        data={supplierReqs}
        keyExtractor={(r) => r.id}
        emptyState={
          <div className="py-12 text-center text-slate-500">
            <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No pending material requisitions</p>
            <p className="text-xs text-slate-400 mt-1">CM jobs will issue requisitions as orders are confirmed.</p>
          </div>
        }
      />

      {/* Response / Update Modal */}
      {activeModalReq && (
        <Modal
          isOpen={!!activeModalReq}
          onClose={() => setActiveModalReq(null)}
          title={`Respond to Request: ${activeModalReq.orderNumber}`}
          description={`Material: ${activeModalReq.materialName} (${formatNumber(activeModalReq.quantityNeeded)} ${activeModalReq.unit}) for ${activeModalReq.cmName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmResponse} className="space-y-4 pt-2">
            <Select
              label="Fulfillment Status"
              value={responseStatus}
              onChange={(e) => setResponseStatus(e.target.value as any)}
            >
              <option value="confirmed">Confirm Full Order on Schedule</option>
              <option value="partial">Partial Confirmation (Staged Batches)</option>
              <option value="delayed">Flag Lead Time Delay</option>
            </Select>

            <Input
              label="Confirmed Delivery Date"
              type="date"
              value={confirmedDate}
              onChange={(e) => setConfirmedDate(e.target.value)}
              required
            />

            <Input
              label="Supplier Note / Tracking Details"
              placeholder="e.g. Lot #4492 reserved; freight shipping via bonded carrier."
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setActiveModalReq(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                Save Fulfillment Status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

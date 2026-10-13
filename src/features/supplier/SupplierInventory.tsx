import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { Material } from '../../types';
import { formatNumber, formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Boxes, AlertTriangle, PlusCircle, CheckCircle2 } from 'lucide-react';

export const SupplierInventory: React.FC = () => {
  const { materials, currentUser, reorderMaterial } = useStore();
  const { showToast } = useToast();

  const [replenishModalMat, setReplenishModalMat] = useState<Material | null>(null);
  const [replenishQty, setReplenishQty] = useState('2500');

  // Supplier's inventory
  const supplierMaterials = materials.filter(
    (m) =>
      m.supplierId === currentUser?.companyId || m.supplierName === currentUser?.companyName
  );

  const handleReplenish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replenishModalMat) return;
    const qty = Number(replenishQty);
    if (!qty || qty <= 0) return;

    reorderMaterial(replenishModalMat.id, qty);
    showToast({
      type: 'success',
      title: 'Inventory Replenished',
      message: `Added ${formatNumber(qty)} ${replenishModalMat.unit} of ${replenishModalMat.name}.`,
    });
    setReplenishModalMat(null);
  };

  const columns: Column<Material>[] = [
    {
      header: 'Material / SKU',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] font-mono text-slate-400 block">{row.sku}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => <span className="text-slate-600 text-xs">{row.category}</span>,
    },
    {
      header: 'On Hand Stock',
      align: 'right',
      cell: (row) => {
        const isLow = row.quantityOnHand <= row.reorderLevel;
        return (
          <div>
            <span
              className={`font-bold tabular-nums block ${
                isLow ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {formatNumber(row.quantityOnHand)} {row.unit}
            </span>
            {isLow && (
              <span className="text-[10px] text-rose-600 font-semibold flex items-center justify-end gap-1">
                <AlertTriangle className="w-3 h-3" /> Below Reorder Point
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Lead Time',
      align: 'center',
      cell: (row) => <span className="text-slate-700 tabular-nums">{row.leadTimeDays} days</span>,
    },
    {
      header: 'Reorder Level',
      align: 'right',
      cell: (row) => (
        <span className="text-slate-500 tabular-nums">
          {formatNumber(row.reorderLevel)} {row.unit}
        </span>
      ),
    },
    {
      header: 'Unit Cost',
      align: 'right',
      cell: (row) => (
        <span className="text-slate-800 font-medium tabular-nums">${row.costPerUnit.toFixed(2)}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => {
            setReplenishModalMat(row);
            setReplenishQty('2000');
          }}
        >
          Restock
        </Button>
      ),
    },
  ];

  const lowStockCount = supplierMaterials.filter((m) => m.quantityOnHand <= m.reorderLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Raw Material Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor quantity on hand, replenishment lead times, and active reserve allocation across CMs.
          </p>
        </div>

        {lowStockCount > 0 && (
          <Badge variant="coral">
            {lowStockCount} Materials Require Restocking
          </Badge>
        )}
      </div>

      <Table
        columns={columns}
        data={supplierMaterials}
        keyExtractor={(m) => m.id}
        emptyState={
          <div className="py-12 text-center text-slate-500">
            <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No inventory records</p>
            <p className="text-xs text-slate-400 mt-1">Materials catalog is empty for this supplier.</p>
          </div>
        }
      />

      {/* Restock Modal */}
      {replenishModalMat && (
        <Modal
          isOpen={!!replenishModalMat}
          onClose={() => setReplenishModalMat(null)}
          title={`Restock Material: ${replenishModalMat.name}`}
          description={`SKU: ${replenishModalMat.sku} · Current: ${formatNumber(replenishModalMat.quantityOnHand)} ${replenishModalMat.unit}`}
          maxWidth="sm"
        >
          <form onSubmit={handleReplenish} className="space-y-4 pt-2">
            <Input
              label={`Quantity to Add (${replenishModalMat.unit})`}
              type="number"
              min="100"
              value={replenishQty}
              onChange={(e) => setReplenishQty(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setReplenishModalMat(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Confirm Restock
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

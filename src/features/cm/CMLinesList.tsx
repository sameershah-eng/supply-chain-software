import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CMAddLineEditModal } from './CMAddLineEditModal';
import { useStore } from '../../store/useStore';
import { ProductionLine } from '../../types';
import { formatNumber } from '../../lib/utils';
import { Layers, Plus, Edit2, Wrench, CheckCircle2, AlertOctagon } from 'lucide-react';

export const CMLinesList: React.FC = () => {
  const { productionLines, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ProductionLine | null>(null);

  // Filter lines for current CM company
  const cmLines = productionLines.filter(
    (l) => l.cmId === currentUser?.companyId || l.cmName === currentUser?.companyName
  );

  const columns: Column<ProductionLine>[] = [
    {
      header: 'Production Line',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-500">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Capacity (Units/Wk)',
      align: 'right',
      cell: (row) => (
        <span className="font-semibold text-slate-800 tabular-nums">
          {formatNumber(row.unitsPerWeek)}
        </span>
      ),
    },
    {
      header: 'Lead Time',
      align: 'center',
      cell: (row) => (
        <span className="text-slate-700 tabular-nums">{row.leadTimeDays} days</span>
      ),
    },
    {
      header: 'Min Batch',
      align: 'right',
      cell: (row) => (
        <span className="text-slate-700 tabular-nums">{formatNumber(row.minBatchSize)}</span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        switch (row.status) {
          case 'operational':
            return <Badge variant="emerald">Operational</Badge>;
          case 'maintenance':
            return <Badge variant="amber">Maintenance</Badge>;
          case 'offline':
            return <Badge variant="coral">Offline</Badge>;
        }
      },
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          onClick={() => {
            setEditingLine(row);
            setIsModalOpen(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Facility Production Lines</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your plant&apos;s active manufacturing equipment, rated throughput, and category capabilities.
          </p>
        </div>

        <Button
          size="sm"
          variant="gradient"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingLine(null);
            setIsModalOpen(true);
          }}
        >
          Add Production Line
        </Button>
      </div>

      <Table
        columns={columns}
        data={cmLines}
        keyExtractor={(l) => l.id}
        emptyState={
          <div className="py-12 text-center text-slate-500">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No production lines configured</p>
            <p className="text-xs text-slate-400 mt-1">Add your first production line to receive matching requests.</p>
          </div>
        }
      />

      <CMAddLineEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLine(null);
        }}
        lineToEdit={editingLine}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { AdminMatchDrawer } from './AdminMatchDrawer';
import { useStore } from '../../store/useStore';
import { CustomerRequest } from '../../types';
import { formatNumber, formatDate } from '../../lib/utils';
import { Inbox, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const AdminRequestsQueue: React.FC = () => {
  const { requests } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequestToMatch, setSelectedRequestToMatch] = useState<CustomerRequest | null>(null);

  const pendingCount = requests.filter((r) => r.status === 'pending_match').length;
  const matchedCount = requests.filter((r) => r.status === 'matched').length;
  const convertedCount = requests.filter((r) => r.status === 'converted').length;

  const tabs = [
    { id: 'all', label: 'All Requests', count: requests.length },
    { id: 'pending_match', label: 'Pending Match', count: pendingCount },
    { id: 'matched', label: 'Awaiting CM', count: matchedCount },
    { id: 'converted', label: 'In Production', count: convertedCount },
  ];

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const columns: Column<CustomerRequest>[] = [
    {
      header: 'Request',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.requestNumber}</span>
          <span className="text-[11px] text-slate-500">{row.customerName}</span>
        </div>
      ),
    },
    {
      header: 'Product & Category',
      cell: (row) => (
        <div>
          <span className="font-medium text-slate-800 block truncate max-w-xs">{row.productName}</span>
          <span className="text-[11px] text-slate-500">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Volume',
      align: 'right',
      cell: (row) => (
        <span className="font-semibold text-slate-900 tabular-nums">
          {formatNumber(row.quantity)} units
        </span>
      ),
    },
    {
      header: 'Target Delivery',
      cell: (row) => (
        <div>
          <span className="text-slate-700">{formatDate(row.targetDeliveryDate)}</span>
          <span className="text-[11px] text-slate-400 block">Sub: {formatDate(row.submittedDate)}</span>
        </div>
      ),
    },
    {
      header: 'Priority',
      cell: (row) => {
        const variant =
          row.priority === 'critical' ? 'coral' : row.priority === 'high' ? 'amber' : 'slate';
        return <Badge variant={variant}>{row.priority.toUpperCase()}</Badge>;
      },
    },
    {
      header: 'Status',
      cell: (row) => {
        switch (row.status) {
          case 'pending_match':
            return <Badge variant="amber">Pending Match</Badge>;
          case 'matched':
            return (
              <div>
                <Badge variant="sky">Matched · CM Review</Badge>
                <span className="block text-[10px] text-slate-400 mt-0.5">{row.assignedCmName}</span>
              </div>
            );
          case 'converted':
            return <Badge variant="emerald">Accepted & Scheduled</Badge>;
          case 'declined':
            return <Badge variant="coral">Declined by CM</Badge>;
          default:
            return <Badge>{row.status}</Badge>;
        }
      },
    },
    {
      header: 'Action',
      align: 'right',
      cell: (row) => {
        if (row.status === 'pending_match' || row.status === 'declined') {
          return (
            <Button
              size="sm"
              variant="gradient"
              onClick={() => setSelectedRequestToMatch(row)}
            >
              Match CM
            </Button>
          );
        }
        if (row.status === 'matched') {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedRequestToMatch(row)}
            >
              Reassign
            </Button>
          );
        }
        return (
          <span className="text-xs text-slate-400 font-medium">In Production</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Capacity Requests Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming customer capacity requests. Match open orders with verified CM production lines.
          </p>
        </div>

        <Tabs tabs={tabs} activeTab={statusFilter} onChange={setStatusFilter} />
      </div>

      <Table
        columns={columns}
        data={filteredRequests}
        keyExtractor={(r) => r.id}
        emptyState={
          <div className="py-12 text-center text-slate-500">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No requests in this queue</p>
            <p className="text-xs text-slate-400 mt-1">All requests have been matched or no requests match the filter.</p>
          </div>
        }
      />

      {/* Match CM Drawer */}
      <AdminMatchDrawer
        isOpen={!!selectedRequestToMatch}
        request={selectedRequestToMatch}
        onClose={() => setSelectedRequestToMatch(null)}
        onMatched={() => {
          setSelectedRequestToMatch(null);
        }}
      />
    </div>
  );
};

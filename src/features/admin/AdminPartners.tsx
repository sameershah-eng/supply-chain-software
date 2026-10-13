import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { Partner, PartnerStatus, PartnerType } from '../../types';
import { formatNumber, formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Search, Building2, Check, Ban, ShieldCheck, Star } from 'lucide-react';

export const AdminPartners: React.FC = () => {
  const { partners, updatePartnerStatus } = useStore();
  const { showToast } = useToast();
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cmCount = partners.filter((p) => p.type === 'cm').length;
  const supplierCount = partners.filter((p) => p.type === 'supplier').length;
  const customerCount = partners.filter((p) => p.type === 'customer').length;

  const tabs = [
    { id: 'all', label: 'All Partners', count: partners.length },
    { id: 'cm', label: 'Contract Manufacturers', count: cmCount },
    { id: 'supplier', label: 'Suppliers', count: supplierCount },
    { id: 'customer', label: 'Customers', count: customerCount },
  ];

  const filteredPartners = partners.filter((p) => {
    if (partnerTypeFilter !== 'all' && p.type !== partnerTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.contactPerson.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (partner: Partner, newStatus: PartnerStatus) => {
    updatePartnerStatus(partner.id, newStatus);
    showToast({
      type: newStatus === 'active' ? 'success' : 'warning',
      title: `Partner ${newStatus === 'active' ? 'Activated' : 'Suspended'}`,
      message: `${partner.name} status is now marked as ${newStatus}.`,
    });
  };

  const columns: Column<Partner>[] = [
    {
      header: 'Partner Organization',
      cell: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900">{row.name}</span>
          </div>
          <span className="text-[11px] text-slate-500">{row.location}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => {
        const labels: Record<PartnerType, string> = {
          cm: 'Contract Manufacturer',
          supplier: 'Material Supplier',
          customer: 'Hardware Customer',
        };
        const variants: Record<PartnerType, 'teal' | 'sky' | 'slate'> = {
          cm: 'teal' as any,
          supplier: 'sky',
          customer: 'slate',
        };
        return <Badge variant={variants[row.type] || 'slate'}>{labels[row.type]}</Badge>;
      },
    },
    {
      header: 'Primary Contact',
      cell: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">{row.contactPerson}</span>
          <span className="text-[11px] text-slate-400 block">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Rating & Quality',
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 tabular-nums">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{row.rating.toFixed(1)}</span>
          <span className="text-slate-400 font-normal">/ 5.0</span>
        </div>
      ),
    },
    {
      header: 'Delivered Vol.',
      align: 'right',
      cell: (row) => (
        <span className="font-semibold text-slate-800 tabular-nums">
          {formatNumber(row.totalVolume)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        switch (row.status) {
          case 'active':
            return <Badge variant="emerald">Active</Badge>;
          case 'pending':
            return <Badge variant="amber">Pending Approval</Badge>;
          case 'suspended':
            return <Badge variant="coral">Suspended</Badge>;
          default:
            return <Badge>{row.status}</Badge>;
        }
      },
    },
    {
      header: 'Governance',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'suspended' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(row, 'active')}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-500 hover:text-rose-600"
              onClick={() => handleStatusChange(row, 'suspended')}
            >
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Partner Directory & Governance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit verified contract manufacturers, raw material suppliers, and customer entities.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search partners, contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={partnerTypeFilter} onChange={setPartnerTypeFilter} />

      <Table
        columns={columns}
        data={filteredPartners}
        keyExtractor={(p) => p.id}
        emptyState={
          <div className="py-12 text-center text-slate-500">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No partners found</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query.</p>
          </div>
        }
      />
    </div>
  );
};

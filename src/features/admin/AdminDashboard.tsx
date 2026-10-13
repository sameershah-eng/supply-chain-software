import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../store/useStore';
import { formatNumber, formatDate } from '../../lib/utils';
import {
  Layers,
  CheckCircle2,
  Percent,
  Inbox,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { productionLines, orders, requests, partners, alerts } = useStore();

  // Aggregate stats
  const totalCapacity = productionLines.reduce((acc, l) => acc + l.unitsPerWeek, 0);
  const currentWeek = 43;
  const bookedCapacity = productionLines.reduce((acc, l) => {
    if (l.blockedWeeks.includes(currentWeek)) return acc + l.unitsPerWeek;
    return acc + (l.bookedUnits[currentWeek] || 0);
  }, 0);

  const utilizationPercent = totalCapacity > 0 ? (bookedCapacity / totalCapacity) * 100 : 0;
  const openRequestsCount = requests.filter((r) => r.status === 'pending_match').length;
  const atRiskOrdersCount = orders.filter((o) => o.status === 'at_risk' || o.status === 'delayed').length;
  const activePartnersCount = partners.filter((p) => p.status === 'active').length;

  const pendingRequests = requests.filter((r) => r.status === 'pending_match').slice(0, 4);
  const activeAlerts = alerts.filter((a) => !a.isRead).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Capacity Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global coordination across 6 Contract Manufacturers, 8 Suppliers, and 10 Customers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onNavigateTab('heatmap')}
          >
            Open 12-Wk Heatmap
          </Button>
          <Button
            size="sm"
            variant="gradient"
            onClick={() => onNavigateTab('requests')}
          >
            Review {openRequestsCount} Open Requests
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (6 metrics with trends) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          label="Total Capacity"
          value={totalCapacity}
          suffix=" /wk"
          formatAsCompact
          icon={<Layers className="w-4 h-4 text-slate-500" />}
          trend={{ value: 4.8, isPositiveGood: true }}
        />
        <StatCard
          label="Booked Capacity"
          value={bookedCapacity}
          suffix=" /wk"
          formatAsCompact
          icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />}
          trend={{ value: 8.2, isPositiveGood: true }}
        />
        <StatCard
          label="Utilization %"
          value={Math.round(utilizationPercent)}
          suffix="%"
          icon={<Percent className="w-4 h-4 text-indigo-600" />}
          trend={{ value: 3.5, isPositiveGood: true }}
        />
        <StatCard
          label="Open Requests"
          value={openRequestsCount}
          icon={<Inbox className="w-4 h-4 text-amber-600" />}
          subtext="Needs CM matching"
        />
        <StatCard
          label="At-Risk Orders"
          value={atRiskOrdersCount}
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          trend={{ value: -12.0, isPositiveGood: false, label: 'vs last month' }}
        />
        <StatCard
          label="Active Partners"
          value={activePartnersCount}
          icon={<Users className="w-4 h-4 text-slate-600" />}
          trend={{ value: 14.3, isPositiveGood: true }}
        />
      </div>

      {/* Critical Bottlenecks / Urgent Feeds */}
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-100 text-amber-800 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Critical Supply Chain Flags ({activeAlerts.length})
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeAlerts.map((a) => (
              <div key={a.id} className="p-3 bg-white rounded-xl border border-amber-200/70 text-xs shadow-2xs">
                <p className="font-semibold text-slate-900 truncate">{a.title}</p>
                <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Grids: Incoming Requests Queue Preview & At-Risk Orders Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unmatched Customer Requests */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>Requests Awaiting Matching</CardTitle>
                <CardDescription>Customer capacity orders queued for CM allocation</CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigateTab('requests')}
              >
                View Queue
              </Button>
            </CardHeader>

            <div className="space-y-2.5">
              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  All requests have been successfully matched to CM lines.
                </div>
              ) : (
                pendingRequests.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-[#FAFAF8] rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{r.requestNumber}</span>
                        <Badge variant={r.priority === 'critical' ? 'coral' : r.priority === 'high' ? 'amber' : 'slate'}>
                          {r.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-slate-600 font-medium mt-0.5 truncate max-w-xs">{r.productName}</p>
                      <span className="text-[11px] text-slate-400">
                        {r.customerName} · {formatNumber(r.quantity)} units · Target {r.targetDeliveryDate}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onNavigateTab('requests')}
                    >
                      Match
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* At-Risk / Delayed Production Tracker */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>At-Risk Orders & Deviations</CardTitle>
                <CardDescription>Jobs flagged for material delay or calibration bottleneck</CardDescription>
              </div>
              <Badge variant="coral">Attention Required</Badge>
            </CardHeader>

            <div className="space-y-2.5">
              {orders
                .filter((o) => o.status === 'at_risk' || o.status === 'delayed')
                .map((o) => (
                  <div
                    key={o.id}
                    className="p-3.5 bg-rose-50/30 rounded-xl border border-rose-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{o.orderNumber}</span>
                        <Badge variant={o.status === 'delayed' ? 'coral' : 'amber'}>
                          {o.status === 'delayed' ? 'Delayed' : 'At Risk'}
                        </Badge>
                      </div>
                      <p className="text-slate-800 font-medium mt-0.5 truncate max-w-xs">{o.productName}</p>
                      <span className="text-[11px] text-rose-700 font-medium block mt-0.5">
                        {o.riskReason || 'Lead time variance on critical materials'}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-slate-800 block tabular-nums">
                        Stage: {o.currentStage}
                      </span>
                      <span className="text-[11px] text-slate-400">ETA {o.estimatedDeliveryDate}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

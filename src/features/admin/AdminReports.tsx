import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HISTORICAL_CHART_DATA } from '../../data/seedData';
import { exportToCSV, formatNumber } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { Download } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

// Custom Tooltip styled for clean SaaS
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-lg text-xs">
        <p className="font-semibold text-slate-900 mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {typeof entry.value === 'number'
                  ? entry.name.toLowerCase().includes('rate') || entry.name.toLowerCase().includes('utilization')
                    ? `${entry.value.toFixed(1)}%`
                    : formatNumber(entry.value)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AdminReports: React.FC = () => {
  const { orders } = useStore();
  const { showToast } = useToast();

  const handleExportCSV = () => {
    const exportData = orders.map((o) => ({
      OrderNumber: o.orderNumber,
      Customer: o.customerName,
      ContractManufacturer: o.cmName,
      Product: o.productName,
      Category: o.category,
      Quantity: o.quantity,
      Stage: o.currentStage,
      Status: o.status,
      TargetDelivery: o.targetDeliveryDate,
      EstimatedDelivery: o.estimatedDeliveryDate,
    }));

    exportToCSV(`Capora_Orders_Report_${new Date().toISOString().split('T')[0]}`, exportData);
    showToast({
      type: 'success',
      title: 'Report Exported',
      message: 'Orders dataset successfully downloaded as CSV.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Capacity & Execution Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            90-day historical capacity utilization, cross-category volume allocation, and delivery reliability.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
        >
          Export Orders CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Over Time (Area Chart) */}
        <Card className="p-5">
          <CardHeader>
            <div>
              <CardTitle>Capacity Utilization Over Time</CardTitle>
              <CardDescription>Aggregate network utilization rate across next 12 weeks</CardDescription>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 tabular-nums">
              85.3% Current
            </span>
          </CardHeader>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="utilization"
                  name="Utilization"
                  stroke="#0EA5A4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUtil)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* On-Time Delivery Rate (Line Chart) */}
        <Card className="p-5">
          <CardHeader>
            <div>
              <CardTitle>On-Time Delivery Performance</CardTitle>
              <CardDescription>Fulfillment SLA achievement across verified CMs</CardDescription>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 tabular-nums">
              95.5% Target Met
            </span>
          </CardHeader>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[90, 100]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="onTimeRate"
                  name="On-Time Delivery"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Capacity By Product Category (Bar Chart) */}
        <Card className="p-5 lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Capacity Allocation by Product Category</CardTitle>
              <CardDescription>Units booked across key manufacturing verticals (Weekly)</CardDescription>
            </div>
          </CardHeader>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HISTORICAL_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="smtElectronics" name="SMT & Electronics" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="injectionMolding" name="Injection Molding" fill="#0EA5A4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medicalCleanroom" name="Medical Assembly" fill="#0284C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cncMachining" name="CNC Machining" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

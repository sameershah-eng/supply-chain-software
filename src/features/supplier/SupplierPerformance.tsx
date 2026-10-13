import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const SupplierPerformance: React.FC = () => {
  const perfData = [
    { month: 'May', onTime: 97.4, fillRate: 98.8 },
    { month: 'Jun', onTime: 96.8, fillRate: 99.1 },
    { month: 'Jul', onTime: 98.2, fillRate: 98.5 },
    { month: 'Aug', onTime: 97.9, fillRate: 99.4 },
    { month: 'Sep', onTime: 98.5, fillRate: 99.0 },
    { month: 'Oct', onTime: 98.9, fillRate: 99.6 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Supplier SLA Performance & Quality</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tier 1 qualification scores, order fill rate benchmarks, and dock-to-stock transit consistency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="On-Time Delivery"
          value={98.9}
          suffix="%"
          icon={<Clock className="w-4 h-4 text-emerald-600" />}
          trend={{ value: 1.2, isPositiveGood: true }}
        />
        <StatCard
          label="Order Fill Rate"
          value={99.6}
          suffix="%"
          icon={<CheckCircle2 className="w-4 h-4 text-indigo-600" />}
          trend={{ value: 0.6, isPositiveGood: true }}
        />
        <StatCard
          label="Quality Acceptance"
          value={99.9}
          suffix="%"
          icon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
          subtext="Zero lot rejects"
        />
        <StatCard
          label="Avg Dock Transit"
          value={3.2}
          suffix=" days"
          icon={<TrendingUp className="w-4 h-4 text-slate-600" />}
          trend={{ value: -0.4, isPositiveGood: true, label: 'days vs Q2' }}
        />
      </div>

      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle>Historical SLA Trends (6 Months)</CardTitle>
            <CardDescription>On-time delivery % vs line item order fill rate</CardDescription>
          </div>
          <Badge variant="emerald">Tier 1 Certified Supplier</Badge>
        </CardHeader>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={perfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[95, 100]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="onTime"
                name="On-Time Delivery %"
                stroke="#0EA5A4"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0EA5A4' }}
              />
              <Line
                type="monotone"
                dataKey="fillRate"
                name="Fill Rate %"
                stroke="#4F46E5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#4F46E5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../store/useStore';
import { formatNumber, formatDate } from '../../lib/utils';
import { Clock, Truck, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

export const SupplierTimeline: React.FC = () => {
  const { materialRequests, currentUser } = useStore();

  const supplierReqs = materialRequests.filter(
    (m) =>
      m.supplierId === currentUser?.companyId || m.supplierName === currentUser?.companyName
  );

  // Group by upcoming weeks
  const commitments = [
    {
      week: 'Week 43 (Current)',
      range: 'Oct 19 - Oct 25',
      items: supplierReqs.filter((m) => m.status === 'confirmed' || m.status === 'partial'),
    },
    {
      week: 'Week 44',
      range: 'Oct 26 - Nov 01',
      items: supplierReqs.filter((m) => m.status === 'delayed'),
    },
    {
      week: 'Week 45',
      range: 'Nov 02 - Nov 08',
      items: supplierReqs.filter((m) => m.status === 'pending'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Upcoming Delivery Commitments</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Weekly dispatch commitments, staged carrier freight schedules, and customer CM destinations.
        </p>
      </div>

      <div className="space-y-5">
        {commitments.map((group, idx) => (
          <Card key={group.week} className="p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{group.week}</h3>
                  <span className="text-[11px] text-slate-400">{group.range}</span>
                </div>
              </div>
              <Badge variant={idx === 0 ? 'emerald' : 'slate'}>
                {group.items.length} Shipments Scheduled
              </Badge>
            </div>

            {group.items.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No material shipments scheduled for this week window.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#FAFAF8] rounded-xl border border-slate-200/80 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.orderNumber}</span>
                        <Badge
                          variant={
                            item.status === 'confirmed'
                              ? 'emerald'
                              : item.status === 'delayed'
                              ? 'coral'
                              : 'amber'
                          }
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="font-medium text-slate-800 mt-1">{item.materialName}</p>
                      <p className="text-[11px] text-slate-500">Destination: {item.cmName}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatNumber(item.quantityNeeded)} {item.unit}
                      </span>
                      <span className="text-slate-500">
                        ETA: {formatDate(item.confirmedDeliveryDate || item.requestedDeliveryDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

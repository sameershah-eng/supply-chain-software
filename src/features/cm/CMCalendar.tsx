import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../store/useStore';
import { formatNumber } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Wrench, CheckCircle2, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';

export const CMCalendar: React.FC = () => {
  const { productionLines, currentUser, toggleLineBlockedWeek } = useStore();
  const { showToast } = useToast();

  const cmLines = productionLines.filter(
    (l) => l.cmId === currentUser?.companyId || l.cmName === currentUser?.companyName
  );

  const weeks = [42, 43, 44, 45, 46, 47, 48, 49];

  const handleToggleMaintenance = (lineId: string, lineName: string, week: number) => {
    toggleLineBlockedWeek(lineId, week);
    const line = cmLines.find((l) => l.id === lineId);
    const isNowBlocked = !line?.blockedWeeks.includes(week);

    showToast({
      type: isNowBlocked ? 'warning' : 'success',
      title: isNowBlocked ? 'Maintenance Window Scheduled' : 'Maintenance Window Cleared',
      message: `${lineName} is now ${isNowBlocked ? 'blocked' : 'available'} for Week ${week}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">8-Week Line Capacity Calendar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Booked vs free units per line. Click &quot;Maint.&quot; on any week to block out scheduled tooling overhaul or preventive servicing.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
            <span className="text-slate-600">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span className="text-slate-600">Maintenance</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {cmLines.map((line) => (
          <Card key={line.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{line.name}</h3>
                <p className="text-xs text-slate-500">
                  {line.category} · Max Throughput: {formatNumber(line.unitsPerWeek)} units/week
                </p>
              </div>
              <Badge variant={line.status === 'operational' ? 'emerald' : 'amber'}>
                {line.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {weeks.map((week) => {
                const isBlocked = line.blockedWeeks.includes(week);
                const booked = isBlocked ? line.unitsPerWeek : line.bookedUnits[week] || 0;
                const free = Math.max(0, line.unitsPerWeek - booked);
                const util = (booked / line.unitsPerWeek) * 100;

                return (
                  <div
                    key={week}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                      isBlocked
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                        : util > 85
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                        <span>W{week}</span>
                        {isBlocked ? (
                          <Wrench className="w-3.5 h-3.5 text-amber-700" />
                        ) : (
                          <span className="text-[10px] tabular-nums">{util.toFixed(0)}%</span>
                        )}
                      </div>

                      {isBlocked ? (
                        <div className="py-2 text-center text-[11px] font-bold text-amber-900">
                          MAINTENANCE
                        </div>
                      ) : (
                        <div className="space-y-1 my-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Booked:</span>
                            <span className="font-semibold text-slate-800 tabular-nums">{formatNumber(booked)}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Free:</span>
                            <span className="font-semibold text-emerald-700 tabular-nums">{formatNumber(free)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, util)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleMaintenance(line.id, line.name, week)}
                      className={`w-full mt-2 py-1 px-1.5 text-[10px] font-semibold rounded-md border transition-colors cursor-pointer text-center ${
                        isBlocked
                          ? 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isBlocked ? 'Clear Maint.' : 'Block Maint.'}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

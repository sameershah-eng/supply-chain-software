import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../store/useStore';
import { Partner, ProductionLine } from '../../types';
import { formatNumber, formatPercent } from '../../lib/utils';
import { Info, AlertTriangle, Layers } from 'lucide-react';

export const AdminHeatmap: React.FC = () => {
  const { partners, productionLines, orders } = useStore();
  const cms = partners.filter((p) => p.type === 'cm');

  // Next 12 weeks: W42 to W53
  const weeks = Array.from({ length: 12 }, (_, i) => 42 + i);

  // Selected cell for drilldown modal
  const [selectedCell, setSelectedCell] = useState<{
    cm: Partner;
    week: number;
    lines: ProductionLine[];
    utilization: number;
    totalCapacity: number;
    bookedUnits: number;
  } | null>(null);

  // Calculate CM utilization per week
  const getCmWeekStats = (cmId: string, week: number) => {
    const lines = productionLines.filter((l) => l.cmId === cmId);
    let totalCap = 0;
    let booked = 0;

    lines.forEach((l) => {
      totalCap += l.unitsPerWeek;
      if (l.blockedWeeks.includes(week)) {
        // Blocked for maintenance counts as 100% capacity consumed or zero available
        booked += l.unitsPerWeek;
      } else {
        booked += l.bookedUnits[week] || 0;
      }
    });

    const utilization = totalCap > 0 ? (booked / totalCap) * 100 : 0;
    return { utilization, totalCap, booked, lines };
  };

  // Color styles based on utilization thresholds
  const getCellColorClass = (util: number) => {
    if (util > 85) return 'bg-rose-100 text-rose-900 border-rose-200 hover:bg-rose-200';
    if (util >= 60) return 'bg-amber-100/90 text-amber-900 border-amber-200 hover:bg-amber-200';
    return 'bg-emerald-50 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100';
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">12-Week CM Capacity Heatmap</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time aggregate line utilization across contract manufacturers. Click any cell to inspect line-level commitments.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
            <span className="text-slate-600">&lt;60% (Optimal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="text-slate-600">60-85% (Moderate)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-200 border border-rose-300" />
            <span className="text-slate-600">&gt;85% (Constrained)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold text-slate-700 min-w-[200px] sticky left-0 bg-[#FAFAF8] z-10 border-r border-slate-200">
                  Contract Manufacturer
                </th>
                {weeks.map((wk) => (
                  <th key={wk} className="py-3 px-2 text-center font-semibold border-r border-slate-100 last:border-r-0 min-w-[68px]">
                    W{wk}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cms.map((cm) => (
                <tr key={cm.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* CM Name + Location */}
                  <td className="py-3 px-4 font-medium text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                    <div className="truncate font-semibold">{cm.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{cm.location}</div>
                  </td>

                  {/* 12 Week Cells */}
                  {weeks.map((wk) => {
                    const stats = getCmWeekStats(cm.id, wk);
                    return (
                      <td key={wk} className="p-1 border-r border-slate-100 last:border-r-0">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCell({
                              cm,
                              week: wk,
                              lines: stats.lines,
                              utilization: stats.utilization,
                              totalCapacity: stats.totalCap,
                              bookedUnits: stats.booked,
                            })
                          }
                          className={`w-full py-2.5 px-1 rounded-lg border text-center transition-all cursor-pointer font-medium tabular-nums ${getCellColorClass(
                            stats.utilization
                          )}`}
                          title={`Week ${wk}: ${stats.utilization.toFixed(0)}% utilized (${formatNumber(stats.booked)}/${formatNumber(stats.totalCap)})`}
                        >
                          <span className="block text-[11px] font-bold">
                            {stats.utilization.toFixed(0)}%
                          </span>
                          <span className="block text-[9px] opacity-75 truncate">
                            {formatNumber(stats.booked)}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Drilldown Modal */}
      {selectedCell && (
        <Modal
          isOpen={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          title={
            <div className="flex items-center gap-2">
              <span>{selectedCell.cm.name}</span>
              <Badge variant={selectedCell.utilization > 85 ? 'coral' : selectedCell.utilization >= 60 ? 'amber' : 'emerald'}>
                Week {selectedCell.week} · {selectedCell.utilization.toFixed(1)}% Utilized
              </Badge>
            </div>
          }
          description={`Capacity breakdown across ${selectedCell.lines.length} production lines for Week ${selectedCell.week}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            {/* Aggregate Metric Banner */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-500">Total Weekly Capacity</span>
                <p className="text-base font-bold text-slate-900 tabular-nums">
                  {formatNumber(selectedCell.totalCapacity)} units
                </p>
              </div>
              <div>
                <span className="text-slate-500">Booked Units</span>
                <p className="text-base font-bold text-slate-900 tabular-nums">
                  {formatNumber(selectedCell.bookedUnits)} units
                </p>
              </div>
            </div>

            {/* Individual Line Status */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Production Lines Breakdown
              </p>
              {selectedCell.lines.map((line) => {
                const isBlocked = line.blockedWeeks.includes(selectedCell.week);
                const booked = isBlocked ? line.unitsPerWeek : line.bookedUnits[selectedCell.week] || 0;
                const util = (booked / line.unitsPerWeek) * 100;

                return (
                  <div
                    key={line.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{line.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{line.category}</p>
                      {isBlocked && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-1">
                          <AlertTriangle className="w-3 h-3" /> Scheduled Maintenance
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 tabular-nums">
                        {formatNumber(booked)} / {formatNumber(line.unitsPerWeek)} units
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600 mt-0.5 tabular-nums">
                        {util.toFixed(0)}% utilized
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

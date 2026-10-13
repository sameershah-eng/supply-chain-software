import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PRODUCT_CATEGORIES } from '../../lib/constants';
import { ProductCategory } from '../../types';
import { useStore } from '../../store/useStore';
import { formatNumber } from '../../lib/utils';
import { Compass, Calendar, ArrowRight, Layers, Factory } from 'lucide-react';

interface CustomerCapacityExplorerProps {
  onSelectCategoryToBook: (category: ProductCategory) => void;
}

export const CustomerCapacityExplorer: React.FC<CustomerCapacityExplorerProps> = ({
  onSelectCategoryToBook,
}) => {
  const { productionLines, partners } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const weeks = [43, 44, 45, 46, 47, 48, 49, 50];

  const categoriesToShow =
    selectedCategory === 'all'
      ? PRODUCT_CATEGORIES
      : PRODUCT_CATEGORIES.filter((c) => c === selectedCategory);

  // Helper to calculate free units for category in a specific week
  const getCategoryWeekFree = (category: string, week: number) => {
    const lines = productionLines.filter(
      (l) => l.category === category && l.status === 'operational'
    );
    let free = 0;
    lines.forEach((l) => {
      if (!l.blockedWeeks.includes(week)) {
        const booked = l.bookedUnits[week] || 0;
        free += Math.max(0, l.unitsPerWeek - booked);
      }
    });
    return free;
  };

  const getCategoryTotalStats = (category: string) => {
    const lines = productionLines.filter(
      (l) => l.category === category && l.status === 'operational'
    );
    const cmIds = new Set(lines.map((l) => l.cmId));
    const avgLeadTime = lines.length > 0 ? lines[0].leadTimeDays : 14;
    return { lineCount: lines.length, cmCount: cmIds.size, avgLeadTime };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">8-Week Capacity Explorer</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent view of verified contract manufacturer line availability by technology vertical. Plan NPI ramps and volume runs ahead of schedule.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Manufacturing Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {categoriesToShow.map((category) => {
          const stats = getCategoryTotalStats(category);

          return (
            <Card key={category} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>{category}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {stats.cmCount} Qualified Facilities · {stats.lineCount} Operational Lines · Standard Lead Time: {stats.avgLeadTime} days
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="gradient"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => onSelectCategoryToBook(category as ProductCategory)}
                >
                  Book In This Vertical
                </Button>
              </div>

              {/* 8 Weeks Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {weeks.map((week) => {
                  const freeUnits = getCategoryWeekFree(category, week);
                  const isHighCapacity = freeUnits > 8000;
                  const isLowCapacity = freeUnits < 3000;

                  return (
                    <div
                      key={week}
                      className={`p-3 rounded-xl border text-xs text-center transition-all ${
                        isLowCapacity
                          ? 'bg-rose-50/40 border-rose-200'
                          : isHighCapacity
                          ? 'bg-emerald-50/50 border-emerald-200/80'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        W{week}
                      </span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums block my-1">
                        {formatNumber(freeUnits)}
                      </span>
                      <span
                        className={`text-[10px] font-medium block ${
                          isLowCapacity
                            ? 'text-rose-700'
                            : isHighCapacity
                            ? 'text-emerald-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {isLowCapacity ? 'High Demand' : isHighCapacity ? 'Abundant' : 'Standard'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

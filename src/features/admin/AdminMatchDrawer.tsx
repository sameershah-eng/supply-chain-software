import React, { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CustomerRequest } from '../../types';
import { supplyChainApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { Check, Star, Clock, Factory, AlertCircle, Sparkles } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface AdminMatchDrawerProps {
  request: CustomerRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onMatched: () => void;
}

export const AdminMatchDrawer: React.FC<AdminMatchDrawerProps> = ({
  request,
  isOpen,
  onClose,
  onMatched,
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (request && isOpen) {
      setLoading(true);
      supplyChainApi
        .calculateCmFit(request.category, request.quantity, 45)
        .then((res) => {
          setCandidates(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [request, isOpen]);

  if (!request) return null;

  const handleAssign = async (cmId: string, cmName: string, lineId?: string) => {
    setAssigningId(cmId);
    try {
      await supplyChainApi.assignRequestToCm(request.id, cmId, cmName, lineId);
      showToast({
        type: 'success',
        title: 'Capacity Job Assigned',
        message: `${request.requestNumber} successfully matched to ${cmName}. Awaiting CM acceptance.`,
      });
      onMatched();
      onClose();
    } catch {
      showToast({
        type: 'error',
        title: 'Assignment Failed',
        message: 'Could not match request to CM. Please retry.',
      });
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Match Capacity Request"
      subtitle={`${request.requestNumber} · ${request.customerName}`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Request Brief Card */}
        <div className="p-4 bg-[#FAFAF8] rounded-xl border border-slate-200/90 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 text-sm">{request.productName}</span>
            <Badge variant={request.priority === 'critical' ? 'coral' : request.priority === 'high' ? 'amber' : 'slate'}>
              {request.priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
            <div>
              <span className="text-slate-400">Category:</span> <span className="font-medium text-slate-800">{request.category}</span>
            </div>
            <div>
              <span className="text-slate-400">Quantity Needed:</span> <span className="font-medium text-slate-800 tabular-nums">{formatNumber(request.quantity)} units</span>
            </div>
            <div>
              <span className="text-slate-400">Target Delivery:</span> <span className="font-medium text-slate-800">{request.targetDeliveryDate}</span>
            </div>
            <div>
              <span className="text-slate-400">Submitted:</span> <span className="font-medium text-slate-800">{request.submittedDate}</span>
            </div>
          </div>
          {request.specs && (
            <div className="pt-2 border-t border-slate-200/60 text-slate-600">
              <span className="text-slate-400 font-medium">Technical Specs:</span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60">
                {request.specs}
              </p>
            </div>
          )}
        </div>

        {/* Candidate Ranking List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Recommended Contract Manufacturers (Ranked by Fit)
            </h3>
            <span className="text-[11px] text-slate-400">Based on free slots & capability</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((cand, idx) => {
                const isAssigning = assigningId === cand.cm.id;
                const hasMatchingLine = cand.matchingLines.length > 0;

                return (
                  <div
                    key={cand.cm.id}
                    className={`p-4 rounded-xl border transition-all text-xs ${
                      idx === 0
                        ? 'bg-white border-teal-300 shadow-xs ring-1 ring-teal-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{cand.cm.name}</span>
                          {idx === 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              Top Recommendation
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {cand.cm.location} · Rating: {cand.cm.rating}/5.0
                        </p>
                      </div>

                      {/* Fit Score Badge */}
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-slate-900 tabular-nums">
                          {cand.overallScore}
                        </span>
                        <span className="text-[10px] text-slate-400 block -mt-1">FIT SCORE</span>
                      </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 py-2 my-2 border-y border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Available Slot</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {formatNumber(cand.availableCapacityInWeek)} units
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Lead Time</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {cand.estimatedLeadTimeDays} days
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Matching Lines</span>
                        <span className="font-semibold text-slate-800">
                          {cand.matchingLines.length > 0 ? `${cand.matchingLines.length} active` : 'No exact line'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        {hasMatchingLine
                          ? cand.matchingLines[0]?.name
                          : 'Requires line retooling'}
                      </span>
                      <Button
                        size="sm"
                        variant={idx === 0 ? 'gradient' : 'secondary'}
                        isLoading={isAssigning}
                        onClick={() => handleAssign(cand.cm.id, cand.cm.name, cand.matchingLines[0]?.id)}
                      >
                        Assign to this CM
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

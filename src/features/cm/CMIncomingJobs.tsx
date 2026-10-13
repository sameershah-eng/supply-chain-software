import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { CustomerRequest } from '../../types';
import { formatNumber, formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Inbox, Check, X, AlertCircle } from 'lucide-react';
import { supplyChainApi } from '../../services/api';

export const CMIncomingJobs: React.FC = () => {
  const { requests, currentUser } = useStore();
  const { showToast } = useToast();

  const [declineModalReq, setDeclineModalReq] = useState<CustomerRequest | null>(null);
  const [declineReason, setDeclineReason] = useState('Capacity constraint during target delivery window');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Incoming jobs matched to this CM
  const assignedJobs = requests.filter(
    (r) =>
      r.status === 'matched' &&
      (r.assignedCmId === currentUser?.companyId || r.assignedCmName === currentUser?.companyName)
  );

  const handleAccept = async (req: CustomerRequest) => {
    setIsProcessing(req.id);
    try {
      await supplyChainApi.respondToAssignedJob(req.id, true);
      showToast({
        type: 'success',
        title: 'Job Accepted & Scheduled',
        message: `${req.requestNumber} accepted! Converted to active production order and raw materials requested.`,
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not accept job. Please try again.',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineModalReq) return;
    setIsProcessing(declineModalReq.id);
    try {
      await supplyChainApi.respondToAssignedJob(declineModalReq.id, false, declineReason);
      showToast({
        type: 'warning',
        title: 'Job Declined',
        message: `${declineModalReq.requestNumber} declined. Admin alerted for reassignment.`,
      });
      setDeclineModalReq(null);
    } catch {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not process decline. Please try again.',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Incoming Production Job Assignments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin matched customer requests awaiting your facility review. Accepting automatically generates production scheduling and supplier material orders.
          </p>
        </div>

        <Badge variant="teal">{assignedJobs.length} Pending Acceptance</Badge>
      </div>

      <div className="space-y-4">
        {assignedJobs.length === 0 ? (
          <Card className="py-16 text-center text-slate-500">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No incoming jobs at this time</p>
            <p className="text-xs text-slate-400 mt-1">
              New customer requests matched by Admin will appear here for review.
            </p>
          </Card>
        ) : (
          assignedJobs.map((req) => (
            <Card key={req.id} className="p-5 border-l-4 border-l-teal-600">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">{req.requestNumber}</span>
                    <Badge variant={req.priority === 'critical' ? 'coral' : req.priority === 'high' ? 'amber' : 'slate'}>
                      {req.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Matched {formatDate(req.matchedDate || req.submittedDate)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-800 text-sm mt-1">{req.productName}</h3>
                  <p className="text-xs text-slate-500">{req.category} · Customer: {req.customerName}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2.5 my-2.5 bg-[#FAFAF8] rounded-xl px-3 border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quantity</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatNumber(req.quantity)} units
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Target Delivery</span>
                      <span className="font-bold text-slate-900">{formatDate(req.targetDeliveryDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Required By</span>
                      <span className="font-medium text-slate-700">{req.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Specs Status</span>
                      <span className="font-medium text-teal-800">Engineering Approved</span>
                    </div>
                  </div>

                  {req.specs && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="font-semibold text-slate-700">Specs / Requirements:</span> {req.specs}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                  <Button
                    variant="gradient"
                    size="md"
                    isLoading={isProcessing === req.id}
                    leftIcon={<Check className="w-4 h-4" />}
                    onClick={() => handleAccept(req)}
                    className="w-full sm:w-auto"
                  >
                    Accept & Schedule Job
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    disabled={isProcessing === req.id}
                    leftIcon={<X className="w-4 h-4" />}
                    onClick={() => setDeclineModalReq(req)}
                    className="w-full sm:w-auto text-rose-700 border-rose-200 hover:bg-rose-50"
                  >
                    Decline Job
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Decline Reason Modal */}
      {declineModalReq && (
        <Modal
          isOpen={!!declineModalReq}
          onClose={() => setDeclineModalReq(null)}
          title="Decline Capacity Request"
          description={`Please provide an operational justification for declining ${declineModalReq.requestNumber}. Admin will re-match.`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <Input
              label="Decline Reason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Tooling maintenance in progress; lead time unfeasible"
              required
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDeclineModalReq(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isProcessing === declineModalReq.id}
                onClick={handleDeclineConfirm}
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

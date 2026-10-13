import React, { useState, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PRODUCT_CATEGORIES } from '../../lib/constants';
import { ProductCategory } from '../../types';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ui/Toast';
import { supplyChainApi } from '../../services/api';
import { formatNumber } from '../../lib/utils';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface CustomerNewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const CustomerNewRequestModal: React.FC<CustomerNewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const { productionLines, currentUser } = useStore();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('5000');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-12-15');
  const [priority, setPriority] = useState<'standard' | 'high' | 'critical'>('standard');
  const [specs, setSpecs] = useState('');
  const [mockFileName, setMockFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live estimated availability preview based on free capacity
  const availabilityEstimate = useMemo(() => {
    const qty = Number(quantity) || 1;
    const matchingLines = productionLines.filter(
      (l) => l.category === category && l.status === 'operational'
    );

    let totalAvailable = 0;
    const currentWeek = 44;
    matchingLines.forEach((l) => {
      const booked = l.bookedUnits[currentWeek] || 0;
      totalAvailable += Math.max(0, l.unitsPerWeek - booked);
    });

    const canFulfill = totalAvailable >= qty;
    const qualifiedCms = new Set(matchingLines.map((l) => l.cmId)).size;
    const avgLeadDays = matchingLines.length > 0 ? matchingLines[0].leadTimeDays : 14;

    return {
      totalAvailable,
      canFulfill,
      qualifiedCms,
      avgLeadDays,
    };
  }, [category, quantity, productionLines]);

  const handleNext = () => {
    if (step === 1) {
      if (!productName.trim()) return;
      setStep(2);
    } else if (step === 2) {
      if (!targetDeliveryDate) return;
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await supplyChainApi.submitRequest({
        productName,
        category,
        quantity: Number(quantity) || 5000,
        targetDeliveryDate,
        priority,
        specs: specs || 'Standard ISO tolerances apply. CoC required with final shipment.',
      });

      showToast({
        type: 'success',
        title: 'Capacity Request Submitted',
        message: `Your request for ${formatNumber(Number(quantity))} units of ${productName} is in queue for CM matching.`,
      });

      // Reset
      setProductName('');
      setSpecs('');
      setStep(1);
      if (onSubmitted) onSubmitted();
      onClose();
    } catch {
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Could not submit request. Please retry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Manufacturing Capacity"
      description={`Step ${step} of 3 · ${currentUser?.companyName || 'Customer Portal'}`}
      maxWidth="lg"
    >
      <div className="space-y-5 pt-2">
        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: 'Product Specs' },
            { num: 2, label: 'Timeline & Files' },
            { num: 3, label: 'Capacity Review' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2 rounded-lg border text-xs text-center transition-all ${
                step === s.num
                  ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold'
                  : step > s.num
                  ? 'bg-slate-50 border-slate-200 text-emerald-700 font-medium'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <span>
                {step > s.num ? '✓ ' : ''}
                {s.num}. {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Product & Quantity */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Item / Assembly Name"
              placeholder="e.g. Next-Gen Sensor Housing Enclosure"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />

            <Select
              label="Manufacturing Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Input
              label="Production Volume (Units)"
              type="number"
              min="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            {/* Instant Capacity Availability Preview */}
            <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-slate-200/90 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700">Estimated Network Availability</span>
                <Badge variant={availabilityEstimate.canFulfill ? 'emerald' : 'amber'}>
                  {availabilityEstimate.canFulfill ? 'Immediate Capacity' : 'Limited Slots'}
                </Badge>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Currently <strong>{formatNumber(availabilityEstimate.totalAvailable)} units/week</strong> free across{' '}
                {availabilityEstimate.qualifiedCms} qualified contract manufacturers. Standard lead time: {availabilityEstimate.avgLeadDays} days.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Timeline, Priority, Specs, File dropzone */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Target Delivery Date"
                type="date"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                required
              />
              <Select
                label="Project Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="standard">Standard Production</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical (NPI / Ramp)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Technical Specifications & Notes
              </label>
              <textarea
                rows={3}
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border border-slate-200/90 py-2 px-3 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/40"
                placeholder="Tolerance requirements, resin grade, surface finish, inspection protocols..."
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
              />
            </div>

            {/* File attachment dropzone (UI only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                CAD Models / Spec Sheet Attachments (STEP, PDF, DXF)
              </label>
              <div
                onClick={() => setMockFileName('Drawing_REV_C_SpecSheet.step')}
                className="p-4 border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-xl text-center cursor-pointer transition-colors bg-[#FAFAF8]/50"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-700">
                  {mockFileName ? mockFileName : 'Click to attach CAD drawing package'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {mockFileName ? 'File attached (2.4 MB)' : 'Drag and drop or browse files'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-slate-200/90 space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Product Name</span>
                <span className="font-bold text-slate-900">{productName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-800">{category}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Volume Required</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatNumber(Number(quantity))} units
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Target Delivery Date</span>
                <span className="font-semibold text-slate-800">{targetDeliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority Level</span>
                <Badge variant={priority === 'critical' ? 'coral' : priority === 'high' ? 'amber' : 'slate'}>
                  {priority.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                Ready for dispatch. Once submitted, Capora admins will evaluate capacity fits across qualified CMs and assign a production line within 4 hours.
              </p>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={handleBack}
            >
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={handleNext}
              disabled={step === 1 && !productName.trim()}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="gradient"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              Confirm & Book Capacity
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

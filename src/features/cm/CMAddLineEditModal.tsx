import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PRODUCT_CATEGORIES } from '../../lib/constants';
import { ProductCategory, ProductionLine } from '../../types';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ui/Toast';

interface CMAddLineEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineToEdit?: ProductionLine | null;
}

export const CMAddLineEditModal: React.FC<CMAddLineEditModalProps> = ({
  isOpen,
  onClose,
  lineToEdit,
}) => {
  const { currentUser, addProductionLine, updateProductionLine } = useStore();
  const { showToast } = useToast();

  const [name, setName] = useState(lineToEdit?.name || '');
  const [category, setCategory] = useState<ProductCategory>(
    lineToEdit?.category || PRODUCT_CATEGORIES[0]
  );
  const [unitsPerWeek, setUnitsPerWeek] = useState(lineToEdit?.unitsPerWeek?.toString() || '10000');
  const [leadTimeDays, setLeadTimeDays] = useState(lineToEdit?.leadTimeDays?.toString() || '14');
  const [minBatchSize, setMinBatchSize] = useState(lineToEdit?.minBatchSize?.toString() || '1000');
  const [status, setStatus] = useState<'operational' | 'maintenance' | 'offline'>(
    lineToEdit?.status || 'operational'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (lineToEdit) {
      updateProductionLine(lineToEdit.id, {
        name,
        category,
        unitsPerWeek: Number(unitsPerWeek) || 10000,
        leadTimeDays: Number(leadTimeDays) || 14,
        minBatchSize: Number(minBatchSize) || 1000,
        status,
      });
      showToast({
        type: 'success',
        title: 'Production Line Updated',
        message: `${name} line specifications saved.`,
      });
    } else {
      addProductionLine({
        cmId: currentUser?.companyId || 'cm_northgate',
        cmName: currentUser?.companyName || 'Northgate Precision Molding',
        name,
        category,
        unitsPerWeek: Number(unitsPerWeek) || 10000,
        status,
        blockedWeeks: [],
        bookedUnits: {},
        leadTimeDays: Number(leadTimeDays) || 14,
        minBatchSize: Number(minBatchSize) || 1000,
      });
      showToast({
        type: 'success',
        title: 'New Line Added',
        message: `${name} has been published to capacity matching network.`,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lineToEdit ? 'Edit Production Line' : 'Add New Production Line'}
      description="Configure line weekly volume throughput, manufacturing vertical, and standard lead times."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Line Name / Identification"
          placeholder="e.g. High-Speed SMT Line 3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Process / Capability Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Weekly Capacity (Units/Wk)"
            type="number"
            value={unitsPerWeek}
            onChange={(e) => setUnitsPerWeek(e.target.value)}
            required
          />
          <Input
            label="Standard Lead Time (Days)"
            type="number"
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min Batch Size (Units)"
            type="number"
            value={minBatchSize}
            onChange={(e) => setMinBatchSize(e.target.value)}
            required
          />
          <Select
            label="Operating Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="operational">Operational</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient">
            {lineToEdit ? 'Save Changes' : 'Create Line'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

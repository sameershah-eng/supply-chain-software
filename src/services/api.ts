import { useStore } from '../store/useStore';
import { CustomerRequest, Order, ProductionStage } from '../types';

// Realistic delay simulator
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const supplyChainApi = {
  // Capacity Matching Algorithm
  async calculateCmFit(category: string, quantity: number, targetWeek: number = 44) {
    await delay(350);
    const { productionLines, partners, materials } = useStore.getState();

    const cms = partners.filter((p) => p.type === 'cm' && p.status === 'active');

    const rankedCms = cms.map((cm) => {
      // Find lines matching category
      const matchingLines = productionLines.filter(
        (l) => l.cmId === cm.id && l.category === category && l.status === 'operational'
      );

      const hasCapability = matchingLines.length > 0;
      let availableCapacityInWeek = 0;
      let totalCapacity = 0;

      matchingLines.forEach((line) => {
        const booked = line.bookedUnits[targetWeek] || 0;
        const free = Math.max(0, line.unitsPerWeek - booked);
        availableCapacityInWeek += free;
        totalCapacity += line.unitsPerWeek;
      });

      const capacityFitPercent = totalCapacity > 0
        ? Math.min(100, Math.round((availableCapacityInWeek / (quantity || 1)) * 100))
        : 0;

      // Material readiness check
      const leadTimeScore = cm.rating * 18; // approx 85-90
      const overallScore = Math.round(
        (hasCapability ? 40 : 0) +
        Math.min(35, (capacityFitPercent / 100) * 35) +
        (cm.rating / 5) * 15 +
        10
      );

      return {
        cm,
        matchingLines,
        availableCapacityInWeek,
        capacityFitPercent,
        overallScore,
        estimatedLeadTimeDays: matchingLines[0]?.leadTimeDays || 14,
        isRecommended: overallScore >= 80,
      };
    });

    return rankedCms.sort((a, b) => b.overallScore - a.overallScore);
  },

  // Submit request
  async submitRequest(requestData: {
    productName: string;
    category: any;
    quantity: number;
    targetDeliveryDate: string;
    specs: string;
    priority?: 'standard' | 'high' | 'critical';
  }) {
    await delay(400);
    return useStore.getState().submitCustomerRequest(requestData);
  },

  // Match Request to CM
  async assignRequestToCm(requestId: string, cmId: string, cmName: string, lineId?: string) {
    await delay(350);
    useStore.getState().matchRequestToCM(requestId, cmId, cmName, lineId);
    return { success: true };
  },

  // CM Response
  async respondToAssignedJob(requestId: string, accept: boolean, declineReason?: string) {
    await delay(400);
    useStore.getState().cmRespondToRequest(requestId, accept, declineReason);
    return { success: true };
  },

  // Supplier Response
  async respondToMaterialRequest(
    materialRequestId: string,
    status: 'confirmed' | 'partial' | 'delayed',
    notes?: string,
    newDeliveryDate?: string
  ) {
    await delay(350);
    useStore.getState().supplierRespondMaterialRequest(materialRequestId, status, notes, newDeliveryDate);
    return { success: true };
  },

  // Update Production Stage
  async advanceProductionStage(orderId: string, newStage: ProductionStage, stageProgress: number, note: string) {
    await delay(300);
    useStore.getState().updateOrderStage(orderId, newStage, stageProgress, note);
    return { success: true };
  },
};

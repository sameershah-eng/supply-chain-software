import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_USERS } from '../lib/constants';
import {
  Alert,
  CustomerRequest,
  Material,
  MaterialRequest,
  Notification,
  Order,
  Partner,
  PartnerStatus,
  ProductionLine,
  ProductionStage,
  Role,
  User,
} from '../types';
import {
  SEED_ALERTS,
  SEED_CUSTOMER_REQUESTS,
  SEED_MATERIAL_REQUESTS,
  SEED_MATERIALS,
  SEED_ORDERS,
  SEED_PARTNERS,
  SEED_PRODUCTION_LINES,
} from '../data/seedData';

interface AppState {
  currentUser: User | null;
  currentRole: Role;
  orders: Order[];
  requests: CustomerRequest[];
  productionLines: ProductionLine[];
  partners: Partner[];
  materials: Material[];
  materialRequests: MaterialRequest[];
  alerts: Alert[];
  notifications: Notification[];
  isCommandPaletteOpen: boolean;
  isLiveTickerActive: boolean;

  // Auth actions
  login: (role: Role) => void;
  switchRole: (role: Role) => void;
  logout: () => void;

  // Requests & Matching
  submitCustomerRequest: (req: {
    productName: string;
    category: any;
    quantity: number;
    targetDeliveryDate: string;
    specs: string;
    priority?: 'standard' | 'high' | 'critical';
  }) => CustomerRequest;
  matchRequestToCM: (requestId: string, cmId: string, cmName: string, lineId?: string) => void;
  cmRespondToRequest: (requestId: string, accept: boolean, declineReason?: string) => void;

  // Orders & Production
  updateOrderStage: (orderId: string, newStage: ProductionStage, stageProgress: number, note: string) => void;
  updateOrderProgress: (orderId: string, stageProgress: number) => void;

  // Materials & Suppliers
  supplierRespondMaterialRequest: (
    materialRequestId: string,
    status: 'confirmed' | 'partial' | 'delayed',
    notes?: string,
    newDeliveryDate?: string
  ) => void;
  updateMaterialStock: (materialId: string, newQuantity: number) => void;
  reorderMaterial: (materialId: string, quantity: number) => void;

  // Lines & Capacity
  addProductionLine: (line: Omit<ProductionLine, 'id'>) => void;
  updateProductionLine: (lineId: string, updates: Partial<ProductionLine>) => void;
  toggleLineBlockedWeek: (lineId: string, weekNumber: number) => void;

  // Partners
  updatePartnerStatus: (partnerId: string, status: PartnerStatus) => void;

  // Alerts & Notifications
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;

  // UI state
  setCommandPaletteOpen: (open: boolean) => void;
  toggleLiveTicker: () => void;
  simulateLiveTick: () => void;
  resetToDefaults: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: DEMO_USERS.admin,
      currentRole: 'admin',
      orders: SEED_ORDERS,
      requests: SEED_CUSTOMER_REQUESTS,
      productionLines: SEED_PRODUCTION_LINES,
      partners: SEED_PARTNERS,
      materials: SEED_MATERIALS,
      materialRequests: SEED_MATERIAL_REQUESTS,
      alerts: SEED_ALERTS,
      notifications: [
        {
          id: 'notif_init_01',
          title: 'System Initialized',
          message: 'Capora supply chain network connected across 6 CMs and 8 suppliers.',
          timestamp: new Date().toISOString(),
          read: false,
          roleTarget: 'all',
          type: 'capacity',
        },
      ],
      isCommandPaletteOpen: false,
      isLiveTickerActive: true,

      login: (role: Role) => {
        set({
          currentRole: role,
          currentUser: DEMO_USERS[role] || DEMO_USERS.admin,
        });
      },

      switchRole: (role: Role) => {
        set({
          currentRole: role,
          currentUser: DEMO_USERS[role] || DEMO_USERS.admin,
        });
      },

      logout: () => {
        set({
          currentUser: null,
          currentRole: 'admin',
        });
      },

      submitCustomerRequest: (reqData) => {
        const state = get();
        const count = state.requests.length + 1;
        const newReq: CustomerRequest = {
          id: `req_${Date.now()}`,
          requestNumber: `REQ-2026-88${count < 10 ? '0' + count : count}`,
          customerId: state.currentUser?.companyId || 'cust_aeropulse',
          customerName: state.currentUser?.companyName || 'AeroPulse Systems',
          productName: reqData.productName,
          category: reqData.category,
          quantity: Number(reqData.quantity),
          submittedDate: new Date().toISOString().split('T')[0],
          targetDeliveryDate: reqData.targetDeliveryDate,
          specs: reqData.specs,
          status: 'pending_match',
          priority: reqData.priority || 'standard',
        };

        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          title: 'New Capacity Booking Request',
          message: `${newReq.customerName} submitted a request for ${newReq.quantity.toLocaleString()} units (${newReq.category}).`,
          timestamp: new Date().toISOString(),
          read: false,
          roleTarget: 'admin',
          type: 'request',
          linkTab: 'requests',
        };

        set((s) => ({
          requests: [newReq, ...s.requests],
          notifications: [newNotification, ...s.notifications],
        }));

        return newReq;
      },

      matchRequestToCM: (requestId, cmId, cmName, lineId) => {
        const state = get();
        const req = state.requests.find((r) => r.id === requestId);
        if (!req) return;

        const updatedRequests = state.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'matched' as const,
                assignedCmId: cmId,
                assignedCmName: cmName,
                matchedDate: new Date().toISOString().split('T')[0],
              }
            : r
        );

        const newNotif: Notification = {
          id: `notif_${Date.now()}`,
          title: 'Job Assigned to Your Facility',
          message: `Admin assigned ${req.requestNumber} (${req.productName}, ${req.quantity.toLocaleString()} units) to ${cmName}.`,
          timestamp: new Date().toISOString(),
          read: false,
          roleTarget: 'cm',
          type: 'order',
          linkTab: 'incoming',
        };

        set({
          requests: updatedRequests,
          notifications: [newNotif, ...state.notifications],
        });
      },

      cmRespondToRequest: (requestId, accept, declineReason) => {
        const state = get();
        const req = state.requests.find((r) => r.id === requestId);
        if (!req) return;

        if (accept) {
          // Accept -> convert into an active Order in Scheduled stage!
          const orderNum = `ORD-2026-${4400 + state.orders.length + 1}`;
          const cmPartner = state.partners.find((p) => p.id === req.assignedCmId);
          const cmLines = state.productionLines.filter((l) => l.cmId === req.assignedCmId);
          const assignedLine = cmLines.find((l) => l.category === req.category) || cmLines[0];

          // Calculate estimated delivery
          const targetDate = new Date(req.targetDeliveryDate);
          const estDate = new Date(targetDate.getTime() - 2 * 24 * 60 * 60 * 1000);

          const newOrder: Order = {
            id: `ord_${Date.now()}`,
            orderNumber: orderNum,
            customerId: req.customerId,
            customerName: req.customerName,
            cmId: req.assignedCmId || 'cm_northgate',
            cmName: req.assignedCmName || 'Northgate Precision Molding',
            lineId: assignedLine?.id,
            lineName: assignedLine?.name,
            productName: req.productName,
            category: req.category,
            quantity: req.quantity,
            submittedDate: req.submittedDate,
            targetDeliveryDate: req.targetDeliveryDate,
            estimatedDeliveryDate: estDate.toISOString().split('T')[0],
            currentStage: 'Scheduled',
            stageProgress: 10,
            overallProgress: 10,
            status: 'on_track',
            materialStatus: 'confirmed',
            specs: req.specs,
            history: [
              {
                stage: 'Scheduled',
                timestamp: new Date().toISOString(),
                note: `Job accepted by ${req.assignedCmName} and scheduled on line ${assignedLine?.name || 'Line 1'}`,
                updatedBy: `${state.currentUser?.name || 'CM Operations'}`,
              },
            ],
            weekAllocations: [{ weekNumber: 45, units: req.quantity }],
          };

          // Also create a material request for suppliers
          const relevantMat = state.materials.find(
            (m) =>
              (req.category.includes('Molding') && m.category.includes('Polymers')) ||
              (req.category.includes('Electronics') && m.category.includes('Substrates')) ||
              (req.category.includes('CNC') && m.category.includes('Metals')) ||
              (req.category.includes('Medical') && m.category.includes('Packaging')) ||
              (req.category.includes('Optics') && m.category.includes('Optics'))
          ) || state.materials[0];

          const newMatReq: MaterialRequest = {
            id: `mreq_${Date.now()}`,
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            cmId: newOrder.cmId,
            cmName: newOrder.cmName,
            supplierId: relevantMat.supplierId,
            supplierName: relevantMat.supplierName,
            materialId: relevantMat.id,
            materialName: relevantMat.name,
            quantityNeeded: Math.round(newOrder.quantity * 0.15),
            unit: relevantMat.unit,
            status: 'pending',
            requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date().toISOString().split('T')[0],
          };
          newOrder.materialRequestId = newMatReq.id;

          const updatedRequests = state.requests.map((r) =>
            r.id === requestId ? { ...r, status: 'converted' as const } : r
          );

          const customerNotif: Notification = {
            id: `notif_${Date.now()}_cust`,
            title: 'Production Job Confirmed',
            message: `${newOrder.cmName} accepted ${req.requestNumber} and issued order ${newOrder.orderNumber}.`,
            timestamp: new Date().toISOString(),
            read: false,
            roleTarget: 'customer',
            type: 'order',
            linkTab: 'orders',
          };

          const supplierNotif: Notification = {
            id: `notif_${Date.now()}_sup`,
            title: 'New Material Requirement',
            message: `${newOrder.cmName} requested ${newMatReq.quantityNeeded} ${newMatReq.unit} of ${newMatReq.materialName}.`,
            timestamp: new Date().toISOString(),
            read: false,
            roleTarget: 'supplier',
            type: 'material',
            linkTab: 'requests',
          };

          set({
            orders: [newOrder, ...state.orders],
            requests: updatedRequests,
            materialRequests: [newMatReq, ...state.materialRequests],
            notifications: [customerNotif, supplierNotif, ...state.notifications],
          });
        } else {
          // Declined
          const updatedRequests = state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: 'declined' as const,
                  declineReason: declineReason || 'Capacity constraints in requested week window',
                }
              : r
          );

          const adminNotif: Notification = {
            id: `notif_${Date.now()}_declined`,
            title: 'Capacity Request Declined by CM',
            message: `${req.assignedCmName} declined ${req.requestNumber}: "${declineReason || 'Capacity constraint'}". Reassignment needed.`,
            timestamp: new Date().toISOString(),
            read: false,
            roleTarget: 'admin',
            type: 'request',
            linkTab: 'requests',
          };

          set({
            requests: updatedRequests,
            notifications: [adminNotif, ...state.notifications],
          });
        }
      },

      updateOrderStage: (orderId, newStage, stageProgress, note) => {
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return;

        const stageWeights: Record<ProductionStage, number> = {
          'Scheduled': 15,
          'Materials Ready': 35,
          'In Production': 65,
          'Quality Check': 85,
          'Shipped': 95,
          'Delivered': 100,
        };

        const overallProgress = newStage === 'Delivered' ? 100 : stageWeights[newStage] || 50;
        const newHistoryItem = {
          stage: newStage,
          timestamp: new Date().toISOString(),
          note: note || `Advanced to ${newStage}`,
          updatedBy: `${state.currentUser?.name || 'Production Supervisor'} (${state.currentUser?.companyName || 'CM'})`,
        };

        const isCompleted = newStage === 'Delivered';

        const updatedOrders = state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                currentStage: newStage,
                stageProgress: stageProgress,
                overallProgress: overallProgress,
                status: isCompleted ? ('completed' as const) : o.status,
                history: [...o.history, newHistoryItem],
              }
            : o
        );

        const custNotif: Notification = {
          id: `notif_${Date.now()}_stage`,
          title: `Order Stage Update: ${order.orderNumber}`,
          message: `${order.productName} is now "${newStage}" (${overallProgress}% overall).`,
          timestamp: new Date().toISOString(),
          read: false,
          roleTarget: 'customer',
          type: 'order',
          linkTab: 'orders',
        };

        set({
          orders: updatedOrders,
          notifications: [custNotif, ...state.notifications],
        });
      },

      updateOrderProgress: (orderId, stageProgress) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  stageProgress: Math.min(100, Math.max(0, stageProgress)),
                }
              : o
          ),
        }));
      },

      supplierRespondMaterialRequest: (materialRequestId, status, notes, newDeliveryDate) => {
        const state = get();
        const mreq = state.materialRequests.find((m) => m.id === materialRequestId);
        if (!mreq) return;

        const updatedMaterialRequests = state.materialRequests.map((m) =>
          m.id === materialRequestId
            ? {
                ...m,
                status,
                supplierNotes: notes || m.supplierNotes,
                confirmedDeliveryDate: newDeliveryDate || m.confirmedDeliveryDate || m.requestedDeliveryDate,
              }
            : m
        );

        // Also reflect materialStatus in linked order
        const updatedOrders = state.orders.map((o) => {
          if (o.id === mreq.orderId) {
            const materialStatus =
              status === 'confirmed' ? 'ready' : status === 'delayed' ? 'delayed' : 'pending_arrival';
            return {
              ...o,
              materialStatus: materialStatus as any,
              status: status === 'delayed' ? ('at_risk' as const) : o.status,
              riskReason: status === 'delayed' ? `Material delay: ${mreq.materialName}` : o.riskReason,
            };
          }
          return o;
        });

        const cmNotif: Notification = {
          id: `notif_${Date.now()}_mat_resp`,
          title: `Material Request ${status === 'confirmed' ? 'Confirmed' : 'Updated'}`,
          message: `${mreq.supplierName} ${status === 'confirmed' ? 'confirmed' : 'flagged status ' + status} for ${mreq.materialName} (${mreq.orderNumber}).`,
          timestamp: new Date().toISOString(),
          read: false,
          roleTarget: 'cm',
          type: 'material',
          linkTab: 'production',
        };

        set({
          materialRequests: updatedMaterialRequests,
          orders: updatedOrders,
          notifications: [cmNotif, ...state.notifications],
        });
      },

      updateMaterialStock: (materialId, newQuantity) => {
        set((s) => ({
          materials: s.materials.map((m) =>
            m.id === materialId ? { ...m, quantityOnHand: Math.max(0, newQuantity) } : m
          ),
        }));
      },

      reorderMaterial: (materialId, quantity) => {
        const state = get();
        const mat = state.materials.find((m) => m.id === materialId);
        if (!mat) return;

        const updatedMaterials = state.materials.map((m) =>
          m.id === materialId ? { ...m, quantityOnHand: m.quantityOnHand + quantity, lastRestocked: new Date().toISOString().split('T')[0] } : m
        );

        const notif: Notification = {
          id: `notif_${Date.now()}_reorder`,
          title: 'Stock Replenished',
          message: `Added ${quantity.toLocaleString()} ${mat.unit} of ${mat.name} to inventory.`,
          timestamp: new Date().toISOString(),
          read: false,
          roleTarget: 'supplier',
          type: 'material',
          linkTab: 'inventory',
        };

        set({
          materials: updatedMaterials,
          notifications: [notif, ...state.notifications],
        });
      },

      addProductionLine: (lineData) => {
        const newLine: ProductionLine = {
          ...lineData,
          id: `line_${Date.now()}`,
          blockedWeeks: lineData.blockedWeeks || [],
          bookedUnits: lineData.bookedUnits || {},
        };
        set((s) => ({
          productionLines: [...s.productionLines, newLine],
        }));
      },

      updateProductionLine: (lineId, updates) => {
        set((s) => ({
          productionLines: s.productionLines.map((l) => (l.id === lineId ? { ...l, ...updates } : l)),
        }));
      },

      toggleLineBlockedWeek: (lineId, weekNumber) => {
        set((s) => ({
          productionLines: s.productionLines.map((l) => {
            if (l.id !== lineId) return l;
            const isBlocked = l.blockedWeeks.includes(weekNumber);
            const newBlocked = isBlocked
              ? l.blockedWeeks.filter((w) => w !== weekNumber)
              : [...l.blockedWeeks, weekNumber];
            return { ...l, blockedWeeks: newBlocked };
          }),
        }));
      },

      updatePartnerStatus: (partnerId, status) => {
        set((s) => ({
          partners: s.partners.map((p) => (p.id === partnerId ? { ...p, status } : p)),
        }));
      },

      markAlertRead: (alertId) => {
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
        }));
      },

      markAllAlertsRead: () => {
        set((s) => ({
          alerts: s.alerts.map((a) => ({ ...a, isRead: true })),
        }));
      },

      markNotificationRead: (notificationId) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        }));
      },

      markAllNotificationsRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      addNotification: (notif) => {
        const newN: Notification = {
          ...notif,
          id: `notif_${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((s) => ({
          notifications: [newN, ...s.notifications],
        }));
      },

      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      toggleLiveTicker: () => set((s) => ({ isLiveTickerActive: !s.isLiveTickerActive })),

      simulateLiveTick: () => {
        const state = get();
        // Realistic simulation choices:
        const choices = ['advance_order', 'stock_shift', 'new_request_ping'];
        const choice = choices[Math.floor(Math.random() * choices.length)];

        if (choice === 'advance_order') {
          // Find an active in-production order and advance progress by 3-6%
          const inProdOrders = state.orders.filter((o) => o.currentStage === 'In Production');
          if (inProdOrders.length > 0) {
            const randomOrder = inProdOrders[Math.floor(Math.random() * inProdOrders.length)];
            const newProgress = Math.min(98, randomOrder.stageProgress + Math.floor(Math.random() * 4) + 2);
            set((s) => ({
              orders: s.orders.map((o) => (o.id === randomOrder.id ? { ...o, stageProgress: newProgress } : o)),
            }));
          }
        } else if (choice === 'stock_shift') {
          // Deduct small quantity of resin or fasteners from active usage
          const matIndex = Math.floor(Math.random() * state.materials.length);
          const mat = state.materials[matIndex];
          if (mat && mat.quantityOnHand > 50) {
            const deduction = Math.min(mat.quantityOnHand - 10, Math.floor(Math.random() * 40) + 15);
            set((s) => ({
              materials: s.materials.map((m, i) =>
                i === matIndex ? { ...m, quantityOnHand: m.quantityOnHand - deduction } : m
              ),
            }));
          }
        } else {
          // New simulated status ping
          const notif: Notification = {
            id: `notif_tick_${Date.now()}`,
            title: 'Live Telemetry Sync',
            message: 'Line sensors refreshed: Northgate Press Alpha running at 98.2% OEE efficiency.',
            timestamp: new Date().toISOString(),
            read: false,
            roleTarget: 'all',
            type: 'capacity',
          };
          set((s) => ({
            notifications: [notif, ...s.notifications.slice(0, 20)],
          }));
        }
      },

      resetToDefaults: () => {
        set({
          orders: SEED_ORDERS,
          requests: SEED_CUSTOMER_REQUESTS,
          productionLines: SEED_PRODUCTION_LINES,
          partners: SEED_PARTNERS,
          materials: SEED_MATERIALS,
          materialRequests: SEED_MATERIAL_REQUESTS,
          alerts: SEED_ALERTS,
        });
      },
    }),
    {
      name: 'capora_supply_chain_store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentRole: state.currentRole,
        orders: state.orders,
        requests: state.requests,
        productionLines: state.productionLines,
        partners: state.partners,
        materials: state.materials,
        materialRequests: state.materialRequests,
        alerts: state.alerts,
        notifications: state.notifications,
      }),
    }
  )
);

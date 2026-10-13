export type Role = 'admin' | 'cm' | 'supplier' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyName: string;
  companyId: string;
  avatarUrl?: string;
  title: string;
}

export type PartnerType = 'cm' | 'supplier' | 'customer';
export type PartnerStatus = 'active' | 'pending' | 'suspended';

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  rating: number; // 1 to 5
  activeOrdersCount: number;
  totalVolume: number; // units delivered
  capabilities?: string[];
  certifications?: string[];
}

export interface ProductionLine {
  id: string;
  cmId: string;
  cmName: string;
  name: string;
  category: ProductCategory;
  unitsPerWeek: number;
  status: 'operational' | 'maintenance' | 'offline';
  blockedWeeks: number[]; // e.g. [43, 44] week numbers
  bookedUnits: { [weekNumber: number]: number }; // weekNumber -> booked count
  leadTimeDays: number;
  minBatchSize: number;
}

export type ProductCategory = 
  | 'Precision Injection Molding'
  | 'High-Density SMT & Electronics'
  | 'CNC Machining & Tooling'
  | 'Cleanroom Medical Assembly'
  | 'Optoelectronics & Sensors'
  | 'Sheet Metal & Thermal Systems';

export type ProductionStage = 
  | 'Scheduled'
  | 'Materials Ready'
  | 'In Production'
  | 'Quality Check'
  | 'Shipped'
  | 'Delivered';

export interface StageHistoryItem {
  stage: ProductionStage;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  cmId: string;
  cmName: string;
  lineId?: string;
  lineName?: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  submittedDate: string;
  targetDeliveryDate: string;
  estimatedDeliveryDate: string;
  currentStage: ProductionStage;
  stageProgress: number; // 0 to 100 within current stage
  overallProgress: number; // 0 to 100
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  materialStatus: 'confirmed' | 'pending_arrival' | 'delayed' | 'ready';
  materialRequestId?: string;
  specs: string;
  history: StageHistoryItem[];
  riskReason?: string;
  weekAllocations: { weekNumber: number; units: number }[];
}

export interface CustomerRequest {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  submittedDate: string;
  targetDeliveryDate: string;
  specs: string;
  status: 'pending_match' | 'matched' | 'accepted' | 'declined' | 'converted';
  assignedCmId?: string;
  assignedCmName?: string;
  declineReason?: string;
  priority: 'standard' | 'high' | 'critical';
  matchedDate?: string;
}

export interface Material {
  id: string;
  supplierId: string;
  supplierName: string;
  sku: string;
  name: string;
  category: string;
  quantityOnHand: number;
  unit: string;
  leadTimeDays: number;
  reorderLevel: number;
  costPerUnit: number;
  lastRestocked: string;
}

export interface MaterialRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  cmId: string;
  cmName: string;
  supplierId: string;
  supplierName: string;
  materialId: string;
  materialName: string;
  quantityNeeded: number;
  unit: string;
  status: 'pending' | 'confirmed' | 'partial' | 'delayed';
  requestedDeliveryDate: string;
  confirmedDeliveryDate?: string;
  supplierNotes?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'shortage' | 'overbooked' | 'delay' | 'partner_action';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  isRead: boolean;
  linkTab?: string;
  relatedEntityId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  roleTarget: Role | 'all';
  type: 'order' | 'request' | 'capacity' | 'material';
  linkTab?: string;
}

export interface KPIStats {
  totalCapacity: number;
  bookedCapacity: number;
  utilizationPercent: number;
  openRequests: number;
  atRiskOrders: number;
  activePartners: number;
  trends: {
    capacityGrowth: number;
    utilizationChange: number;
    openRequestsChange: number;
    atRiskChange: number;
  };
}

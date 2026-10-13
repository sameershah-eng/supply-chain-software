import { ProductCategory, ProductionStage, User } from '../types';

export const APP_NAME = 'Capora';
export const APP_TAGLINE = 'Supply Chain Capacity Management Platform';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Precision Injection Molding',
  'High-Density SMT & Electronics',
  'CNC Machining & Tooling',
  'Cleanroom Medical Assembly',
  'Optoelectronics & Sensors',
  'Sheet Metal & Thermal Systems',
];

export const PRODUCTION_STAGES: ProductionStage[] = [
  'Scheduled',
  'Materials Ready',
  'In Production',
  'Quality Check',
  'Shipped',
  'Delivered',
];

export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'usr_admin_01',
    name: 'Elena Vance',
    email: 'elena.vance@capora.network',
    role: 'admin',
    companyName: 'Capora Global Operations',
    companyId: 'org_capora_hq',
    title: 'Head of Global Capacity Operations',
  },
  cm: {
    id: 'usr_cm_01',
    name: 'Marcus Thorne',
    email: 'm.thorne@northgateprecision.com',
    role: 'cm',
    companyName: 'Northgate Precision Molding',
    companyId: 'cm_northgate',
    title: 'VP of Manufacturing & Plant Operations',
  },
  supplier: {
    id: 'usr_sup_01',
    name: 'Dr. Aris Vance',
    email: 'a.vance@pacificpolymer.com',
    role: 'supplier',
    companyName: 'Pacific Polymer Resins',
    companyId: 'sup_pacific_polymer',
    title: 'Director of Strategic Material Distribution',
  },
  customer: {
    id: 'usr_cust_01',
    name: 'Sarah Lin',
    email: 'slin@aeropulse.io',
    role: 'customer',
    companyName: 'AeroPulse Systems',
    companyId: 'cust_aeropulse',
    title: 'Director of Hardware Supply & NPI',
  },
};

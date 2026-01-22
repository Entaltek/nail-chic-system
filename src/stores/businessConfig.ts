import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Super Category Types - determines calculation logic
export type SuperCategoryType = 
  | 'CONSUMIBLES_BASICOS'    // Por Pieza - stock exacto (Int)
  | 'QUIMICOS_GELES'         // Por Vol/Peso - calculadora de gota
  | 'DECORACION_CONTABLE'    // Por Pieza - stock exacto
  | 'DECORACION_GRANEL'      // Estado Visual - Lleno/Medio/Bajo
  | 'EQUIPO_HERRAMIENTAS';   // Activos - depreciación mensual

// Visual stock status for DECORACION_GRANEL
export type VisualStockStatus = 'lleno' | 'medio' | 'bajo';

// Inventory category with wear logic
export interface InventoryCategory {
  id: string;
  name: string;
  superCategory: SuperCategoryType;
  description: string;
  color: string;
  icon: string;
}

// Team member type
export interface TeamMember {
  id: string;
  name: string;
  role: 'owner' | 'employee';
  commissionPercent: number;
  isActive: boolean;
}

// Expense category types for reporting
export type ExpenseCategoryType = 
  | 'INFRAESTRUCTURA'    // Renta, Luz, Agua
  | 'SUSCRIPCIONES'      // Software, Apps, Streaming
  | 'EQUIPO_STAFF'       // Sueldos, Ayudantes, Limpieza
  | 'OTROS';

// Fixed expenses by category
export interface FixedExpense {
  id: string;
  name: string;
  category: string; // Legacy display name
  expenseType: ExpenseCategoryType;
  amount: number;
  budget: number;
}

// Savings bucket configuration
export interface SavingsBucket {
  id: string;
  name: string;
  icon: string;
  targetPercent: number;
  currentAmount: number;
}

// Service recipe - materials used per service
export interface ServiceRecipe {
  materialId: string;
  materialName: string;
  usageAmount: number;
}

// Service definition with cost calculation
export interface ServiceDefinition {
  id: string;
  name: string;
  basePrice: number;
  suggestedPrice: number;
  estimatedMinutes: number;
  needsLength: boolean;
  recipe: ServiceRecipe[];
  materialCost: number;
}

// Extra type - TÉCNICA (no stock) or APLICACIÓN (linked to inventory)
export type ExtraType = 'TECNICA' | 'APLICACION';

// Extra/Add-on for nail art
export interface ExtraItem {
  id: string;
  name: string;
  type: ExtraType;
  category: string; // e.g., "Francés", "Efectos", "Decoración"
  basePrice: number;
  extraMinutes: number;
  description?: string;
  // For APLICACION type - link to inventory
  linkedInventoryId?: string;
  linkedInventoryName?: string;
}

// Tiered pricing for nail art levels
export interface NailArtTier {
  id: string;
  level: number;
  name: string;
  price: number;
  description?: string;
}

// Updated Inventory item with super category reference
export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  category: string; // Display name
  superCategory: SuperCategoryType;
  
  // Common fields
  purchaseCost: number;
  
  // CONSUMIBLES_BASICOS & DECORACION_CONTABLE fields
  stockPieces?: number;
  minStockPieces?: number;
  costPerPiece?: number;
  weeklyUsageRate?: number;
  daysUntilEmpty?: number;
  
  // QUIMICOS_GELES fields
  totalContent?: number; // ml or grams
  contentUnit?: 'ml' | 'g';
  estimatedUses?: number;
  currentStock?: number; // remaining ml/g
  minStock?: number;
  costPerUse?: number;
  
  // DECORACION_GRANEL fields
  visualStatus?: VisualStockStatus;
  
  // EQUIPO_HERRAMIENTAS fields
  purchaseDate?: string;
  usefulLifeMonths?: number;
  monthlyDepreciation?: number;
}

// Service log for analytics
export interface ServiceLog {
  id: string;
  date: Date;
  serviceId: string;
  serviceName: string;
  estimatedMinutes: number;
  realMinutes: number;
  chargedAmount: number;
  materialCost: number;
  calculatedCost: number;
  profit: number;
  teamMemberId: string;
  teamMemberName: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  addOns: string[];
}

// Design catalog item
export interface DesignItem {
  id: string;
  imageUrl: string;
  complexityLevel: 1 | 2 | 3 | 4;
  realMinutes: number;
  chargedPrice: number;
  tags: string[];
  createdAt: Date;
}

interface BusinessConfigState {
  // Master configuration
  businessName: string;
  monthlyWorkHours: number;
  desiredMonthlySalary: number;
  costPerMinute: number;
  
  // Fixed expenses
  fixedExpenses: FixedExpense[];
  totalFixedExpenses: number;
  
  // Savings buckets
  savingsBuckets: SavingsBucket[];
  
  // Team
  teamMembers: TeamMember[];
  commissionBase: 'gross' | 'net';
  
  // Inventory Categories
  inventoryCategories: InventoryCategory[];
  setInventoryCategories: (categories: InventoryCategory[]) => void;
  
  // Inventory
  inventory: InventoryItem[];
  
  // Extras (Nail Art pricing)
  extras: ExtraItem[];
  
  // Nail Art Tiers for quick POS pricing
  nailArtTiers: NailArtTier[];
  
  // Services
  services: ServiceDefinition[];
  
  // Service logs
  serviceLogs: ServiceLog[];
  
  // Design catalog
  designs: DesignItem[];
  
  // Aguinaldo and insurance
  includeAguinaldo: boolean;
  annualInsurance: number;
  
  // Actions
  setBusinessConfig: (config: Partial<BusinessConfigState>) => void;
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  removeFixedExpense: (id: string) => void;
  
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  
  // Category actions
  addInventoryCategory: (category: Omit<InventoryCategory, 'id'>) => void;
  updateInventoryCategory: (id: string, category: Partial<InventoryCategory>) => void;
  removeInventoryCategory: (id: string) => void;
  
  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  
  // Extra actions
  addExtra: (extra: Omit<ExtraItem, 'id'>) => void;
  updateExtra: (id: string, extra: Partial<ExtraItem>) => void;
  removeExtra: (id: string) => void;
  
  // Nail Art Tier actions
  updateNailArtTier: (id: string, tier: Partial<NailArtTier>) => void;
  
  addService: (service: Omit<ServiceDefinition, 'id' | 'suggestedPrice' | 'materialCost'>) => void;
  updateService: (id: string, service: Partial<ServiceDefinition>) => void;
  removeService: (id: string) => void;
  
  addServiceLog: (log: Omit<ServiceLog, 'id' | 'profit' | 'calculatedCost'>) => void;
  
  addDesign: (design: Omit<DesignItem, 'id' | 'createdAt'>) => void;
  removeDesign: (id: string) => void;
  
  updateSavingsBucket: (id: string, amount: number) => void;
  
  // Computed values
  getBreakEvenServices: () => number;
  getMonthlyStats: () => {
    totalRevenue: number;
    totalMaterialCost: number;
    totalTimeValue: number;
    netProfit: number;
    servicesCount: number;
  };
}

export async function fetchCategories() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
  return res.json();
}

// Default extras (Nail Art pricing) - now with types
const defaultExtras: ExtraItem[] = [
  { id: '1', name: 'Francés Clásico', type: 'TECNICA', category: 'Técnicas', basePrice: 50, extraMinutes: 10 },
  { id: '2', name: 'Francés Baby Boomer', type: 'TECNICA', category: 'Técnicas', basePrice: 80, extraMinutes: 15 },
  { id: '3', name: 'Encapsulado Simple', type: 'TECNICA', category: 'Técnicas', basePrice: 100, extraMinutes: 20 },
  { id: '4', name: 'Encapsulado Complejo', type: 'TECNICA', category: 'Técnicas', basePrice: 150, extraMinutes: 30 },
  { id: '5', name: 'Efecto Espejo', type: 'TECNICA', category: 'Efectos', basePrice: 80, extraMinutes: 10 },
  { id: '6', name: 'Efecto Aurora', type: 'TECNICA', category: 'Efectos', basePrice: 80, extraMinutes: 10 },
  { id: '7', name: 'Efecto Sirena', type: 'TECNICA', category: 'Efectos', basePrice: 60, extraMinutes: 8 },
  { id: '8', name: 'Nail Art Simple (por uña)', type: 'TECNICA', category: 'Arte', basePrice: 20, extraMinutes: 5 },
  { id: '9', name: 'Nail Art Complejo (por uña)', type: 'TECNICA', category: 'Arte', basePrice: 50, extraMinutes: 10 },
  { id: '10', name: 'Cristales Swarovski (por pieza)', type: 'APLICACION', category: 'Decoración', basePrice: 5, extraMinutes: 1 },
  { id: '11', name: 'Charm/Moño (por pieza)', type: 'APLICACION', category: 'Decoración', basePrice: 15, extraMinutes: 2 },
  { id: '12', name: 'Foil (por uña)', type: 'APLICACION', category: 'Decoración', basePrice: 10, extraMinutes: 3 },
];

// Default nail art tiers for quick POS pricing
const defaultNailArtTiers: NailArtTier[] = [
  { id: '1', level: 1, name: 'Básico', price: 10, description: 'Diseño simple, 1-2 elementos' },
  { id: '2', level: 2, name: 'Intermedio', price: 35, description: 'Diseño elaborado, varios elementos' },
  { id: '3', level: 3, name: 'Avanzado', price: 70, description: 'Diseño complejo, arte detallado' },
];

const defaultSavingsBuckets: SavingsBucket[] = [
  { id: 'depreciation', name: 'Depreciación (Equipo/Drill)', icon: '🔧', targetPercent: 5, currentAmount: 0 },
  { id: 'aguinaldo', name: 'Aguinaldo', icon: '🎁', targetPercent: 8.33, currentAmount: 0 },
  { id: 'training', name: 'Capacitación', icon: '📚', targetPercent: 5, currentAmount: 0 },
  { id: 'emergency', name: 'Emergencias', icon: '🚨', targetPercent: 10, currentAmount: 0 },
];

const seedFixedExpenses: FixedExpense[] = [
  { id: '1', name: 'Renta', category: 'Local', expenseType: 'INFRAESTRUCTURA', amount: 3000, budget: 3000 },
  { id: '2', name: 'Luz', category: 'Servicios', expenseType: 'INFRAESTRUCTURA', amount: 100, budget: 150 },
  { id: '3', name: 'Agua', category: 'Servicios', expenseType: 'INFRAESTRUCTURA', amount: 100, budget: 100 },
  { id: '4', name: 'Internet', category: 'Servicios', expenseType: 'INFRAESTRUCTURA', amount: 200, budget: 200 },
  { id: '5', name: 'HBO', category: 'Entretenimiento', expenseType: 'SUSCRIPCIONES', amount: 150, budget: 150 },
  { id: '6', name: 'CapCut', category: 'Software', expenseType: 'SUSCRIPCIONES', amount: 330, budget: 330 },
  { id: '7', name: 'Software Entaltek', category: 'Software', expenseType: 'SUSCRIPCIONES', amount: 450, budget: 450 },
  { id: '8', name: 'Limpieza', category: 'Local', expenseType: 'EQUIPO_STAFF', amount: 200, budget: 200 },
  { id: '9', name: 'Daniela (Ayuda)', category: 'Personal', expenseType: 'EQUIPO_STAFF', amount: 1200, budget: 1200 },
];

const defaultTeamMembers: TeamMember[] = [
  { id: 'owner', name: 'Laura (Dueña)', role: 'owner', commissionPercent: 100, isActive: true },
];

const defaultInventory: InventoryItem[] = [
  // CONSUMIBLES_BASICOS examples
  {
    id: '1',
    name: 'Guantes Nitrilo (Caja 100)',
    categoryId: 'desechables',
    category: 'Desechables',
    superCategory: 'CONSUMIBLES_BASICOS',
    purchaseCost: 200,
    stockPieces: 85,
    minStockPieces: 20,
    costPerPiece: 2,
    weeklyUsageRate: 25,
    daysUntilEmpty: 24,
  },
  {
    id: '2',
    name: 'Lima 100/180',
    categoryId: 'limas-pulidores',
    category: 'Limas y Pulidores',
    superCategory: 'CONSUMIBLES_BASICOS',
    purchaseCost: 150,
    stockPieces: 50,
    minStockPieces: 10,
    costPerPiece: 3,
    weeklyUsageRate: 15,
    daysUntilEmpty: 23,
  },
  // QUIMICOS_GELES examples
  {
    id: '3',
    name: 'Monómero Acrílico',
    categoryId: 'acrilicos',
    category: 'Acrílicos',
    superCategory: 'QUIMICOS_GELES',
    purchaseCost: 500,
    totalContent: 500,
    contentUnit: 'ml',
    currentStock: 425,
    minStock: 100,
    estimatedUses: 100,
    costPerUse: 5,
  },
  {
    id: '4',
    name: 'Rubber Base',
    categoryId: 'geles',
    category: 'Geles y Rubber',
    superCategory: 'QUIMICOS_GELES',
    purchaseCost: 350,
    totalContent: 30,
    contentUnit: 'ml',
    currentStock: 25,
    minStock: 10,
    estimatedUses: 30,
    costPerUse: 11.67,
  },
  // DECORACION_CONTABLE example
  {
    id: '5',
    name: 'Cristales Swarovski Mix',
    categoryId: 'charms-accesorios',
    category: 'Charms y Accesorios',
    superCategory: 'DECORACION_CONTABLE',
    purchaseCost: 400,
    stockPieces: 425,
    minStockPieces: 100,
    costPerPiece: 0.8,
    weeklyUsageRate: 30,
    daysUntilEmpty: 99,
  },
  // DECORACION_GRANEL example
  {
    id: '6',
    name: 'Glitter Holográfico',
    categoryId: 'efectos-polvo',
    category: 'Efectos y Polvos',
    superCategory: 'DECORACION_GRANEL',
    purchaseCost: 120,
    visualStatus: 'lleno',
  },
  {
    id: '7',
    name: 'Efecto Espejo Plata',
    categoryId: 'efectos-polvo',
    category: 'Efectos y Polvos',
    superCategory: 'DECORACION_GRANEL',
    purchaseCost: 180,
    visualStatus: 'medio',
  },
  // EQUIPO_HERRAMIENTAS example
  {
    id: '8',
    name: 'Drill Profesional',
    categoryId: 'equipo-electrico',
    category: 'Equipo Eléctrico',
    superCategory: 'EQUIPO_HERRAMIENTAS',
    purchaseCost: 2500,
    purchaseDate: '2024-06-01',
    usefulLifeMonths: 24,
    monthlyDepreciation: 104.17,
  },
];

const defaultServices: ServiceDefinition[] = [
  { id: 'acrylic', name: 'Acrílico', basePrice: 700, suggestedPrice: 0, estimatedMinutes: 120, needsLength: true, recipe: [], materialCost: 65 },
  { id: 'gel', name: 'Gel Semipermanente', basePrice: 350, suggestedPrice: 0, estimatedMinutes: 60, needsLength: false, recipe: [], materialCost: 35 },
  { id: 'rubber', name: 'Rubber Gel', basePrice: 500, suggestedPrice: 0, estimatedMinutes: 90, needsLength: false, recipe: [], materialCost: 45 },
  { id: 'softgel', name: 'Soft Gel', basePrice: 650, suggestedPrice: 0, estimatedMinutes: 120, needsLength: true, recipe: [], materialCost: 55 },
  { id: 'pedicure', name: 'Pedicure Spa', basePrice: 450, suggestedPrice: 0, estimatedMinutes: 90, needsLength: false, recipe: [], materialCost: 25 },
];

export const useBusinessConfig = create<BusinessConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      businessName: 'Entaltek Nail Studio',
      monthlyWorkHours: 160,
      desiredMonthlySalary: 15000,
      costPerMinute: 15000 / (160 * 60),
      
      fixedExpenses: seedFixedExpenses,
      totalFixedExpenses: seedFixedExpenses.reduce((sum, e) => sum + e.amount, 0),
      
      savingsBuckets: defaultSavingsBuckets,
      
      teamMembers: defaultTeamMembers,
      commissionBase: 'gross',
      
      inventoryCategories: [],
      setInventoryCategories: (categories) => set({ inventoryCategories: categories }),
      inventory: defaultInventory,
      extras: defaultExtras,
      nailArtTiers: defaultNailArtTiers,
      services: defaultServices,
      serviceLogs: [],
      designs: [],
      
      includeAguinaldo: true,
      annualInsurance: 24000,
      
      // Actions
      setBusinessConfig: (config) => set((state) => {
        const newState = { ...state, ...config };
        
        if (config.desiredMonthlySalary !== undefined || config.monthlyWorkHours !== undefined) {
          const salary = config.desiredMonthlySalary ?? state.desiredMonthlySalary;
          const hours = config.monthlyWorkHours ?? state.monthlyWorkHours;
          newState.costPerMinute = salary / (hours * 60);
        }
        
        if (config.fixedExpenses !== undefined) {
          newState.totalFixedExpenses = config.fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
        }
        
        return newState;
      }),
      
      addFixedExpense: (expense) => set((state) => {
        const newExpense = { ...expense, id: Date.now().toString() };
        const newExpenses = [...state.fixedExpenses, newExpense];
        return {
          fixedExpenses: newExpenses,
          totalFixedExpenses: newExpenses.reduce((sum, e) => sum + e.amount, 0),
        };
      }),
      
      updateFixedExpense: (id, expense) => set((state) => {
        const newExpenses = state.fixedExpenses.map((e) => 
          e.id === id ? { ...e, ...expense } : e
        );
        return {
          fixedExpenses: newExpenses,
          totalFixedExpenses: newExpenses.reduce((sum, e) => sum + e.amount, 0),
        };
      }),
      
      removeFixedExpense: (id) => set((state) => {
        const newExpenses = state.fixedExpenses.filter((e) => e.id !== id);
        return {
          fixedExpenses: newExpenses,
          totalFixedExpenses: newExpenses.reduce((sum, e) => sum + e.amount, 0),
        };
      }),
      
      addTeamMember: (member) => set((state) => ({
        teamMembers: [...state.teamMembers, { ...member, id: Date.now().toString() }],
      })),
      
      updateTeamMember: (id, member) => set((state) => ({
        teamMembers: state.teamMembers.map((m) => 
          m.id === id ? { ...m, ...member } : m
        ),
      })),
      
      removeTeamMember: (id) => set((state) => ({
        teamMembers: state.teamMembers.filter((m) => m.id !== id),
      })),
      
      // Category actions
      addInventoryCategory: (category) => set((state) => ({
        inventoryCategories: [...state.inventoryCategories, { ...category, id: Date.now().toString() }],
      })),
      
      updateInventoryCategory: (id, category) => set((state) => ({
        inventoryCategories: state.inventoryCategories.map((c) =>
          c.id === id ? { ...c, ...category } : c
        ),
      })),
      
      removeInventoryCategory: (id) => set((state) => ({
        inventoryCategories: state.inventoryCategories.filter((c) => c.id !== id),
      })),
      
      // Inventory actions
      addInventoryItem: (item) => set((state) => ({
        inventory: [...state.inventory, { ...item, id: Date.now().toString() }],
      })),
      
      updateInventoryItem: (id, item) => set((state) => ({
        inventory: state.inventory.map((i) => i.id === id ? { ...i, ...item } : i),
      })),
      
      removeInventoryItem: (id) => set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== id),
      })),
      
      // Extra actions
      addExtra: (extra) => set((state) => ({
        extras: [...state.extras, { ...extra, id: Date.now().toString() }],
      })),
      
      updateExtra: (id, extra) => set((state) => ({
        extras: state.extras.map((e) => e.id === id ? { ...e, ...extra } : e),
      })),
      
      removeExtra: (id) => set((state) => ({
        extras: state.extras.filter((e) => e.id !== id),
      })),
      
      // Nail Art Tier actions
      updateNailArtTier: (id, tier) => set((state) => ({
        nailArtTiers: state.nailArtTiers.map((t) => t.id === id ? { ...t, ...tier } : t),
      })),
      
      addService: (service) => set((state) => {
        const timeCost = service.estimatedMinutes * state.costPerMinute;
        const materialCost = service.recipe.reduce((sum, r) => {
          const material = state.inventory.find((i) => i.id === r.materialId);
          return sum + (material?.costPerUse ? material.costPerUse * r.usageAmount : 0);
        }, 0);
        const suggestedPrice = Math.ceil((timeCost + materialCost) / 10) * 10;
        
        return {
          services: [...state.services, {
            ...service,
            id: Date.now().toString(),
            suggestedPrice: Math.max(suggestedPrice, service.basePrice),
            materialCost,
          }],
        };
      }),
      
      updateService: (id, service) => set((state) => ({
        services: state.services.map((s) => 
          s.id === id ? { ...s, ...service } : s
        ),
      })),
      
      removeService: (id) => set((state) => ({
        services: state.services.filter((s) => s.id !== id),
      })),
      
      addServiceLog: (log) => set((state) => {
        const timeCost = log.realMinutes * state.costPerMinute;
        const calculatedCost = timeCost + log.materialCost;
        const profit = log.chargedAmount - calculatedCost;
        
        return {
          serviceLogs: [...state.serviceLogs, {
            ...log,
            id: Date.now().toString(),
            calculatedCost,
            profit,
          }],
        };
      }),
      
      addDesign: (design) => set((state) => ({
        designs: [...state.designs, {
          ...design,
          id: Date.now().toString(),
          createdAt: new Date(),
        }],
      })),
      
      removeDesign: (id) => set((state) => ({
        designs: state.designs.filter((d) => d.id !== id),
      })),
      
      updateSavingsBucket: (id, amount) => set((state) => ({
        savingsBuckets: state.savingsBuckets.map((b) =>
          b.id === id ? { ...b, currentAmount: b.currentAmount + amount } : b
        ),
      })),
      
      // Computed values
      getBreakEvenServices: () => {
        const state = get();
        const aguinaldoMonthly = state.includeAguinaldo ? state.desiredMonthlySalary / 12 : 0;
        const insuranceMonthly = state.annualInsurance / 12;
        const totalMonthlyRequired = state.totalFixedExpenses + state.desiredMonthlySalary + aguinaldoMonthly + insuranceMonthly;
        
        const avgTicket = state.services.length > 0
          ? state.services.reduce((sum, s) => sum + s.basePrice, 0) / state.services.length
          : 500;
        
        return Math.ceil(totalMonthlyRequired / avgTicket);
      },
      
      getMonthlyStats: () => {
        const state = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthLogs = state.serviceLogs.filter((log) => 
          new Date(log.date) >= startOfMonth
        );
        
        return {
          totalRevenue: monthLogs.reduce((sum, log) => sum + log.chargedAmount, 0),
          totalMaterialCost: monthLogs.reduce((sum, log) => sum + log.materialCost, 0),
          totalTimeValue: monthLogs.reduce((sum, log) => sum + (log.realMinutes * state.costPerMinute), 0),
          netProfit: monthLogs.reduce((sum, log) => sum + log.profit, 0),
          servicesCount: monthLogs.length,
        };
      },
    }),
    {
      name: 'business-config-storage',
      version: 3,
    }
  )
);

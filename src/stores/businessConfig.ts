import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Wear types for inventory categories
export type WearType = 'POR_UNIDAD' | 'POR_VOLUMEN' | 'POR_TIEMPO' | 'ADICIONAL';

// Inventory category with wear logic
export interface InventoryCategory {
  id: string;
  name: string;
  wearType: WearType;
  description: string;
  color: string; // Tailwind color class
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

// Fixed expenses by category
export interface FixedExpense {
  id: string;
  name: string;
  category: string;
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

// Updated Inventory item with category reference
export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string; // Reference to InventoryCategory
  category: string; // Legacy - display name
  
  // Common fields
  totalStock: number;
  effectiveStock: number;
  unit: string;
  minStock: number;
  purchaseCost: number;
  
  // POR_UNIDAD fields
  piecesPerBox?: number;
  costPerPiece?: number;
  
  // POR_VOLUMEN fields
  totalContent?: number; // ml or grams
  contentUnit?: 'ml' | 'g';
  estimatedUses?: number;
  costPerUse: number;
  
  // POR_TIEMPO fields (Assets)
  purchaseDate?: string;
  usefulLifeMonths?: number;
  monthlyDepreciation?: number;
  
  // ADICIONAL fields
  pricePerUnit?: number; // What to charge customer
  
  // Alert calculations
  totalApplications: number;
  weeklyUsageRate: number;
  daysUntilEmpty: number;
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
  
  // Inventory Categories (NEW)
  inventoryCategories: InventoryCategory[];
  
  // Inventory
  inventory: InventoryItem[];
  
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
  
  // Category actions (NEW)
  addInventoryCategory: (category: Omit<InventoryCategory, 'id'>) => void;
  updateInventoryCategory: (id: string, category: Partial<InventoryCategory>) => void;
  removeInventoryCategory: (id: string) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'effectiveStock' | 'costPerUse' | 'daysUntilEmpty'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  
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

// Default inventory categories based on nail studio operations
const defaultInventoryCategories: InventoryCategory[] = [
  {
    id: 'universales',
    name: 'Insumos Universales',
    wearType: 'POR_UNIDAD',
    description: 'Material desechable que se usa en TODOS los servicios',
    color: 'bg-blue-500',
    icon: '🧤',
  },
  {
    id: 'quimicos-acrilico',
    name: 'Químicos Acrílico',
    wearType: 'POR_VOLUMEN',
    description: 'Insumos exclusivos para aplicación de uñas acrílicas',
    color: 'bg-pink-500',
    icon: '💅',
  },
  {
    id: 'geles-esmaltes',
    name: 'Geles y Esmaltes',
    wearType: 'POR_VOLUMEN',
    description: 'Insumos para Gel Semi, Rubber, Soft Gel',
    color: 'bg-purple-500',
    icon: '✨',
  },
  {
    id: 'spa-pedicura',
    name: 'Spa y Pedicura',
    wearType: 'POR_VOLUMEN',
    description: 'Productos de consumo masivo para pies',
    color: 'bg-teal-500',
    icon: '🦶',
  },
  {
    id: 'herramientas-equipo',
    name: 'Herramientas y Equipo',
    wearType: 'POR_TIEMPO',
    description: 'Activos que se desgastan por meses, no por cliente',
    color: 'bg-amber-500',
    icon: '🔧',
  },
  {
    id: 'decoracion-arte',
    name: 'Decoración y Arte',
    wearType: 'ADICIONAL',
    description: 'Elementos creativos con precio variable o unitario alto',
    color: 'bg-rose-500',
    icon: '💎',
  },
];

const defaultSavingsBuckets: SavingsBucket[] = [
  { id: 'depreciation', name: 'Depreciación (Equipo/Drill)', icon: '🔧', targetPercent: 5, currentAmount: 0 },
  { id: 'aguinaldo', name: 'Aguinaldo', icon: '🎁', targetPercent: 8.33, currentAmount: 0 },
  { id: 'training', name: 'Capacitación', icon: '📚', targetPercent: 5, currentAmount: 0 },
  { id: 'emergency', name: 'Emergencias', icon: '🚨', targetPercent: 10, currentAmount: 0 },
];

const seedFixedExpenses: FixedExpense[] = [
  { id: '1', name: 'Renta', category: 'Local', amount: 3000, budget: 3000 },
  { id: '2', name: 'Luz', category: 'Servicios', amount: 100, budget: 150 },
  { id: '3', name: 'Agua', category: 'Servicios', amount: 100, budget: 100 },
  { id: '4', name: 'Internet', category: 'Servicios', amount: 200, budget: 200 },
  { id: '5', name: 'HBO', category: 'Entretenimiento', amount: 150, budget: 150 },
  { id: '6', name: 'CapCut', category: 'Software', amount: 330, budget: 330 },
  { id: '7', name: 'Software Entaltek', category: 'Software', amount: 450, budget: 450 },
  { id: '8', name: 'Limpieza', category: 'Local', amount: 200, budget: 200 },
  { id: '9', name: 'Daniela (Ayuda)', category: 'Personal', amount: 1200, budget: 1200 },
];

const defaultTeamMembers: TeamMember[] = [
  { id: 'owner', name: 'Laura (Dueña)', role: 'owner', commissionPercent: 100, isActive: true },
];

const defaultInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Monómero Acrílico',
    categoryId: 'quimicos-acrilico',
    category: 'Químicos Acrílico',
    totalStock: 500,
    effectiveStock: 425,
    unit: 'ml',
    minStock: 100,
    purchaseCost: 500,
    totalContent: 500,
    contentUnit: 'ml',
    estimatedUses: 100,
    totalApplications: 100,
    costPerUse: 5,
    weeklyUsageRate: 20,
    daysUntilEmpty: 21,
  },
  {
    id: '2',
    name: 'Rubber Base',
    categoryId: 'geles-esmaltes',
    category: 'Geles y Esmaltes',
    totalStock: 30,
    effectiveStock: 25.5,
    unit: 'ml',
    minStock: 10,
    purchaseCost: 350,
    totalContent: 30,
    contentUnit: 'ml',
    estimatedUses: 30,
    totalApplications: 30,
    costPerUse: 11.67,
    weeklyUsageRate: 15,
    daysUntilEmpty: 12,
  },
  {
    id: '3',
    name: 'Polvo Acrílico Rosa',
    categoryId: 'quimicos-acrilico',
    category: 'Químicos Acrílico',
    totalStock: 200,
    effectiveStock: 170,
    unit: 'g',
    minStock: 50,
    purchaseCost: 280,
    totalContent: 200,
    contentUnit: 'g',
    estimatedUses: 80,
    totalApplications: 80,
    costPerUse: 3.5,
    weeklyUsageRate: 18,
    daysUntilEmpty: 28,
  },
  {
    id: '4',
    name: 'Top Coat Sin Capa',
    categoryId: 'geles-esmaltes',
    category: 'Geles y Esmaltes',
    totalStock: 30,
    effectiveStock: 25.5,
    unit: 'ml',
    minStock: 10,
    purchaseCost: 250,
    totalContent: 30,
    contentUnit: 'ml',
    estimatedUses: 50,
    totalApplications: 50,
    costPerUse: 5,
    weeklyUsageRate: 25,
    daysUntilEmpty: 7,
  },
  {
    id: '5',
    name: 'Pedrería Swarovski',
    categoryId: 'decoracion-arte',
    category: 'Decoración y Arte',
    totalStock: 500,
    effectiveStock: 425,
    unit: 'piezas',
    minStock: 100,
    purchaseCost: 400,
    pricePerUnit: 5,
    totalApplications: 500,
    costPerUse: 0.8,
    weeklyUsageRate: 30,
    daysUntilEmpty: 99,
  },
  {
    id: '6',
    name: 'Guantes Nitrilo',
    categoryId: 'universales',
    category: 'Insumos Universales',
    totalStock: 100,
    effectiveStock: 85,
    unit: 'pares',
    minStock: 20,
    purchaseCost: 200,
    piecesPerBox: 100,
    costPerPiece: 2,
    totalApplications: 100,
    costPerUse: 2,
    weeklyUsageRate: 25,
    daysUntilEmpty: 24,
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
      
      inventoryCategories: defaultInventoryCategories,
      inventory: defaultInventory,
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
      
      addInventoryItem: (item) => set((state) => {
        const category = state.inventoryCategories.find(c => c.id === item.categoryId);
        let costPerUse = 0;
        let effectiveStock = item.totalStock * 0.85;
        
        if (category) {
          switch (category.wearType) {
            case 'POR_UNIDAD':
              costPerUse = item.costPerPiece || (item.purchaseCost / (item.piecesPerBox || item.totalApplications));
              break;
            case 'POR_VOLUMEN':
              costPerUse = item.purchaseCost / (item.estimatedUses || item.totalApplications);
              break;
            case 'POR_TIEMPO':
              // Monthly depreciation, not per-use cost
              costPerUse = item.purchaseCost / (item.usefulLifeMonths || 12);
              break;
            case 'ADICIONAL':
              costPerUse = item.purchaseCost / item.totalApplications;
              break;
          }
        } else {
          costPerUse = item.purchaseCost / item.totalApplications;
        }
        
        const daysUntilEmpty = item.weeklyUsageRate > 0 
          ? Math.floor((effectiveStock / item.weeklyUsageRate) * 7)
          : 999;
        
        return {
          inventory: [...state.inventory, {
            ...item,
            id: Date.now().toString(),
            effectiveStock,
            costPerUse,
            daysUntilEmpty,
          }],
        };
      }),
      
      updateInventoryItem: (id, item) => set((state) => ({
        inventory: state.inventory.map((i) => {
          if (i.id !== id) return i;
          const updated = { ...i, ...item };
          
          if (item.totalStock !== undefined) {
            updated.effectiveStock = updated.totalStock * 0.85;
          }
          if (item.purchaseCost !== undefined || item.totalApplications !== undefined) {
            updated.costPerUse = updated.purchaseCost / updated.totalApplications;
          }
          if (item.weeklyUsageRate !== undefined || item.totalStock !== undefined) {
            updated.daysUntilEmpty = updated.weeklyUsageRate > 0 
              ? Math.floor((updated.effectiveStock / updated.weeklyUsageRate) * 7)
              : 999;
          }
          
          return updated;
        }),
      })),
      
      removeInventoryItem: (id) => set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== id),
      })),
      
      addService: (service) => set((state) => {
        const timeCost = service.estimatedMinutes * state.costPerMinute;
        const suggestedPrice = Math.ceil((timeCost + service.recipe.reduce((sum, r) => {
          const material = state.inventory.find((i) => i.id === r.materialId);
          return sum + (material ? material.costPerUse * r.usageAmount : 0);
        }, 0)) / 10) * 10;
        
        const materialCost = service.recipe.reduce((sum, r) => {
          const material = state.inventory.find((i) => i.id === r.materialId);
          return sum + (material ? material.costPerUse * r.usageAmount : 0);
        }, 0);
        
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
      version: 2,
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Team member type
export interface TeamMember {
  id: string;
  name: string;
  role: 'owner' | 'employee';
  commissionPercent: number; // Employee gets this %, studio keeps the rest
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
  usageAmount: number; // How much of the material is used per service
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
  materialCost: number; // Calculated from recipe
}

// Inventory item with cost per use
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  totalStock: number;
  effectiveStock: number; // 85% of total
  unit: string;
  minStock: number;
  purchaseCost: number;
  totalApplications: number; // How many uses per purchase
  costPerUse: number; // Calculated: purchaseCost / totalApplications
  weeklyUsageRate: number; // Average uses per week
  daysUntilEmpty: number; // Calculated from usage rate
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
  calculatedCost: number; // Time cost + Material cost
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
  costPerMinute: number; // Calculated
  
  // Fixed expenses
  fixedExpenses: FixedExpense[];
  totalFixedExpenses: number; // Calculated
  
  // Savings buckets
  savingsBuckets: SavingsBucket[];
  
  // Team
  teamMembers: TeamMember[];
  commissionBase: 'gross' | 'net'; // Calculate commission on total or after materials
  
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

const defaultSavingsBuckets: SavingsBucket[] = [
  { id: 'depreciation', name: 'Depreciación (Equipo/Drill)', icon: '🔧', targetPercent: 5, currentAmount: 0 },
  { id: 'aguinaldo', name: 'Aguinaldo', icon: '🎁', targetPercent: 8.33, currentAmount: 0 },
  { id: 'training', name: 'Capacitación', icon: '📚', targetPercent: 5, currentAmount: 0 },
  { id: 'emergency', name: 'Emergencias', icon: '🚨', targetPercent: 10, currentAmount: 0 },
];

const defaultFixedExpenses: FixedExpense[] = [
  { id: '1', name: 'Renta', category: 'Local', amount: 8000, budget: 8000 },
  { id: '2', name: 'Luz', category: 'Servicios', amount: 1200, budget: 1500 },
  { id: '3', name: 'Software', category: 'Software', amount: 450, budget: 450 },
  { id: '4', name: 'Publicidad', category: 'Marketing', amount: 2500, budget: 3000 },
];

const defaultTeamMembers: TeamMember[] = [
  { id: 'owner', name: 'Laura (Dueña)', role: 'owner', commissionPercent: 100, isActive: true },
];

const defaultInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Monómero Acrílico',
    category: 'Acrílico',
    totalStock: 500,
    effectiveStock: 425,
    unit: 'ml',
    minStock: 100,
    purchaseCost: 500,
    totalApplications: 100,
    costPerUse: 5,
    weeklyUsageRate: 20,
    daysUntilEmpty: 21,
  },
  {
    id: '2',
    name: 'Rubber Base',
    category: 'Gel',
    totalStock: 30,
    effectiveStock: 25.5,
    unit: 'ml',
    minStock: 10,
    purchaseCost: 350,
    totalApplications: 30,
    costPerUse: 11.67,
    weeklyUsageRate: 15,
    daysUntilEmpty: 12,
  },
  {
    id: '3',
    name: 'Polvo Acrílico Rosa',
    category: 'Acrílico',
    totalStock: 200,
    effectiveStock: 170,
    unit: 'g',
    minStock: 50,
    purchaseCost: 280,
    totalApplications: 80,
    costPerUse: 3.5,
    weeklyUsageRate: 18,
    daysUntilEmpty: 28,
  },
  {
    id: '4',
    name: 'Top Coat Sin Capa',
    category: 'Gel',
    totalStock: 30,
    effectiveStock: 25.5,
    unit: 'ml',
    minStock: 10,
    purchaseCost: 250,
    totalApplications: 50,
    costPerUse: 5,
    weeklyUsageRate: 25,
    daysUntilEmpty: 7,
  },
  {
    id: '5',
    name: 'Pedrería Swarovski',
    category: 'Decoración',
    totalStock: 500,
    effectiveStock: 425,
    unit: 'piezas',
    minStock: 100,
    purchaseCost: 400,
    totalApplications: 500,
    costPerUse: 0.8,
    weeklyUsageRate: 30,
    daysUntilEmpty: 99,
  },
];

const defaultServices: ServiceDefinition[] = [
  { id: 'pedicure', name: 'Pedicure Spa', basePrice: 450, suggestedPrice: 480, estimatedMinutes: 60, needsLength: false, recipe: [], materialCost: 25 },
  { id: 'gel', name: 'Gel Semipermanente', basePrice: 350, suggestedPrice: 380, estimatedMinutes: 45, needsLength: false, recipe: [], materialCost: 35 },
  { id: 'rubber', name: 'Rubber Gel', basePrice: 500, suggestedPrice: 550, estimatedMinutes: 60, needsLength: false, recipe: [], materialCost: 45 },
  { id: 'softgel', name: 'Soft Gel', basePrice: 650, suggestedPrice: 720, estimatedMinutes: 90, needsLength: true, recipe: [], materialCost: 55 },
  { id: 'acrylic', name: 'Acrílico', basePrice: 700, suggestedPrice: 780, estimatedMinutes: 120, needsLength: true, recipe: [], materialCost: 65 },
];

export const useBusinessConfig = create<BusinessConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      businessName: 'Entaltek Nail Studio',
      monthlyWorkHours: 160,
      desiredMonthlySalary: 15000,
      costPerMinute: 15000 / (160 * 60), // ~1.56 per minute
      
      fixedExpenses: defaultFixedExpenses,
      totalFixedExpenses: defaultFixedExpenses.reduce((sum, e) => sum + e.amount, 0),
      
      savingsBuckets: defaultSavingsBuckets,
      
      teamMembers: defaultTeamMembers,
      commissionBase: 'gross',
      
      inventory: defaultInventory,
      services: defaultServices,
      serviceLogs: [],
      designs: [],
      
      includeAguinaldo: true,
      annualInsurance: 24000,
      
      // Actions
      setBusinessConfig: (config) => set((state) => {
        const newState = { ...state, ...config };
        
        // Recalculate cost per minute if relevant fields changed
        if (config.desiredMonthlySalary !== undefined || config.monthlyWorkHours !== undefined) {
          const salary = config.desiredMonthlySalary ?? state.desiredMonthlySalary;
          const hours = config.monthlyWorkHours ?? state.monthlyWorkHours;
          newState.costPerMinute = salary / (hours * 60);
        }
        
        // Recalculate total fixed expenses
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
      
      addInventoryItem: (item) => set((state) => {
        const effectiveStock = item.totalStock * 0.85;
        const costPerUse = item.purchaseCost / item.totalApplications;
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
          
          // Recalculate derived fields if relevant values changed
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
        // Calculate suggested price based on time + materials
        const timeCost = service.estimatedMinutes * state.costPerMinute;
        const suggestedPrice = Math.ceil((timeCost + service.recipe.reduce((sum, r) => {
          const material = state.inventory.find((i) => i.id === r.materialId);
          return sum + (material ? material.costPerUse * r.usageAmount : 0);
        }, 0)) / 10) * 10; // Round to nearest 10
        
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
        const service = state.services.find((s) => s.id === log.serviceId);
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
        
        // Calculate average ticket from services
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
      name: 'entaltek-business-config',
    }
  )
);

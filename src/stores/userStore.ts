import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// All app modules
export const APP_MODULES = [
  { id: 'dashboard', label: 'Dashboard', url: '/' },
  { id: 'servicio', label: 'Servicio en Curso (POS)', url: '/servicio' },
  { id: 'menu-servicios', label: 'Menú de Servicios', url: '/menu-servicios' },
  { id: 'inventario', label: 'Inventario', url: '/inventario' },
  { id: 'categorias', label: 'Categorías', url: '/gestion-categorias' },
  { id: 'extras', label: 'Extras y Arte', url: '/extras' },
  { id: 'catalogo', label: 'Catálogo de Diseños', url: '/catalogo' },
  { id: 'reportes', label: 'Reportes (Finanzas)', url: '/reportes' },
  { id: 'clientes', label: 'Clientes', url: '/clientes' },
  { id: 'costos-gastos', label: 'Costos y Gastos', url: '/costos-gastos' },
  { id: 'configuracion', label: 'Configuración', url: '/configuracion' },
] as const;

export type AppModuleId = (typeof APP_MODULES)[number]['id'];

export const ALL_MODULE_IDS: AppModuleId[] = APP_MODULES.map((m) => m.id);

export interface AppUser {
  id: string;
  name: string;
  role: 'admin' | 'staff';
  permissions: AppModuleId[];
}

const DEFAULT_STAFF_PERMISSIONS: AppModuleId[] = [
  'servicio',
  'catalogo',
  'clientes',
];

interface UserStoreState {
  users: AppUser[];
  currentUserId: string;
  simulatingAs: string | null;
  allowedModules: Record<AppModuleId, boolean>;
  isSuperAdmin: boolean;

  updateUserPermissions: (userId: string, permissions: AppModuleId[]) => void;
  setCurrentUser: (userId: string, email?: string) => void;
  setAllowedModules: (modules: Record<string, boolean>) => void;
  simulateAs: (userId: string | null) => void;
  resetPermissions: () => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      users: [],
      currentUserId: '',
      simulatingAs: null,
      allowedModules: {} as Record<AppModuleId, boolean>,
      isSuperAdmin: false,

      updateUserPermissions: (userId, permissions) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, permissions } : u
          ),
        })),

      setCurrentUser: (userId, email) => set({ 
        currentUserId: userId,
        isSuperAdmin: email === 'sebastian.cano@entaltek.com'
      }),

      setAllowedModules: (modules) => set({ 
        allowedModules: modules as Record<AppModuleId, boolean> 
      }),

      simulateAs: (userId) => set({ simulatingAs: userId }),

      resetPermissions: () => set({ 
        allowedModules: {} as Record<AppModuleId, boolean>,
        isSuperAdmin: false,
        currentUserId: '',
        simulatingAs: null
      }),
    }),
    { name: 'entaltek-users' }
  )
);

export function selectActivePermissions(state: UserStoreState): AppModuleId[] {
  if (state.isSuperAdmin && !state.simulatingAs) return ALL_MODULE_IDS as unknown as AppModuleId[];
  
  const activePermissions: AppModuleId[] = [];
  Object.entries(state.allowedModules).forEach(([modId, allowed]) => {
    if (allowed) activePermissions.push(modId as AppModuleId);
  });
  
  return activePermissions;
}

export function isModuleAllowed(state: UserStoreState, moduleId: AppModuleId): boolean {
  if (state.isSuperAdmin && !state.simulatingAs) return true;
  return !!state.allowedModules[moduleId];
}

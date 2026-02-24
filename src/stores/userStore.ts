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
  simulatingAs: string | null; // userId being simulated

  // Actions
  updateUserPermissions: (userId: string, permissions: AppModuleId[]) => void;
  setCurrentUser: (userId: string) => void;
  simulateAs: (userId: string | null) => void;
  getActiveUser: () => AppUser;
  getActivePermissions: () => AppModuleId[];
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [
        { id: 'admin', name: 'Admin (Tú)', role: 'admin', permissions: [...ALL_MODULE_IDS] },
        { id: 'laura', name: 'Laura', role: 'staff', permissions: [...DEFAULT_STAFF_PERMISSIONS] },
      ],
      currentUserId: 'admin',
      simulatingAs: null,

      updateUserPermissions: (userId, permissions) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, permissions } : u
          ),
        })),

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      simulateAs: (userId) => set({ simulatingAs: userId }),

      getActiveUser: () => {
        const state = get();
        const activeId = state.simulatingAs ?? state.currentUserId;
        return state.users.find((u) => u.id === activeId) ?? state.users[0];
      },

      getActivePermissions: () => {
        const user = get().getActiveUser();
        if (user.role === 'admin') return [...ALL_MODULE_IDS];
        return user.permissions;
      },
    }),
    { name: 'entaltek-users' }
  )
);

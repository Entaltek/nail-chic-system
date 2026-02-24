import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Timer,
  Package,
  Settings2,
  Menu,
  X,
  Palette,
  BarChart3,
  MenuSquare,
  DollarSign,
  FolderOpen,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import logoEntaltek from "@/assets/logo_entaltek.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Servicio en Curso", url: "/servicio", icon: Timer },
  { title: "Menú Servicios", url: "/menu-servicios", icon: MenuSquare },
  { title: "Inventario", url: "/inventario", icon: Package },
  { title: "Categorías", url: "/gestion-categorias", icon: FolderOpen },
  { title: "Extras y Arte", url: "/extras", icon: Palette },
  { title: "Catálogo Diseños", url: "/catalogo", icon: Palette },
  { title: "Reportes", url: "/reportes", icon: BarChart3 },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Costos y Gastos", url: "/costos-gastos", icon: DollarSign },
  { title: "Configuración", url: "/configuracion", icon: Settings2 },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-secondary text-secondary-foreground hover:bg-sidebar-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 gradient-sidebar transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            {theme === 'corporate' ? (
              <img src={logoEntaltek} alt="Entaltek" className="h-10 w-10 object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-button">
                <span className="text-lg">💅</span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
                Entaltek
              </h1>
              <p className="text-xs text-sidebar-foreground/70">
                {theme === 'corporate' ? 'Business Suite' : 'Nail Studio'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-button"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
            <p className="text-xs text-sidebar-foreground/50 text-center">
              © 2025 Entaltek
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

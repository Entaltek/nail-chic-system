import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardAvanzado from "./pages/DashboardAvanzado";
import ServicioEnCurso from "./pages/ServicioEnCurso";
import MenuServicios from "./pages/MenuServicios";
import Inventario2 from "./pages/Inventario2";
import InventarioCategoriaDetalle from "./pages/InventarioCategoriaDetalle";
import GestionCategorias from "./pages/GestionCategorias";
import ExtrasPrecios from "./pages/ExtrasPrecios";
import CatalogoDisenos from "./pages/CatalogoDisenos";
import Reportes from "./pages/Reportes";
import ConfiguracionMaestra from "./pages/ConfiguracionMaestra";
import CostosGastos from "./pages/CostosGastos";
import Clientes from "./pages/Clientes";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "@/auth/AuthProvider";
import ProtectedLayout from "@/auth/ProtectedLayout";

const queryClient = new QueryClient();

const EnvironmentBanner = () => {
  if (import.meta.env.VITE_ENV !== "development") return null;
  return (
    <div className="w-full bg-yellow-500 text-yellow-950 font-bold text-xs py-1 text-center fixed top-0 z-50">
      Entorno: DEV
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EnvironmentBanner />
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Privadas */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<DashboardAvanzado />} />
            <Route path="/servicio" element={<ServicioEnCurso />} />
            <Route path="/menu-servicios" element={<MenuServicios />} />
            <Route path="/inventario" element={<Inventario2 />} />
            <Route path="/inventario/categoria/:categoryId" element={<InventarioCategoriaDetalle />} />
            <Route path="/gestion-categorias" element={<GestionCategorias />} />
            <Route path="/extras" element={<ExtrasPrecios />} />
            <Route path="/catalogo" element={<CatalogoDisenos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<ConfiguracionMaestra />} />
            <Route path="/costos-gastos" element={<CostosGastos />} />
            <Route path="/clientes" element={<Clientes />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
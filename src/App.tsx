import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardAvanzado from "./pages/DashboardAvanzado";
import ServicioEnCurso from "./pages/ServicioEnCurso";
import MenuServicios from "./pages/MenuServicios";
import Inventario2 from "./pages/Inventario2";
import CatalogoDisenos from "./pages/CatalogoDisenos";
import Reportes from "./pages/Reportes";
import ConfiguracionMaestra from "./pages/ConfiguracionMaestra";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardAvanzado />} />
          <Route path="/servicio" element={<ServicioEnCurso />} />
          <Route path="/menu-servicios" element={<MenuServicios />} />
          <Route path="/inventario" element={<Inventario2 />} />
          <Route path="/catalogo" element={<CatalogoDisenos />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<ConfiguracionMaestra />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import {
  DollarSign,
  Receipt,
  Scissors,
  TrendingUp,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { BreakEvenWidget } from "@/components/dashboard/BreakEvenWidget";
import { WaterfallChart } from "@/components/dashboard/WaterfallChart";

// Simulated data
const mockData = {
  monthlyRevenue: 45600,
  averageTicket: 850,
  totalServices: 54,
  monthGrowth: 12.5,
  totalExpenses: 28500,
  materialsCost: 8200,
  fixedExpenses: 12000,
  salaryProvisions: 15000,
};

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            ¡Bienvenida! ✨
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí tienes el resumen de tu negocio este mes
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Ingresos del Mes"
            value={`$${mockData.monthlyRevenue.toLocaleString()}`}
            subtitle="vs $40,500 mes anterior"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: mockData.monthGrowth, isPositive: true }}
            variant="primary"
          />
          <KPICard
            title="Ticket Promedio"
            value={`$${mockData.averageTicket}`}
            subtitle="Por servicio"
            icon={<Receipt className="h-6 w-6" />}
            trend={{ value: 5.2, isPositive: true }}
          />
          <KPICard
            title="Servicios Totales"
            value={mockData.totalServices}
            subtitle="Este mes"
            icon={<Scissors className="h-6 w-6" />}
          />
          <KPICard
            title="Margen Operativo"
            value="38%"
            subtitle="Utilidad / Ingresos"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="accent"
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BreakEvenWidget
            totalExpenses={mockData.totalExpenses}
            averageTicket={mockData.averageTicket}
            completedServices={mockData.totalServices}
          />
          <WaterfallChart
            totalRevenue={mockData.monthlyRevenue}
            materialsCost={mockData.materialsCost}
            fixedExpenses={mockData.fixedExpenses}
            salaryProvisions={mockData.salaryProvisions}
          />
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Nueva Venta", icon: "💅", href: "/nueva-venta" },
              { label: "Ver Inventario", icon: "📦", href: "/inventario" },
              { label: "Añadir Gasto", icon: "💰", href: "/costos-gastos" },
              { label: "Configurar", icon: "⚙️", href: "/configuracion" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

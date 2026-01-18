import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Scissors,
  Receipt,
  Target,
  PiggyBank,
  AlertTriangle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useBusinessConfig } from "@/stores/businessConfig";

export default function DashboardAvanzado() {
  const {
    totalFixedExpenses,
    desiredMonthlySalary,
    includeAguinaldo,
    annualInsurance,
    services,
    serviceLogs,
    savingsBuckets,
    getBreakEvenServices,
    getMonthlyStats,
  } = useBusinessConfig();

  const stats = getMonthlyStats();
  const breakEvenServices = getBreakEvenServices();
  
  // Monthly calculations
  const aguinaldoMonthly = includeAguinaldo ? desiredMonthlySalary / 12 : 0;
  const insuranceMonthly = annualInsurance / 12;
  const totalProvisions = desiredMonthlySalary + aguinaldoMonthly + insuranceMonthly;
  const totalMonthlyRequired = totalFixedExpenses + totalProvisions;

  // Average ticket
  const avgTicket = stats.servicesCount > 0 
    ? stats.totalRevenue / stats.servicesCount 
    : services.reduce((sum, s) => sum + s.basePrice, 0) / services.length || 500;

  // Progress towards break-even
  const breakEvenProgress = Math.min((stats.servicesCount / breakEvenServices) * 100, 100);
  const revenueProgress = Math.min((stats.totalRevenue / totalMonthlyRequired) * 100, 100);

  // Pie chart data for income distribution
  const expensePercent = ((totalFixedExpenses + stats.totalMaterialCost) / Math.max(stats.totalRevenue, 1)) * 100;
  const salaryPercent = (stats.totalTimeValue / Math.max(stats.totalRevenue, 1)) * 100;
  const profitPercent = (stats.netProfit / Math.max(stats.totalRevenue, 1)) * 100;

  const pieData = [
    { name: "Gastos (Mat + Fijos)", value: Math.max(expensePercent, 0), color: "#ef4444" },
    { name: "Sueldo (Tiempo)", value: Math.max(salaryPercent, 0), color: "#eab308" },
    { name: "Utilidad Neta", value: Math.max(profitPercent, 0), color: "#22c55e" },
  ].filter(d => d.value > 0);

  // Demo data for Waterfall if no logs
  const demoRevenue = stats.totalRevenue || 45600;
  const demoMaterials = stats.totalMaterialCost || 8200;
  const demoProfit = stats.netProfit || 12400;

  // Savings buckets with accumulated amounts
  const savingsFromRevenue = savingsBuckets.map((bucket) => ({
    ...bucket,
    monthlyAmount: (stats.totalRevenue * bucket.targetPercent) / 100,
  }));

  // Health indicator
  const isHealthy = expensePercent < 30 && stats.netProfit > 0;
  const isWarning = expensePercent >= 30 && expensePercent < 50;
  const isCritical = expensePercent >= 50 || stats.netProfit < 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Dashboard Financiero
          </h1>
          <p className="text-muted-foreground mt-1">
            Semáforo de salud de tu negocio
          </p>
        </div>

        {/* Health Status Banner */}
        <Card className={`shadow-card animate-fade-in border-2 ${
          isHealthy ? 'border-green-500 bg-green-50' :
          isWarning ? 'border-yellow-500 bg-yellow-50' :
          'border-destructive bg-destructive/5'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {isHealthy && <ThumbsUp className="h-10 w-10 text-green-500" />}
              {isWarning && <AlertTriangle className="h-10 w-10 text-yellow-500" />}
              {isCritical && <ThumbsDown className="h-10 w-10 text-destructive" />}
              <div>
                <h2 className={`text-xl font-bold ${
                  isHealthy ? 'text-green-700' :
                  isWarning ? 'text-yellow-700' :
                  'text-destructive'
                }`}>
                  {isHealthy && "¡Tu negocio está sano! 🎉"}
                  {isWarning && "⚠️ Atención: Gastos elevados"}
                  {isCritical && "🚨 Alerta: Revisa tu estructura de costos"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isHealthy && "Los gastos están controlados y generas utilidad positiva."}
                  {isWarning && "Los gastos representan más del 30% de tus ingresos."}
                  {isCritical && "Los gastos superan el 50% o estás teniendo pérdidas."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Ingresos del Mes</span>
              </div>
              <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                Meta: ${totalMonthlyRequired.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Receipt className="h-4 w-4" />
                <span className="text-sm">Ticket Promedio</span>
              </div>
              <p className="text-2xl font-bold">${avgTicket.toFixed(0)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Scissors className="h-4 w-4" />
                <span className="text-sm">Servicios</span>
              </div>
              <p className="text-2xl font-bold">{stats.servicesCount}</p>
              <p className="text-xs text-muted-foreground">
                de {breakEvenServices} para punto equilibrio
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">Utilidad Neta</span>
              </div>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                ${stats.netProfit.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Break Even Thermometer */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Termómetro de Punto de Equilibrio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Services progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Servicios realizados</span>
                <span className="font-bold">
                  {stats.servicesCount} / {breakEvenServices}
                </span>
              </div>
              <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    breakEvenProgress >= 100 ? 'bg-green-500' : 'gradient-primary'
                  }`}
                  style={{ width: `${breakEvenProgress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {breakEvenProgress.toFixed(0)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {breakEvenProgress >= 100 
                  ? "🎉 ¡Alcanzaste el punto de equilibrio!" 
                  : `Faltan ${breakEvenServices - stats.servicesCount} servicios`}
              </p>
            </div>

            {/* Revenue progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Ingresos vs Meta</span>
                <span className="font-bold">
                  ${stats.totalRevenue.toLocaleString()} / ${totalMonthlyRequired.toLocaleString()}
                </span>
              </div>
              <Progress value={revenueProgress} className="h-4" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Income Distribution */}
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle>Distribución de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${value.toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Registra servicios para ver la distribución</p>
                </div>
              )}

              {/* Legend explanation */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 rounded-lg bg-destructive/10">
                  <div className="w-3 h-3 rounded-full bg-destructive mx-auto mb-1" />
                  <p className="text-xs font-medium">Gastos</p>
                  <p className="text-xs text-muted-foreground">Alerta si &gt;30%</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mx-auto mb-1" />
                  <p className="text-xs font-medium">Sueldo</p>
                  <p className="text-xs text-muted-foreground">Tu tiempo</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-500/10">
                  <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1" />
                  <p className="text-xs font-medium">Utilidad</p>
                  <p className="text-xs text-muted-foreground">Reinversión</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Buckets */}
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Buckets de Ahorro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savingsFromRevenue.map((bucket) => (
                <div key={bucket.id} className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{bucket.icon}</span>
                      <span className="font-medium">{bucket.name}</span>
                    </div>
                    <Badge variant="secondary">{bucket.targetPercent}%</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Este mes apartarías:</span>
                    <span className="font-bold text-primary">
                      ${bucket.monthlyAmount.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Acumulado:</span>
                    <span className="font-bold text-accent">
                      ${bucket.currentAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Apartado Este Mes:</span>
                  <span className="text-2xl font-bold">
                    ${savingsFromRevenue.reduce((sum, b) => sum + b.monthlyAmount, 0).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick insight */}
        <Card className="shadow-card animate-fade-in bg-secondary text-secondary-foreground">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-bold text-lg mb-2">💡 Insight del Mes</h3>
                <p>
                  {stats.servicesCount === 0 
                    ? "Aún no tienes servicios registrados. Usa el cronómetro en 'Servicio en Curso' para comenzar a trackear tu rentabilidad real."
                    : stats.netProfit > 0
                      ? `¡Excelente! Estás generando $${stats.netProfit.toFixed(0)} de utilidad neta. 
                         Tu ticket promedio es de $${avgTicket.toFixed(0)}. 
                         ${breakEvenProgress >= 100 ? 'Ya alcanzaste tu punto de equilibrio.' : `Necesitas ${breakEvenServices - stats.servicesCount} servicios más para alcanzar el punto de equilibrio.`}`
                      : `Atención: Este mes estás teniendo pérdidas de $${Math.abs(stats.netProfit).toFixed(0)}. 
                         Revisa tus precios o reduce gastos fijos.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

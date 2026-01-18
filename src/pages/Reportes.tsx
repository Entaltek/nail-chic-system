import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Target,
  Users,
  TrendingUp,
  Star,
  AlertTriangle,
  DollarSign,
  Gift,
  Percent,
  RefreshCcw,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { useBusinessConfig } from "@/stores/businessConfig";

// Mock data for the matrix (since we may not have enough real logs)
const generateMockServiceData = (services: { id: string; name: string; basePrice: number; estimatedMinutes: number }[]) => {
  return services.map((service, index) => ({
    id: service.id,
    name: service.name,
    // Popularity: simulated sales count
    popularity: Math.floor(Math.random() * 30) + 5,
    // Profitability: $ earned per hour
    profitPerHour: ((service.basePrice / service.estimatedMinutes) * 60) - (Math.random() * 100),
    price: service.basePrice,
    duration: service.estimatedMinutes,
  }));
};

export default function Reportes() {
  const {
    services,
    serviceLogs,
    savingsBuckets,
    desiredMonthlySalary,
    getMonthlyStats,
  } = useBusinessConfig();

  const stats = getMonthlyStats();

  // CAC Inputs
  const [marketingSpend, setMarketingSpend] = useState(300);
  const [newCustomers, setNewCustomers] = useState(10);
  const cac = newCustomers > 0 ? marketingSpend / newCustomers : 0;

  // Generate scatter data
  const scatterData = useMemo(() => {
    // If we have real logs, use them, otherwise use mock data
    if (serviceLogs.length >= 10) {
      // Group logs by service
      const serviceStats = services.map((service) => {
        const logs = serviceLogs.filter((l) => l.serviceId === service.id);
        const totalRevenue = logs.reduce((sum, l) => sum + l.chargedAmount, 0);
        const totalMinutes = logs.reduce((sum, l) => sum + l.realMinutes, 0);
        const avgProfitPerHour = totalMinutes > 0 
          ? (totalRevenue / totalMinutes) * 60 - (service.materialCost * (60 / service.estimatedMinutes))
          : 0;
        
        return {
          id: service.id,
          name: service.name,
          popularity: logs.length,
          profitPerHour: avgProfitPerHour,
          price: service.basePrice,
          duration: service.estimatedMinutes,
        };
      });
      return serviceStats;
    }
    
    return generateMockServiceData(services);
  }, [services, serviceLogs]);

  // Calculate medians for quadrant lines
  const avgPopularity = scatterData.length > 0 
    ? scatterData.reduce((sum, d) => sum + d.popularity, 0) / scatterData.length 
    : 15;
  const avgProfit = scatterData.length > 0 
    ? scatterData.reduce((sum, d) => sum + d.profitPerHour, 0) / scatterData.length 
    : 200;

  // Determine quadrant for each service
  const getQuadrant = (popularity: number, profit: number) => {
    if (popularity >= avgPopularity && profit >= avgProfit) return "star";
    if (popularity >= avgPopularity && profit < avgProfit) return "cow";
    if (popularity < avgPopularity && profit >= avgProfit) return "question";
    return "dog";
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "star": return "#22c55e"; // Green - Promote these!
      case "cow": return "#eab308"; // Yellow - High volume, low margin
      case "question": return "#3b82f6"; // Blue - Potential, needs marketing
      case "dog": return "#ef4444"; // Red - Consider removing
      default: return "#9ca3af";
    }
  };

  // Aguinaldo Projection
  const currentMonth = new Date().getMonth(); // 0-11
  const aguinaldoBucket = savingsBuckets.find((b) => b.id === "aguinaldo");
  const monthlyAguinaldo = desiredMonthlySalary / 12;
  const expectedAguinaldoSaved = monthlyAguinaldo * (currentMonth + 1);
  const actualAguinaldoSaved = aguinaldoBucket?.currentAmount || 0;
  const aguinaldoProgress = Math.min((actualAguinaldoSaved / (desiredMonthlySalary)) * 100, 100);

  // Retention mock (would come from customer data)
  const totalCustomers = 45; // Mock
  const returningCustomers = 32; // Mock
  const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Reportes de Inteligencia
          </h1>
          <p className="text-muted-foreground mt-1">
            Análisis estratégico para tomar mejores decisiones
          </p>
        </div>

        {/* Star vs Dog Matrix */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Matriz Estrella vs Fugitivo
            </CardTitle>
            <CardDescription>
              Identifica qué servicios promocionar y cuáles eliminar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="profitPerHour" 
                    name="Rentabilidad" 
                    unit="$/hr"
                    label={{ value: 'Rentabilidad ($/hora)', position: 'bottom', offset: 0 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="popularity" 
                    name="Popularidad" 
                    unit=" ventas"
                    label={{ value: 'Popularidad', angle: -90, position: 'left' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const quadrant = getQuadrant(data.popularity, data.profitPerHour);
                        const labels: Record<string, string> = {
                          star: "⭐ Estrella - ¡Promociona!",
                          cow: "🐄 Vaca Lechera - Alto volumen, bajo margen",
                          question: "❓ Interrogante - Potencial, necesita marketing",
                          dog: "🐕 Fugitivo - Considera eliminar",
                        };
                        return (
                          <div className="bg-card p-3 rounded-lg shadow-lg border">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${data.profitPerHour.toFixed(0)}/hora · {data.popularity} ventas
                            </p>
                            <Badge className="mt-2" style={{ backgroundColor: getQuadrantColor(quadrant) }}>
                              {labels[quadrant]}
                            </Badge>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={avgProfit} stroke="#9ca3af" strokeDasharray="3 3" />
                  <ReferenceLine y={avgPopularity} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Scatter name="Servicios" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getQuadrantColor(getQuadrant(entry.popularity, entry.profitPerHour))}
                        r={8}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs font-medium">⭐ Estrella</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-100">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs font-medium">🐄 Vaca Lechera</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-100">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-medium">❓ Interrogante</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-100">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-medium">🐕 Fugitivo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CAC Widget */}
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                CAC - Costo de Adquisición
              </CardTitle>
              <CardDescription>
                ¿Cuánto te cuesta conseguir una nueva clienta?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Gasto en Marketing/Mes
                  </Label>
                  <Input
                    type="number"
                    value={marketingSpend}
                    onChange={(e) => setMarketingSpend(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Nuevas Clientas
                  </Label>
                  <Input
                    type="number"
                    value={newCustomers}
                    onChange={(e) => setNewCustomers(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="rounded-xl gradient-primary p-6 text-primary-foreground text-center">
                <p className="text-sm opacity-90">Costo por Cliente</p>
                <p className="text-4xl font-bold">${cac.toFixed(0)}</p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${cac > 100 ? 'text-destructive' : 'text-green-500'}`} />
                <div className="text-sm">
                  {cac <= 50 && (
                    <p className="text-green-600">
                      ¡Excelente! Tu CAC es muy bajo. Tu marketing es eficiente.
                    </p>
                  )}
                  {cac > 50 && cac <= 100 && (
                    <p>
                      Tu CAC es aceptable. Asegúrate que cada clienta nueva genere al menos ${cac * 3} en su primera visita.
                    </p>
                  )}
                  {cac > 100 && (
                    <p className="text-destructive">
                      CAC alto. Considera optimizar tu estrategia de marketing o enfocarte más en retención.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retention Widget */}
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-primary" />
                Tasa de Retención
              </CardTitle>
              <CardDescription>
                ¿Cuántas clientas regresan?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-muted/50">
                  <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                  <p className="text-xs text-muted-foreground">Total Clientas</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <RefreshCcw className="h-6 w-6 mx-auto text-accent mb-2" />
                  <p className="text-2xl font-bold">{returningCustomers}</p>
                  <p className="text-xs text-muted-foreground">Recurrentes</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <TrendingUp className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{totalCustomers - returningCustomers}</p>
                  <p className="text-xs text-muted-foreground">Nuevas</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tasa de Retención</span>
                  <span className={`font-bold ${retentionRate >= 70 ? 'text-green-600' : retentionRate >= 50 ? 'text-yellow-600' : 'text-destructive'}`}>
                    {retentionRate.toFixed(0)}%
                  </span>
                </div>
                <Progress value={retentionRate} className="h-3" />
              </div>

              <div className="text-sm text-muted-foreground">
                {retentionRate >= 70 && "🎉 ¡Excelente retención! Tus clientas te aman."}
                {retentionRate >= 50 && retentionRate < 70 && "👍 Buena retención. Hay espacio para mejorar con programa de lealtad."}
                {retentionRate < 50 && "⚠️ Retención baja. Considera encuestas de satisfacción y promociones para recurrentes."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aguinaldo Projection */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent" />
              Proyección de Aguinaldo
            </CardTitle>
            <CardDescription>
              ¿Cuánto deberías haber ahorrado para tu aguinaldo?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Aguinaldo Meta</p>
                <p className="text-xl font-bold">${desiredMonthlySalary.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Ahorro Mensual</p>
                <p className="text-xl font-bold text-primary">${monthlyAguinaldo.toFixed(0)}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Esperado (Mes {currentMonth + 1})</p>
                <p className="text-xl font-bold">${expectedAguinaldoSaved.toFixed(0)}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/20">
                <p className="text-sm text-muted-foreground">Ahorrado Real</p>
                <p className={`text-xl font-bold ${actualAguinaldoSaved >= expectedAguinaldoSaved ? 'text-green-600' : 'text-destructive'}`}>
                  ${actualAguinaldoSaved.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso hacia aguinaldo completo</span>
                <span className="font-bold">{aguinaldoProgress.toFixed(0)}%</span>
              </div>
              <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 gradient-primary transition-all duration-500"
                  style={{ width: `${aguinaldoProgress}%` }}
                />
                {/* Expected marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-foreground/30"
                  style={{ left: `${Math.min((expectedAguinaldoSaved / desiredMonthlySalary) * 100, 100)}%` }}
                  title={`Esperado: $${expectedAguinaldoSaved.toFixed(0)}`}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {actualAguinaldoSaved >= expectedAguinaldoSaved 
                  ? "✅ ¡Vas al día con tu ahorro!"
                  : `⚠️ Te faltan $${(expectedAguinaldoSaved - actualAguinaldoSaved).toFixed(0)} para estar al corriente`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

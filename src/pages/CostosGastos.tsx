import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Clock,
  Calculator,
  PiggyBank,
  Trash2,
  Plus,
  Heart,
  Gift,
  AlertTriangle,
  TrendingUp,
  Building2,
  Smartphone,
  Users,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBusinessConfig, ExpenseCategoryType } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

const expenseTypeInfo: Record<ExpenseCategoryType, { label: string; icon: React.ReactNode; color: string }> = {
  INFRAESTRUCTURA: { label: 'Infraestructura', icon: <Building2 className="h-3 w-3" />, color: 'bg-blue-500' },
  SUSCRIPCIONES: { label: 'Suscripciones', icon: <Smartphone className="h-3 w-3" />, color: 'bg-purple-500' },
  EQUIPO_STAFF: { label: 'Staff', icon: <Users className="h-3 w-3" />, color: 'bg-green-500' },
  OTROS: { label: 'Otros', icon: <HelpCircle className="h-3 w-3" />, color: 'bg-gray-500' },
};

export default function CostosGastos() {
  const {
    monthlyWorkHours,
    desiredMonthlySalary,
    costPerMinute,
    fixedExpenses,
    totalFixedExpenses,
    savingsBuckets,
    includeAguinaldo,
    annualInsurance,
    setBusinessConfig,
    addFixedExpense,
    updateFixedExpense,
    removeFixedExpense,
  } = useBusinessConfig();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ 
    name: "", 
    category: "", 
    expenseType: "OTROS" as ExpenseCategoryType,
    amount: "", 
    budget: "" 
  });

  // Calculations
  const aguinaldoMonthly = includeAguinaldo ? desiredMonthlySalary / 12 : 0;
  const insuranceMonthly = annualInsurance / 12;
  const totalSalaryProvisions = desiredMonthlySalary + aguinaldoMonthly + insuranceMonthly;
  const totalMonthlyRequired = totalFixedExpenses + totalSalaryProvisions;
  const totalBucketsPercent = savingsBuckets.reduce((sum, b) => sum + b.targetPercent, 0);

  // Group expenses by type
  const expensesByType = fixedExpenses.reduce((acc, expense) => {
    const type = expense.expenseType || 'OTROS';
    if (!acc[type]) acc[type] = [];
    acc[type].push(expense);
    return acc;
  }, {} as Record<ExpenseCategoryType, typeof fixedExpenses>);

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      toast({ title: "Campos requeridos", variant: "destructive" });
      return;
    }
    addFixedExpense({
      name: newExpense.name,
      category: newExpense.category || "Otro",
      expenseType: newExpense.expenseType,
      amount: parseFloat(newExpense.amount),
      budget: parseFloat(newExpense.budget) || parseFloat(newExpense.amount),
    });
    setNewExpense({ name: "", category: "", expenseType: "OTROS", amount: "", budget: "" });
    setIsExpenseDialogOpen(false);
    toast({ title: "¡Gasto fijo agregado! 💰" });
  };

  return (
    <MainLayout>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            Costos y Gastos
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra tus finanzas y metas mensuales
          </p>
        </div>

        {/* Top Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Gastos Fijos</p>
              <p className="text-2xl font-bold text-foreground">${totalFixedExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Sueldo Base</p>
              <p className="text-2xl font-bold text-foreground">${desiredMonthlySalary.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Provisiones</p>
              <p className="text-2xl font-bold text-foreground">${(aguinaldoMonthly + insuranceMonthly).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-4 text-center">
              <p className="text-xs opacity-90 mb-1">Meta Total</p>
              <p className="text-2xl font-bold">${totalMonthlyRequired.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Valor del Tiempo + Opciones */}
          <div className="space-y-6">
            {/* Meta Mensual Card */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Meta Mensual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    ¿Cuánto quieres ganar al mes?
                  </Label>
                  <Input
                    type="number"
                    value={desiredMonthlySalary}
                    onChange={(e) => setBusinessConfig({ desiredMonthlySalary: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    Horas laborales al mes
                  </Label>
                  <Input
                    type="number"
                    value={monthlyWorkHours}
                    onChange={(e) => setBusinessConfig({ monthlyWorkHours: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Costo por Minuto + Aguinaldo + Seguro */}
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-4">
                {/* Cost per minute */}
                <div className="rounded-xl gradient-primary p-4 text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-90">Tu costo por minuto:</p>
                      <p className="text-3xl font-bold">
                        ${costPerMinute.toFixed(2)}
                        <span className="text-sm font-normal ml-1">/min</span>
                      </p>
                      <p className="text-xs opacity-80 mt-1">
                        = ${(costPerMinute * 60).toFixed(0)}/hora
                      </p>
                    </div>
                    <Calculator className="h-10 w-10 opacity-50" />
                  </div>
                </div>

                {/* Aguinaldo */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-sm font-medium">¿Incluir Aguinaldo?</p>
                      <p className="text-xs text-muted-foreground">
                        +${aguinaldoMonthly.toLocaleString()}/mes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={includeAguinaldo}
                    onCheckedChange={(checked) => setBusinessConfig({ includeAguinaldo: checked })}
                  />
                </div>

                {/* Seguro Médico */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Heart className="h-3 w-3 text-accent" />
                    Seguro Médico Anual
                  </Label>
                  <Input
                    type="number"
                    value={annualInsurance}
                    onChange={(e) => setBusinessConfig({ annualInsurance: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    = ${insuranceMonthly.toLocaleString()}/mes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alerta */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <AlertTriangle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <p className="text-sm">
                Tu negocio debe generar <strong>${totalMonthlyRequired.toLocaleString()}</strong> al mes.
              </p>
            </div>
          </div>

          {/* Right Column: Costos Fijos + Fondos de Ahorro */}
          <div className="lg:col-span-2">
            <Card className="shadow-card h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Costos Fijos y Fondo de Ahorros
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Gastos mensuales y porcentajes de ahorro automático
                  </CardDescription>
                </div>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </DialogTrigger>
              <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Gasto Fijo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre</Label>
                          <Input
                            value={newExpense.name}
                            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                            placeholder="Ej. Renta"
                          />
                        </div>
                        <div>
                          <Label>Etiqueta</Label>
                          <Input
                            value={newExpense.category}
                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            placeholder="Ej. Local"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Tipo de Gasto</Label>
                        <Select 
                          value={newExpense.expenseType} 
                          onValueChange={(v) => setNewExpense({ ...newExpense, expenseType: v as ExpenseCategoryType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(expenseTypeInfo).map(([key, info]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${info.color}`} />
                                  {info.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Monto</Label>
                          <Input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                            placeholder="8000"
                          />
                        </div>
                        <div>
                          <Label>Presupuesto</Label>
                          <Input
                            type="number"
                            value={newExpense.budget}
                            onChange={(e) => setNewExpense({ ...newExpense, budget: e.target.value })}
                            placeholder="8000"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddExpense} className="w-full">
                        Agregar Gasto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fixed Expenses List - Grouped by Type */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Costos Fijos Mensuales
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {Object.entries(expenseTypeInfo).map(([type, info]) => {
                        const expenses = expensesByType[type as ExpenseCategoryType] || [];
                        if (expenses.length === 0) return null;
                        const typeTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${info.color} text-white gap-1 text-xs`}>
                                {info.icon}
                                {info.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-auto">
                                ${typeTotal.toLocaleString()}
                              </span>
                            </div>
                            {expenses.map((expense) => (
                              <div
                                key={expense.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors ml-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-2 h-2 rounded-full ${info.color} shrink-0`} />
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{expense.name}</p>
                                    {expense.category && (
                                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-bold text-sm">${expense.amount.toLocaleString()}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => removeFixedExpense(expense.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-base font-bold mt-4 pt-4 border-t border-border">
                      <span>Total:</span>
                      <span className="text-primary">${totalFixedExpenses.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Savings Buckets */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Fondos de Ahorro (Buckets)
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Porcentaje de cada venta que se aparta
                    </p>
                    <div className="space-y-4">
                      {savingsBuckets.map((bucket) => (
                        <div key={bucket.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{bucket.icon}</span>
                              <span className="font-medium text-sm">{bucket.name}</span>
                            </div>
                            <span className="text-primary font-bold">{bucket.targetPercent}%</span>
                          </div>
                          <Progress value={bucket.targetPercent * 3} className="h-2" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 mt-4">
                      <span className="font-medium text-sm">Total apartado:</span>
                      <span className="font-bold text-accent">{totalBucketsPercent.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

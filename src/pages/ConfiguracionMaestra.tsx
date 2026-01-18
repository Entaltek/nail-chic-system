import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Settings2,
  Clock,
  DollarSign,
  PiggyBank,
  Calculator,
  Users,
  Trash2,
  Plus,
  Store,
  Heart,
  Gift,
  AlertTriangle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBusinessConfig, FixedExpense, TeamMember } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

export default function ConfiguracionMaestra() {
  const {
    businessName,
    monthlyWorkHours,
    desiredMonthlySalary,
    costPerMinute,
    fixedExpenses,
    totalFixedExpenses,
    savingsBuckets,
    teamMembers,
    includeAguinaldo,
    annualInsurance,
    setBusinessConfig,
    addFixedExpense,
    removeFixedExpense,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
  } = useBusinessConfig();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: "", category: "", amount: "", budget: "" });
  const [newMember, setNewMember] = useState({ name: "", commissionPercent: "40" });

  // Calculations
  const aguinaldoMonthly = includeAguinaldo ? desiredMonthlySalary / 12 : 0;
  const insuranceMonthly = annualInsurance / 12;
  const totalSalaryProvisions = desiredMonthlySalary + aguinaldoMonthly + insuranceMonthly;
  const totalMonthlyRequired = totalFixedExpenses + totalSalaryProvisions;
  const totalBucketsPercent = savingsBuckets.reduce((sum, b) => sum + b.targetPercent, 0);

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      toast({ title: "Campos requeridos", variant: "destructive" });
      return;
    }
    addFixedExpense({
      name: newExpense.name,
      category: newExpense.category || "Otro",
      amount: parseFloat(newExpense.amount),
      budget: parseFloat(newExpense.budget) || parseFloat(newExpense.amount),
    });
    setNewExpense({ name: "", category: "", amount: "", budget: "" });
    setIsExpenseDialogOpen(false);
    toast({ title: "¡Gasto fijo agregado! 💰" });
  };

  const handleAddTeamMember = () => {
    if (!newMember.name) {
      toast({ title: "Nombre requerido", variant: "destructive" });
      return;
    }
    addTeamMember({
      name: newMember.name,
      role: 'employee',
      commissionPercent: parseFloat(newMember.commissionPercent) || 40,
      isActive: true,
    });
    setNewMember({ name: "", commissionPercent: "40" });
    setIsTeamDialogOpen(false);
    toast({ title: "¡Miembro del equipo agregado! 👩‍🎨" });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            Configuración Maestra
          </h1>
          <p className="text-muted-foreground mt-1">
            El cerebro de tu negocio - Define tus variables globales
          </p>
        </div>

        {/* Business Info */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Información del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Salón</Label>
              <Input 
                value={businessName}
                onChange={(e) => setBusinessConfig({ businessName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Value of Time */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Valor del Tiempo
            </CardTitle>
            <CardDescription>
              Calcula cuánto vale cada minuto de tu trabajo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  ¿Cuánto quieres ganar al mes?
                </Label>
                <Input
                  type="number"
                  value={desiredMonthlySalary}
                  onChange={(e) => setBusinessConfig({ desiredMonthlySalary: parseFloat(e.target.value) || 0 })}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Horas laborales al mes
                </Label>
                <Input
                  type="number"
                  value={monthlyWorkHours}
                  onChange={(e) => setBusinessConfig({ monthlyWorkHours: parseFloat(e.target.value) || 1 })}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Cost per minute result */}
            <div className="rounded-xl gradient-primary p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Tu costo por minuto:</p>
                  <p className="text-4xl font-bold">
                    ${costPerMinute.toFixed(2)}
                    <span className="text-lg font-normal ml-1">/min</span>
                  </p>
                  <p className="text-sm opacity-80 mt-1">
                    = ${(costPerMinute * 60).toFixed(0)}/hora
                  </p>
                </div>
                <Calculator className="h-12 w-12 opacity-50" />
              </div>
            </div>

            {/* Aguinaldo & Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-accent" />
                  <div>
                    <Label>¿Incluir Aguinaldo?</Label>
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
              <div className="space-y-2 p-4 rounded-xl bg-muted/50">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
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
            </div>
          </CardContent>
        </Card>

        {/* Fixed Expenses */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Costos Fijos Mensuales
              </CardTitle>
              <CardDescription>
                Gastos que pagas cada mes sin importar las ventas
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
                      <Label>Categoría</Label>
                      <Input
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        placeholder="Ej. Local"
                      />
                    </div>
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
            <div className="space-y-3">
              {fixedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{expense.name}</p>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">${expense.amount.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFixedExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Gastos Fijos:</span>
              <span className="text-primary">${totalFixedExpenses.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Buckets */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              Fondos de Ahorro (Buckets)
            </CardTitle>
            <CardDescription>
              Porcentaje de cada venta que se aparta automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savingsBuckets.map((bucket) => (
              <div key={bucket.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{bucket.icon}</span>
                    <span className="font-medium">{bucket.name}</span>
                  </div>
                  <span className="text-primary font-bold">{bucket.targetPercent}%</span>
                </div>
                <Progress value={bucket.targetPercent * 3} className="h-2" />
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
              <span className="font-medium">Total apartado por venta:</span>
              <span className="font-bold text-accent">{totalBucketsPercent.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Equipo de Trabajo
              </CardTitle>
              <CardDescription>
                Configura las comisiones de tu equipo
              </CardDescription>
            </div>
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Empleada</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="Ej. María"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comisión para empleada: {newMember.commissionPercent}%</Label>
                    <Slider
                      value={[parseFloat(newMember.commissionPercent) || 40]}
                      onValueChange={([value]) => setNewMember({ ...newMember, commissionPercent: value.toString() })}
                      min={20}
                      max={70}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Estudio recibe: {100 - (parseFloat(newMember.commissionPercent) || 40)}%
                    </p>
                  </div>
                  <Button onClick={handleAddTeamMember} className="w-full">
                    Agregar al Equipo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.role === 'owner' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.role === 'owner' ? 'Dueña' : 'Empleada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {member.role === 'employee' && (
                      <>
                        <div className="text-right">
                          <p className="font-bold">{member.commissionPercent}%</p>
                          <p className="text-xs text-muted-foreground">comisión</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeTeamMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {member.role === 'owner' && (
                      <Sparkles className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="shadow-card animate-fade-in border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resumen: Meta Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-secondary text-secondary-foreground p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm opacity-80">Gastos Fijos</p>
                  <p className="text-xl font-bold">${totalFixedExpenses.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Sueldo Base</p>
                  <p className="text-xl font-bold">${desiredMonthlySalary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Provisiones</p>
                  <p className="text-xl font-bold">${(aguinaldoMonthly + insuranceMonthly).toLocaleString()}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-sm opacity-80">Meta Total</p>
                  <p className="text-3xl font-bold text-accent">
                    ${totalMonthlyRequired.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 mt-4 rounded-xl bg-accent/10 border border-accent/20">
              <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
              <p className="text-sm">
                Tu negocio debe generar <strong>${totalMonthlyRequired.toLocaleString()}</strong> al mes 
                para cubrir todos los gastos y pagarte lo que mereces.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

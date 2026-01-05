import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Plus,
  Calculator,
  DollarSign,
  Heart,
  Gift,
  Wallet,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  category: string;
  name: string;
  amount: number;
  budget: number;
}

const initialExpenses: Expense[] = [
  { id: "1", category: "Local", name: "Renta", amount: 8000, budget: 8000 },
  { id: "2", category: "Servicios", name: "Luz", amount: 1200, budget: 1500 },
  { id: "3", category: "Software", name: "Entaltek", amount: 400, budget: 400 },
  { id: "4", category: "Marketing", name: "Publicidad", amount: 2500, budget: 3000 },
  { id: "5", category: "Transporte", name: "Uber/Gasolina", amount: 1800, budget: 2000 },
];

export default function Finanzas() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "",
    name: "",
    amount: "",
    budget: "",
  });

  // Salary simulator state
  const [desiredSalary, setDesiredSalary] = useState<number>(15000);
  const [includeAguinaldo, setIncludeAguinaldo] = useState(true);
  const [annualInsurance, setAnnualInsurance] = useState<number>(24000);

  // Calculations
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);

  // Salary calculations
  const aguinaldoMonthly = includeAguinaldo ? desiredSalary / 12 : 0;
  const insuranceMonthly = annualInsurance / 12;
  const totalSalaryProvisions = desiredSalary + aguinaldoMonthly + insuranceMonthly;

  const totalMonthlyRequired = totalExpenses + totalSalaryProvisions;

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      toast({
        title: "Campos requeridos",
        description: "Nombre y monto son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category || "Otro",
      name: newExpense.name,
      amount: parseFloat(newExpense.amount),
      budget: parseFloat(newExpense.budget) || parseFloat(newExpense.amount),
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ category: "", name: "", amount: "", budget: "" });
    setIsDialogOpen(false);

    toast({
      title: "¡Gasto agregado! 💰",
      description: `${expense.name} - $${expense.amount.toLocaleString()}`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              Finanzas CFO
            </h1>
            <p className="text-muted-foreground mt-1">
              Simula tu sueldo y controla tus gastos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-button">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoría</Label>
                    <Input
                      value={newExpense.category}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, category: e.target.value })
                      }
                      placeholder="Ej. Marketing"
                    />
                  </div>
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={newExpense.name}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, name: e.target.value })
                      }
                      placeholder="Ej. Facebook Ads"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monto Gastado</Label>
                    <Input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: e.target.value })
                      }
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label>Presupuesto Mensual</Label>
                    <Input
                      type="number"
                      value={newExpense.budget}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, budget: e.target.value })
                      }
                      placeholder="6000"
                    />
                  </div>
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  Agregar Gasto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Salary Simulator */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Simulador de Sueldo y Prestaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Desired Salary */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  ¿Sueldo deseado mensual?
                </Label>
                <Input
                  type="number"
                  value={desiredSalary}
                  onChange={(e) => setDesiredSalary(parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>

              {/* Aguinaldo Toggle */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  ¿Incluir Aguinaldo?
                </Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={includeAguinaldo}
                    onCheckedChange={setIncludeAguinaldo}
                  />
                  <span className="text-sm text-muted-foreground">
                    {includeAguinaldo
                      ? `+$${aguinaldoMonthly.toLocaleString()}/mes`
                      : "No incluido"}
                  </span>
                </div>
              </div>

              {/* Annual Insurance */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  Costo Seguro Médico Anual
                </Label>
                <Input
                  type="number"
                  value={annualInsurance}
                  onChange={(e) => setAnnualInsurance(parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl gradient-primary p-6 text-primary-foreground">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm opacity-80">Sueldo Base</p>
                  <p className="text-xl font-bold">${desiredSalary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Aguinaldo/mes</p>
                  <p className="text-xl font-bold">${aguinaldoMonthly.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Seguro/mes</p>
                  <p className="text-xl font-bold">${insuranceMonthly.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Total Provisiones</p>
                  <p className="text-2xl font-bold">
                    ${totalSalaryProvisions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <DollarSign className="h-5 w-5 text-accent mt-0.5" />
              <p className="text-foreground">
                Para ganar <strong>${desiredSalary.toLocaleString()}</strong> 
                {includeAguinaldo && " con aguinaldo"} y tener seguro médico, 
                tu negocio debe generar{" "}
                <strong className="text-primary">
                  ${totalMonthlyRequired.toLocaleString()} MXN
                </strong>{" "}
                al mes como mínimo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories with Progress */}
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground">
            Control de Presupuesto por Categoría
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenses.map((expense) => {
              const percentage = (expense.amount / expense.budget) * 100;
              const isOverBudget = percentage > 100;

              return (
                <div
                  key={expense.id}
                  className="rounded-xl bg-card p-4 shadow-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{expense.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isOverBudget ? "text-destructive" : "text-foreground"
                        }`}
                      >
                        ${expense.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        de ${expense.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {percentage.toFixed(0)}% utilizado
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Summary */}
        <div className="rounded-2xl bg-secondary text-secondary-foreground p-6 shadow-card animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm opacity-80">Gastos Fijos</p>
              <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Sueldo + Prestaciones</p>
              <p className="text-2xl font-bold">
                ${totalSalaryProvisions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-80">Presupuesto Total</p>
              <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Meta Mensual</p>
              <p className="text-3xl font-bold text-accent">
                ${totalMonthlyRequired.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

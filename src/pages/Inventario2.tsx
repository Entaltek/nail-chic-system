import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Plus,
  AlertTriangle,
  Droplet,
  DollarSign,
  Clock,
  TrendingDown,
  Calculator,
  Info,
  Trash2,
} from "lucide-react";
import { useBusinessConfig, InventoryItem } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

export default function Inventario2() {
  const { inventory, addInventoryItem, updateInventoryItem, removeInventoryItem } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    totalStock: "",
    unit: "",
    minStock: "",
    purchaseCost: "",
    totalApplications: "",
    weeklyUsageRate: "",
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.totalStock || !newItem.purchaseCost || !newItem.totalApplications) {
      toast({
        title: "Campos requeridos",
        description: "Nombre, stock, costo y aplicaciones son obligatorios",
        variant: "destructive",
      });
      return;
    }

    addInventoryItem({
      name: newItem.name,
      category: newItem.category || "General",
      totalStock: parseFloat(newItem.totalStock),
      unit: newItem.unit || "unidades",
      minStock: parseFloat(newItem.minStock) || parseFloat(newItem.totalStock) * 0.2,
      purchaseCost: parseFloat(newItem.purchaseCost),
      totalApplications: parseFloat(newItem.totalApplications),
      weeklyUsageRate: parseFloat(newItem.weeklyUsageRate) || 10,
    });

    setNewItem({
      name: "",
      category: "",
      totalStock: "",
      unit: "",
      minStock: "",
      purchaseCost: "",
      totalApplications: "",
      weeklyUsageRate: "",
    });
    setIsDialogOpen(false);

    toast({
      title: "¡Insumo agregado! 📦",
      description: `${newItem.name} con costo por gota calculado`,
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.effectiveStock <= item.minStock) return "critical";
    if (item.daysUntilEmpty <= 7) return "urgent";
    if (item.daysUntilEmpty <= 14) return "low";
    return "ok";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Crítico</Badge>;
      case "urgent":
        return <Badge className="bg-orange-500 text-white gap-1"><Clock className="h-3 w-3" />¡Urgente!</Badge>;
      case "low":
        return <Badge className="bg-accent text-accent-foreground gap-1">Stock Bajo</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-700">OK</Badge>;
    }
  };

  // Stats
  const totalItems = inventory.length;
  const criticalItems = inventory.filter((i) => getStockStatus(i) === "critical" || getStockStatus(i) === "urgent").length;
  const avgCostPerUse = inventory.length > 0
    ? inventory.reduce((sum, i) => sum + i.costPerUse, 0) / inventory.length
    : 0;

  // Smart alerts
  const urgentAlerts = inventory
    .filter((i) => i.daysUntilEmpty <= 7 && i.daysUntilEmpty > 0)
    .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Inventario 2.0
            </h1>
            <p className="text-muted-foreground mt-1">
              Calculadora de "Gota" y Costos por Aplicación
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-button">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Insumo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo Insumo con Costo por Gota</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Insumo</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ej. Monómero Acrílico"
                    />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Input
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="Ej. Acrílico"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      value={newItem.totalStock}
                      onChange={(e) => setNewItem({ ...newItem, totalStock: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label>Unidad</Label>
                    <Input
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      placeholder="ml"
                    />
                  </div>
                  <div>
                    <Label>Stock Mínimo</Label>
                    <Input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    Cálculo de Costo por Gota
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Costo del Producto ($)</Label>
                      <Input
                        type="number"
                        value={newItem.purchaseCost}
                        onChange={(e) => setNewItem({ ...newItem, purchaseCost: e.target.value })}
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <Label>Rinde para X aplicaciones</Label>
                      <Input
                        type="number"
                        value={newItem.totalApplications}
                        onChange={(e) => setNewItem({ ...newItem, totalApplications: e.target.value })}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  {newItem.purchaseCost && newItem.totalApplications && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <span className="text-sm">Costo por uso:</span>
                      <span className="text-lg font-bold text-primary">
                        ${(parseFloat(newItem.purchaseCost) / parseFloat(newItem.totalApplications)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Usos promedio por semana</Label>
                  <Input
                    type="number"
                    value={newItem.weeklyUsageRate}
                    onChange={(e) => setNewItem({ ...newItem, weeklyUsageRate: e.target.value })}
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Para calcular alertas inteligentes de reabastecimiento
                  </p>
                </div>

                <Button onClick={handleAddItem} className="w-full">
                  Agregar Insumo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Smart Alerts */}
        {urgentAlerts.length > 0 && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 animate-fade-in">
            <h3 className="font-semibold text-destructive flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5" />
              ¡Alertas de Stock!
            </h3>
            <div className="space-y-2">
              {urgentAlerts.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-background">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-destructive font-bold">
                    Se acaba en {item.daysUntilEmpty} días
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Insumos</p>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Críticos/Urgentes</p>
              <p className="text-2xl font-bold text-destructive">{criticalItems}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Costo Promedio/Uso</p>
              <p className="text-2xl font-bold text-primary">${avgCostPerUse.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Stock Efectivo</p>
              <p className="text-2xl font-bold text-accent">85%</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Costo por Gota</TableHead>
                <TableHead>Stock Efectivo</TableHead>
                <TableHead>Días Restantes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const status = getStockStatus(item);
                const percentage = (item.effectiveStock / item.totalStock) * 100;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Droplet className="h-4 w-4 text-primary" />
                        <span className="font-bold text-primary">${item.costPerUse.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ${item.purchaseCost} / {item.totalApplications} usos
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-medium">
                          {item.effectiveStock.toFixed(1)} {item.unit}
                        </span>
                        <Progress value={percentage} className="h-2 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className={`font-bold ${item.daysUntilEmpty <= 7 ? 'text-destructive' : ''}`}>
                          {item.daysUntilEmpty > 99 ? '99+' : item.daysUntilEmpty} días
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeInventoryItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Info className="h-4 w-4" />
          <span>
            El sistema calcula los <strong>días restantes</strong> basándose en tu ritmo de uso semanal 
            y te alerta cuando queden menos de 7 días de stock.
          </span>
        </div>
      </div>
    </MainLayout>
  );
}

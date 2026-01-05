import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  totalStock: number;
  effectiveStock: number;
  unit: string;
  minStock: number;
}

const initialInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Monómero Acrílico",
    category: "Acrílico",
    totalStock: 500,
    effectiveStock: 425,
    unit: "ml",
    minStock: 100,
  },
  {
    id: "2",
    name: "Polvo Acrílico Rosa",
    category: "Acrílico",
    totalStock: 200,
    effectiveStock: 170,
    unit: "g",
    minStock: 50,
  },
  {
    id: "3",
    name: "Gel Base Coat",
    category: "Gel",
    totalStock: 50,
    effectiveStock: 42.5,
    unit: "ml",
    minStock: 15,
  },
  {
    id: "4",
    name: "Top Coat Sin Capa",
    category: "Gel",
    totalStock: 30,
    effectiveStock: 25.5,
    unit: "ml",
    minStock: 10,
  },
  {
    id: "5",
    name: "Pedrería Swarovski",
    category: "Decoración",
    totalStock: 500,
    effectiveStock: 425,
    unit: "piezas",
    minStock: 100,
  },
];

export default function Inventario() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    totalStock: "",
    unit: "",
    minStock: "",
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.totalStock) {
      toast({
        title: "Campos requeridos",
        description: "Nombre y cantidad son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const total = parseFloat(newItem.totalStock);
    const effective = total * 0.85;

    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category || "General",
      totalStock: total,
      effectiveStock: effective,
      unit: newItem.unit || "unidades",
      minStock: parseFloat(newItem.minStock) || total * 0.2,
    };

    setInventory([...inventory, item]);
    setNewItem({ name: "", category: "", totalStock: "", unit: "", minStock: "" });
    setIsDialogOpen(false);

    toast({
      title: "¡Insumo agregado! 📦",
      description: `${item.name} - Stock efectivo: ${effective.toFixed(1)} ${item.unit}`,
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.effectiveStock / item.totalStock;
    if (item.effectiveStock <= item.minStock) return "critical";
    if (ratio < 0.4) return "low";
    return "ok";
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Inventario
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus insumos con factor de seguridad del 85%
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-button">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Insumo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Insumo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nombre del Insumo</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    placeholder="Ej. Monómero Acrílico"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoría</Label>
                    <Input
                      value={newItem.category}
                      onChange={(e) =>
                        setNewItem({ ...newItem, category: e.target.value })
                      }
                      placeholder="Ej. Acrílico"
                    />
                  </div>
                  <div>
                    <Label>Unidad</Label>
                    <Input
                      value={newItem.unit}
                      onChange={(e) =>
                        setNewItem({ ...newItem, unit: e.target.value })
                      }
                      placeholder="Ej. ml, g, piezas"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cantidad Total</Label>
                    <Input
                      type="number"
                      value={newItem.totalStock}
                      onChange={(e) =>
                        setNewItem({ ...newItem, totalStock: e.target.value })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label>Stock Mínimo</Label>
                    <Input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) =>
                        setNewItem({ ...newItem, minStock: e.target.value })
                      }
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Info about 85% rule */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 text-sm">
                  <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    El sistema calculará automáticamente un <strong>Stock Efectivo del 85%</strong>. 
                    El 15% restante se reserva como margen de merma y pruebas.
                  </p>
                </div>

                <Button onClick={handleAddItem} className="w-full">
                  Agregar Insumo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Insumos</p>
            <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Stock Bajo</p>
            <p className="text-2xl font-bold text-accent">
              {inventory.filter((i) => getStockStatus(i) === "low").length}
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Críticos</p>
            <p className="text-2xl font-bold text-destructive">
              {inventory.filter((i) => getStockStatus(i) === "critical").length}
            </p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock Total</TableHead>
                <TableHead>Stock Efectivo (85%)</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const status = getStockStatus(item);
                const percentage = (item.effectiveStock / item.totalStock) * 100;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.totalStock} {item.unit}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.effectiveStock.toFixed(1)} {item.unit}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {status === "critical" && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Crítico
                        </Badge>
                      )}
                      {status === "low" && (
                        <Badge className="bg-accent text-accent-foreground gap-1">
                          Bajo
                        </Badge>
                      )}
                      {status === "ok" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          OK
                        </Badge>
                      )}
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
            El <strong>15% de merma</strong> se descuenta automáticamente para pruebas y desperdicios normales.
          </span>
        </div>
      </div>
    </MainLayout>
  );
}

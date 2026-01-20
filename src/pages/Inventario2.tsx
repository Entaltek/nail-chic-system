import { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Package,
  Plus,
  AlertTriangle,
  Droplet,
  Clock,
  Info,
  Trash2,
  Box,
  Sparkles,
  Settings,
} from "lucide-react";
import { useBusinessConfig, InventoryItem, InventoryCategory, WearType } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const wearTypeLabels: Record<WearType, string> = {
  POR_UNIDAD: 'Por Unidad',
  POR_VOLUMEN: 'Por Volumen',
  POR_TIEMPO: 'Por Tiempo (Depreciación)',
  ADICIONAL: 'Adicional (Arte/Decoración)',
};

export default function Inventario2() {
  const { inventory, inventoryCategories, addInventoryItem, removeInventoryItem } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Dynamic form state based on category
  const [formData, setFormData] = useState({
    name: '',
    // Common
    purchaseCost: '',
    weeklyUsageRate: '',
    // POR_UNIDAD
    piecesPerBox: '',
    // POR_VOLUMEN
    totalContent: '',
    contentUnit: 'ml' as 'ml' | 'g',
    estimatedUses: '',
    // POR_TIEMPO
    purchaseDate: '',
    usefulLifeMonths: '',
    // ADICIONAL
    pricePerUnit: '',
    totalPieces: '',
  });

  const selectedCategory = inventoryCategories.find(c => c.id === selectedCategoryId);

  const resetForm = () => {
    setSelectedCategoryId('');
    setFormData({
      name: '',
      purchaseCost: '',
      weeklyUsageRate: '',
      piecesPerBox: '',
      totalContent: '',
      contentUnit: 'ml',
      estimatedUses: '',
      purchaseDate: '',
      usefulLifeMonths: '',
      pricePerUnit: '',
      totalPieces: '',
    });
  };

  const handleAddItem = () => {
    if (!formData.name || !selectedCategoryId || !formData.purchaseCost) {
      toast({
        title: "Campos requeridos",
        description: "Nombre, categoría y costo son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const category = inventoryCategories.find(c => c.id === selectedCategoryId);
    if (!category) return;

    let totalStock = 0;
    let unit = '';
    let totalApplications = 0;
    let minStock = 0;

    switch (category.wearType) {
      case 'POR_UNIDAD':
        totalStock = parseFloat(formData.piecesPerBox) || 100;
        unit = 'piezas';
        totalApplications = totalStock;
        minStock = totalStock * 0.2;
        break;
      case 'POR_VOLUMEN':
        totalStock = parseFloat(formData.totalContent) || 100;
        unit = formData.contentUnit;
        totalApplications = parseFloat(formData.estimatedUses) || 50;
        minStock = totalStock * 0.2;
        break;
      case 'POR_TIEMPO':
        totalStock = 1;
        unit = 'unidad';
        totalApplications = parseFloat(formData.usefulLifeMonths) || 12;
        minStock = 0;
        break;
      case 'ADICIONAL':
        totalStock = parseFloat(formData.totalPieces) || 100;
        unit = 'piezas';
        totalApplications = totalStock;
        minStock = totalStock * 0.1;
        break;
    }

    addInventoryItem({
      name: formData.name,
      categoryId: selectedCategoryId,
      category: category.name,
      totalStock,
      unit,
      minStock,
      purchaseCost: parseFloat(formData.purchaseCost),
      totalApplications,
      weeklyUsageRate: parseFloat(formData.weeklyUsageRate) || 10,
      // Specific fields
      piecesPerBox: parseFloat(formData.piecesPerBox) || undefined,
      costPerPiece: category.wearType === 'POR_UNIDAD' 
        ? parseFloat(formData.purchaseCost) / (parseFloat(formData.piecesPerBox) || 1) 
        : undefined,
      totalContent: parseFloat(formData.totalContent) || undefined,
      contentUnit: formData.contentUnit,
      estimatedUses: parseFloat(formData.estimatedUses) || undefined,
      purchaseDate: formData.purchaseDate || undefined,
      usefulLifeMonths: parseFloat(formData.usefulLifeMonths) || undefined,
      monthlyDepreciation: category.wearType === 'POR_TIEMPO'
        ? parseFloat(formData.purchaseCost) / (parseFloat(formData.usefulLifeMonths) || 12)
        : undefined,
      pricePerUnit: parseFloat(formData.pricePerUnit) || undefined,
    });

    setIsDialogOpen(false);
    resetForm();

    toast({
      title: "¡Producto agregado! 📦",
      description: `${formData.name} en ${category.name}`,
    });
  };

  // Calculate cost display based on category type
  const getCostDisplay = (item: InventoryItem, category?: InventoryCategory) => {
    if (!category) return `$${item.costPerUse.toFixed(2)}/uso`;
    
    switch (category.wearType) {
      case 'POR_UNIDAD':
        return `$${(item.costPerPiece || item.costPerUse).toFixed(2)}/pieza`;
      case 'POR_VOLUMEN':
        return `$${item.costPerUse.toFixed(2)}/uso`;
      case 'POR_TIEMPO':
        return `$${(item.monthlyDepreciation || item.costPerUse).toFixed(2)}/mes`;
      case 'ADICIONAL':
        return item.pricePerUnit ? `Cobrar $${item.pricePerUnit}/pieza` : `$${item.costPerUse.toFixed(2)}/uso`;
      default:
        return `$${item.costPerUse.toFixed(2)}/uso`;
    }
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

  // Group inventory by category
  const groupedInventory = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    
    inventoryCategories.forEach(cat => {
      groups[cat.id] = inventory.filter(item => item.categoryId === cat.id);
    });
    
    // Items without valid category
    const uncategorized = inventory.filter(item => 
      !inventoryCategories.find(c => c.id === item.categoryId)
    );
    if (uncategorized.length > 0) {
      groups['uncategorized'] = uncategorized;
    }
    
    return groups;
  }, [inventory, inventoryCategories]);

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

  // Dynamic form fields based on category type
  const renderCategorySpecificFields = () => {
    if (!selectedCategory) return null;

    switch (selectedCategory.wearType) {
      case 'POR_UNIDAD':
        return (
          <div className="p-4 rounded-xl bg-blue-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Box className="h-4 w-4 text-blue-500" />
              Consumible por Unidad
            </h4>
            <div>
              <Label>Piezas por Caja/Paquete</Label>
              <Input
                type="number"
                value={formData.piecesPerBox}
                onChange={(e) => setFormData({ ...formData, piecesPerBox: e.target.value })}
                placeholder="Ej. 100 guantes"
              />
            </div>
            {formData.purchaseCost && formData.piecesPerBox && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">Costo por pieza:</span>
                <span className="text-lg font-bold text-blue-500">
                  ${(parseFloat(formData.purchaseCost) / parseFloat(formData.piecesPerBox)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        );

      case 'POR_VOLUMEN':
        return (
          <div className="p-4 rounded-xl bg-purple-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Droplet className="h-4 w-4 text-purple-500" />
              Consumible por Volumen
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contenido Total</Label>
                <Input
                  type="number"
                  value={formData.totalContent}
                  onChange={(e) => setFormData({ ...formData, totalContent: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Select 
                  value={formData.contentUnit} 
                  onValueChange={(v) => setFormData({ ...formData, contentUnit: v as 'ml' | 'g' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ml (mililitros)</SelectItem>
                    <SelectItem value="g">g (gramos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Rendimiento Estimado (usos)</Label>
              <Input
                type="number"
                value={formData.estimatedUses}
                onChange={(e) => setFormData({ ...formData, estimatedUses: e.target.value })}
                placeholder="Ej. 100 aplicaciones"
              />
            </div>
            {formData.purchaseCost && formData.estimatedUses && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">Costo por uso (gota):</span>
                <span className="text-lg font-bold text-purple-500">
                  ${(parseFloat(formData.purchaseCost) / parseFloat(formData.estimatedUses)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        );

      case 'POR_TIEMPO':
        return (
          <div className="p-4 rounded-xl bg-amber-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Activo Fijo / Equipo
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Compra</Label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Vida Útil (Meses)</Label>
                <Input
                  type="number"
                  value={formData.usefulLifeMonths}
                  onChange={(e) => setFormData({ ...formData, usefulLifeMonths: e.target.value })}
                  placeholder="Ej. 12"
                />
              </div>
            </div>
            {formData.purchaseCost && formData.usefulLifeMonths && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">Depreciación mensual:</span>
                <span className="text-lg font-bold text-amber-500">
                  ${(parseFloat(formData.purchaseCost) / parseFloat(formData.usefulLifeMonths)).toFixed(2)}/mes
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              💡 Este costo se agrega a tus gastos fijos mensuales, no se descuenta por servicio.
            </p>
          </div>
        );

      case 'ADICIONAL':
        return (
          <div className="p-4 rounded-xl bg-rose-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-500" />
              Decoración y Arte
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Piezas Totales</Label>
                <Input
                  type="number"
                  value={formData.totalPieces}
                  onChange={(e) => setFormData({ ...formData, totalPieces: e.target.value })}
                  placeholder="Ej. 500 cristales"
                />
              </div>
              <div>
                <Label>Precio a Cobrar (por pieza)</Label>
                <Input
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  placeholder="Ej. $5"
                />
              </div>
            </div>
            {formData.purchaseCost && formData.totalPieces && formData.pricePerUnit && (
              <div className="space-y-2 p-3 rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Costo por pieza:</span>
                  <span className="font-medium">
                    ${(parseFloat(formData.purchaseCost) / parseFloat(formData.totalPieces)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ganancia por pieza:</span>
                  <span className="text-lg font-bold text-rose-500">
                    ${(parseFloat(formData.pricePerUnit) - (parseFloat(formData.purchaseCost) / parseFloat(formData.totalPieces))).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Inventario Inteligente
            </h1>
            <p className="text-muted-foreground mt-1">
              Productos organizados por categoría con cálculo automático de costos
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/gestion-categorias">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Categorías
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="shadow-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Step 1: Select Category */}
                  <div>
                    <Label className="text-base font-semibold">1. Selecciona la Categoría</Label>
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Elige una categoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{cat.icon}</span>
                              <span>{cat.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {wearTypeLabels[cat.wearType]}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCategory && (
                    <>
                      {/* Step 2: Basic Info */}
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">2. Información del Producto</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label>Nombre del Producto</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Ej. Monómero Acrílico"
                            />
                          </div>
                          <div>
                            <Label>Costo del Producto ($)</Label>
                            <Input
                              type="number"
                              value={formData.purchaseCost}
                              onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                              placeholder="500"
                            />
                          </div>
                          <div>
                            <Label>Usos por Semana</Label>
                            <Input
                              type="number"
                              value={formData.weeklyUsageRate}
                              onChange={(e) => setFormData({ ...formData, weeklyUsageRate: e.target.value })}
                              placeholder="20"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Category-specific fields */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">3. Detalles de {selectedCategory.name}</Label>
                        {renderCategorySpecificFields()}
                      </div>

                      <Button onClick={handleAddItem} className="w-full">
                        Agregar Producto
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Categorías</p>
              <p className="text-2xl font-bold text-primary">{inventoryCategories.length}</p>
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
              <p className="text-2xl font-bold text-accent">${avgCostPerUse.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory by Category (Accordion) */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle>Inventario por Categoría</CardTitle>
            <CardDescription>
              Cada categoría tiene su propia lógica de cálculo de costos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={inventoryCategories.map(c => c.id)} className="space-y-2">
              {inventoryCategories.map((category) => {
                const items = groupedInventory[category.id] || [];
                const criticalCount = items.filter(i => getStockStatus(i) === 'critical' || getStockStatus(i) === 'urgent').length;

                return (
                  <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center text-xl`}>
                          {category.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{category.name}</span>
                            <Badge variant="secondary">{items.length}</Badge>
                            {criticalCount > 0 && (
                              <Badge variant="destructive">{criticalCount} críticos</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {items.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No hay productos en esta categoría
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>Costo</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Días Restantes</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item) => {
                              const status = getStockStatus(item);
                              const percentage = (item.effectiveStock / item.totalStock) * 100;

                              return (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <p className="font-medium">{item.name}</p>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-primary">
                                      {getCostDisplay(item, category)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <span className="font-medium">
                                        {item.effectiveStock.toFixed(1)} {item.unit}
                                      </span>
                                      <Progress value={percentage} className="h-2 w-20" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className={`font-bold ${item.daysUntilEmpty <= 7 ? 'text-destructive' : ''}`}>
                                        {category.wearType === 'POR_TIEMPO' 
                                          ? `${item.usefulLifeMonths || 12} meses`
                                          : item.daysUntilEmpty > 99 ? '99+' : `${item.daysUntilEmpty} días`
                                        }
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
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Info className="h-4 w-4" />
          <span>
            Los costos se calculan automáticamente según el tipo de desgaste de cada categoría.
            <Link to="/gestion-categorias" className="text-primary ml-1 hover:underline">
              Configurar categorías →
            </Link>
          </span>
        </div>
      </div>
    </MainLayout>
  );
}

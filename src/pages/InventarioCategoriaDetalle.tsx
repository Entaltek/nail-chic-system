import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Package,
  SortAsc,
  SortDesc,
  Plus,
  Minus,
} from "lucide-react";
import { 
  useBusinessConfig, 
  InventoryItem, 
  SuperCategoryType,
  VisualStockStatus 
} from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { createMovement } from "@/services/inventoryService";

const superCategoryLabels: Record<SuperCategoryType, { label: string; emoji: string; description: string }> = {
  CONSUMIBLES_BASICOS: { label: 'Consumibles Básicos', emoji: '🔵', description: 'Stock exacto por pieza' },
  QUIMICOS_GELES: { label: 'Químicos y Geles', emoji: '🟣', description: 'Calculadora de gota' },
  DECORACION_CONTABLE: { label: 'Decoración Contable', emoji: '✨', description: 'Piezas de alto valor' },
  DECORACION_GRANEL: { label: 'Decoración a Granel', emoji: '🎨', description: 'Estado visual' },
  EQUIPO_HERRAMIENTAS: { label: 'Equipo y Herramientas', emoji: '🛠', description: 'Depreciación mensual' },
};

const visualStatusOptions: { value: VisualStockStatus; label: string; color: string }[] = [
  { value: 'lleno', label: '🟢 Lleno', color: 'bg-green-500' },
  { value: 'medio', label: '🟡 Medio', color: 'bg-yellow-500' },
  { value: 'bajo', label: '🔴 Bajo', color: 'bg-red-500' },
];

type SortField = 'name' | 'cost' | 'stock' | 'status';
type SortDirection = 'asc' | 'desc';

export default function InventarioCategoriaDetalle() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { inventory, inventoryCategories, updateInventoryItem, removeInventoryItem } = useBusinessConfig();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");

  // Find category - must be before all hooks complete
  const category = inventoryCategories.find(c => c.id === categoryId);
  const superCatInfo = category ? superCategoryLabels[category.superCategory] : null;
  const isGranel = category?.superCategory === 'DECORACION_GRANEL';

  const qtyNumber = Number(adjustQty);
  const isQtyValid = qtyNumber > 0;
  const isReasonRequired = qtyNumber >= 10;
  const isReasonValid = !isReasonRequired || adjustReason.trim().length > 0;

  const canSave = isQtyValid && isReasonValid;

  // Get status for different category types
  const getStockStatus = (item: InventoryItem) => {
    switch (item.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        if (!item.stockPieces || !item.minStockPieces) return 'ok';
        if (item.stockPieces <= item.minStockPieces) return 'critical';
        if (item.daysUntilEmpty && item.daysUntilEmpty <= 7) return 'urgent';
        if (item.daysUntilEmpty && item.daysUntilEmpty <= 14) return 'low';
        return 'ok';
      case 'QUIMICOS_GELES':
        if (!item.currentStock || !item.minStock) return 'ok';
        if (item.currentStock <= item.minStock) return 'critical';
        if (item.currentStock <= item.minStock * 1.5) return 'low';
        return 'ok';
      case 'DECORACION_GRANEL':
        if (item.visualStatus === 'bajo') return 'critical';
        if (item.visualStatus === 'medio') return 'low';
        return 'ok';
      case 'EQUIPO_HERRAMIENTAS':
        return 'ok';
      default:
        return 'ok';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Crítico</Badge>;
      case "urgent":
        return <Badge className="bg-orange-500/90 text-primary-foreground gap-1"><Clock className="h-3 w-3" />Urgente</Badge>;
      case "low":
        return <Badge className="bg-accent text-accent-foreground gap-1">Bajo</Badge>;
      default:
        return <Badge variant="secondary">OK</Badge>;
    }
  };

  const getCostDisplay = (item: InventoryItem) => {
    switch (item.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        return `$${(item.costPerPiece || 0).toFixed(2)}/pz`;
      case 'QUIMICOS_GELES':
        return `$${(item.costPerUse || 0).toFixed(2)}/uso`;
      case 'DECORACION_GRANEL':
        return `$${item.purchaseCost.toFixed(0)}`;
      case 'EQUIPO_HERRAMIENTAS':
        return `$${(item.monthlyDepreciation || 0).toFixed(0)}/mes`;
      default:
        return '-';
    }
  };

  const getStockDisplay = (item: InventoryItem) => {
    switch (item.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        return `${item.stockPieces || 0} pz`;
      case 'QUIMICOS_GELES':
        return `${item.currentStock || 0} ${item.contentUnit || 'ml'}`;
      case 'DECORACION_GRANEL':
        return item.visualStatus || '-';
      case 'EQUIPO_HERRAMIENTAS':
        return `${item.usefulLifeMonths || 0}m vida útil`;
      default:
        return '-';
    }
  };

  const getNumericStock = (item: InventoryItem): number => {
    switch (item.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        return item.stockPieces || 0;
      case 'QUIMICOS_GELES':
        return item.currentStock || 0;
      case 'DECORACION_GRANEL':
        return item.visualStatus === 'lleno' ? 100 : item.visualStatus === 'medio' ? 50 : 10;
      case 'EQUIPO_HERRAMIENTAS':
        return item.usefulLifeMonths || 0;
      default:
        return 0;
    }
  };

  const getNumericCost = (item: InventoryItem): number => {
    switch (item.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        return item.costPerPiece || 0;
      case 'QUIMICOS_GELES':
        return item.costPerUse || 0;
      case 'EQUIPO_HERRAMIENTAS':
        return item.monthlyDepreciation || 0;
      default:
        return item.purchaseCost || 0;
    }
  };

  const statusPriority: Record<string, number> = { critical: 0, urgent: 1, low: 2, ok: 3 };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = inventory.filter(item => item.categoryId === categoryId);
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      items = items.filter(item => getStockStatus(item) === statusFilter);
    }
    
    // Sort items
    items.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'cost':
          comparison = getNumericCost(a) - getNumericCost(b);
          break;
        case 'stock':
          comparison = getNumericStock(a) - getNumericStock(b);
          break;
        case 'status':
          comparison = statusPriority[getStockStatus(a)] - statusPriority[getStockStatus(b)];
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return items;
  }, [inventory, categoryId, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (item: InventoryItem) => {
    removeInventoryItem(item.id);
    toast({
      title: "Producto eliminado",
      description: `${item.name} ha sido eliminado del inventario`,
    });
  };

  const applyStockAdjustment = async () => {
    if (!adjustItem) return;

    const qty = Number(adjustQty);

    if (!qty || qty <= 0) {
      toast({
        title: "Cantidad inválida",
        description: "Ingresa una cantidad mayor a 0",
        variant: "destructive",
      });
      return;
    }

    // Si la cantidad es de dos cifras o más, exigir motivo
    if (qty >= 10 && !adjustReason.trim()) {
      toast({
        title: "Motivo requerido",
        description: "Debes ingresar una descripción para movimientos de 10 o más unidades",
        variant: "destructive",
      });
      return;
    }

    try {

      // Registrar movimiento (AQUÍ VA LO NUEVO)
      await createMovement({
        itemId: adjustItem.id,
        type: adjustType,
        quantity: qty,
        reason: adjustReason || undefined,
      });

      // Limpiar y cerrar modal
      setAdjustItem(null);
      setAdjustQty("");
      setAdjustReason("");
    } catch (error) {
      console.error(error);
      alert("Error al ajustar el stock");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />;
  };

  // Stats
  const totalItems = filteredItems.length;
  const criticalItems = filteredItems.filter(i => ['critical', 'urgent'].includes(getStockStatus(i))).length;
  const totalValue = filteredItems.reduce((sum, item) => sum + item.purchaseCost, 0);

  // Early return for not found - after all hooks
  if (!category || !superCatInfo) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Categoría no encontrada</h2>
          <Button onClick={() => navigate('/inventario')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inventario
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 animate-fade-in">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/inventario')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center text-lg`}>
                {category.icon}
              </div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
              <span>{superCatInfo.emoji}</span> {superCatInfo.label} • {superCatInfo.description}
            </p>
          </div>
          <Link to="/inventario">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="py-1.5 px-3">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-bold">{totalItems}</span> productos
          </Badge>
          {criticalItems > 0 && (
            <Badge variant="destructive" className="py-1.5 px-3">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              <span className="font-bold">{criticalItems}</span> críticos
            </Badge>
          )}
          <Badge variant="outline" className="py-1.5 px-3">
            Valor total: <span className="font-bold ml-1">${totalValue.toLocaleString()}</span>
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar material..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-9" 
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="critical">🔴 Crítico</SelectItem>
                    <SelectItem value="urgent">🟠 Urgente</SelectItem>
                    <SelectItem value="low">🟡 Bajo</SelectItem>
                    <SelectItem value="ok">🟢 OK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Material <SortIcon field="name" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => handleSort('cost')}
                  >
                    <div className="flex items-center justify-end">
                      Costo <SortIcon field="cost" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-center">
                      {isGranel ? 'Estado' : 'Stock'} <SortIcon field="stock" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center">
                      Estado <SortIcon field="status" />
                    </div>
                  </TableHead>

                  <TableHead className="text-center">Ajustar</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? 'No se encontraron materiales con estos filtros'
                        : 'No hay materiales en esta categoría'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const status = getStockStatus(item);

                    return (
                      <TableRow key={item.id} className="group">
                        {/* Material */}
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>

                        {/* Costo */}
                        <TableCell className="text-right font-semibold text-primary">
                          {getCostDisplay(item)}
                        </TableCell>

                        {/* Stock */}
                        <TableCell className="text-center">
                          {isGranel ? (
                            <Select
                              value={item.visualStatus}
                              onValueChange={(v) =>
                                updateInventoryItem(item.id, {
                                  visualStatus: v as VisualStockStatus,
                                })
                              }
                            >
                              <SelectTrigger className="w-24 h-8 mx-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {visualStatusOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground">
                              {getStockDisplay(item)}
                            </span>
                          )}
                        </TableCell>

                        {/* Estado */}
                        <TableCell className="text-center">
                          {getStatusBadge(status)}
                        </TableCell>

                        {/* Ajustar */}
                        <TableCell className="text-center">
                          {item.superCategory === 'CONSUMIBLES_BASICOS' ||
                          item.superCategory === 'DECORACION_CONTABLE' ||
                          item.superCategory === 'QUIMICOS_GELES' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAdjustItem(item)}
                            >
                              Ajustar
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        {/* Menú acciones */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Results count */}
        <p className="text-sm text-muted-foreground text-center">
          Mostrando {filteredItems.length} de {inventory.filter(i => i.categoryId === categoryId).length} materiales
        </p>
      </div>
      {adjustItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">
              Ajustar stock: {adjustItem.name}
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de movimiento</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adjustType === "IN" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setAdjustType("IN")}
                >
                  Entrada
                </Button>
                <Button
                  type="button"
                  variant={adjustType === "OUT" ? "destructive" : "outline"}
                  className="flex-1"
                  onClick={() => setAdjustType("OUT")}
                >
                  Salida
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="Cantidad"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <label className="text-sm font-medium">Motivo</label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Opcional (obligatorio si son 10 o más)"
              />
              {isReasonRequired && !adjustReason.trim() && (
                <p className="text-xs text-destructive">
                  Debes ingresar un motivo para cantidades de 10 o más.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setAdjustItem(null);
                  setAdjustQty("");
                  setAdjustReason("");
                  setAdjustType("IN");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={applyStockAdjustment}
                disabled={!canSave}
              >
                Guardar ajuste
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

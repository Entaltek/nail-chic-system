import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Package,
  Plus,
  AlertTriangle,
  Droplet,
  Clock,
  Info,
  Trash2,
  Box,
  Settings,
  Eye,
  Search,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  useBusinessConfig,
  InventoryItem,
  InventoryCategory,
  SuperCategoryType,
  VisualStockStatus,
  fetchCategories,
  getCalculationLogic
} from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { getInventory, createInventoryItem, deleteInventoryItemApi, updateInventoryItemApi, createMovement } from "@/services/inventoryService";
import { superCategoryService } from "@/services/superCategoryService";

const visualStatusOptions: { value: VisualStockStatus; label: string; color: string }[] = [
  { value: 'lleno', label: '🟢 Lleno', color: 'bg-green-500' },
  { value: 'medio', label: '🟡 Medio', color: 'bg-yellow-500' },
  { value: 'bajo', label: '🔴 Bajo', color: 'bg-red-500' },
];

const TOP_ITEMS_LIMIT = 5;

export default function Inventario2() {
  const navigate = useNavigate();
  const { 
    inventoryCategories, 
    setInventoryCategories, 
    superCategories,
    setSuperCategories,
    updateInventoryItem, 
    applyManualAdjustment 
  } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuperCategories, setSelectedSuperCategories] = useState<Set<SuperCategoryType>>(new Set());
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('out');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);


  // Dynamic form state based on category
  const [formData, setFormData] = useState({
    name: '',
    purchaseCost: '',
    stockPieces: '',
    minStockPieces: '',
    weeklyUsageRate: '',
    totalContent: '',
    contentUnit: 'ml' as 'ml' | 'g',
    estimatedUses: '',
    visualStatus: 'lleno' as VisualStockStatus,
    purchaseDate: '',
    usefulLifeMonths: '',
    customNote: '',
  });

  const selectedCategory = inventoryCategories.find(c => c.id === selectedCategoryId);

  // Toggle super category filter
  const toggleSuperCategoryFilter = (superCat: SuperCategoryType) => {
    setSelectedSuperCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(superCat)) {
        newSet.delete(superCat);
      } else {
        newSet.add(superCat);
      }
      return newSet;
    });
  };

  const loadInventory = async () => {
    setLoadingInventory(true);
    try {
      const data = await getInventory();
    } catch (err) {
      console.error(err);
      toast({ title: "Error cargando inventario", variant: "destructive" });
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoadingInventory(true);

        const data = await getInventory();

        setInventory(data);
      } catch (error) {
        console.error("Error cargando inventario:", error);
      } finally {
        setLoadingInventory(false);
      }
    };

    const loadCategories = async () => {
      try {
        const [categories, superCats] = await Promise.all([
          fetchCategories(),
          superCategoryService.getAll(),
        ]);
        setInventoryCategories(categories);
        setSuperCategories(superCats);
      } catch (error) {
        console.error("Error cargando categorías o súper categorías:", error);
        toast({ title: "Error cargando datos fijos", variant: "destructive" });
      }
    };

    loadInventory();
    loadCategories();
  }, [setInventoryCategories]);


  const clearFilters = () => {
    setSelectedSuperCategories(new Set());
    setSearchTerm('');
  };

  const resetForm = () => {
    setSelectedCategoryId('');
    setFormData({
      name: '',
      purchaseCost: '',
      stockPieces: '',
      minStockPieces: '',
      weeklyUsageRate: '',
      totalContent: '',
      contentUnit: 'ml',
      estimatedUses: '',
      visualStatus: 'lleno',
      purchaseDate: '',
      usefulLifeMonths: '',
      customNote: '',
    });
  };

  const openAdjustDialog = (item: InventoryItem) => {
    setAdjustItem(item);
    setAdjustAmount('');
    setAdjustReason('');
    setAdjustType('out');
  };

  const handleAddItem = async () => {
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

    const baseItem = {
      name: formData.name,
      categoryId: selectedCategoryId,
      category: category.name,
      superCategory: category.superCategory,
      purchaseCost: parseFloat(formData.purchaseCost),
    };

    let newItem: Omit<InventoryItem, 'id'>;

    const mType = category.measurementType;

    if (mType === 'PIECES') {
      const stockPieces = parseFloat(formData.stockPieces) || 100;
      const costPerPiece = parseFloat(formData.purchaseCost) / stockPieces;
      const weeklyUsage = parseFloat(formData.weeklyUsageRate) || 10;
      newItem = {
        ...baseItem,
        stockPieces,
        minStockPieces: parseFloat(formData.minStockPieces) || stockPieces * 0.2,
        costPerPiece,
        weeklyUsageRate: weeklyUsage,
        daysUntilEmpty: Math.floor((stockPieces / weeklyUsage) * 7),
      };
    } else if (mType === 'LIQUID') {
      const totalContent = parseFloat(formData.totalContent) || 100;
      const estimatedUses = parseFloat(formData.estimatedUses) || 50;
      newItem = {
        ...baseItem,
        totalContent,
        contentUnit: formData.contentUnit,
        currentStock: totalContent,
        minStock: totalContent * 0.2,
        estimatedUses,
        costPerUse: parseFloat(formData.purchaseCost) / estimatedUses,
      };
    } else if (mType === 'CUSTOM' || !mType) {
      newItem = {
        ...baseItem,
        customNote: formData.customNote || 'Sin notas adicionales',
      };
    } else {
      newItem = baseItem;
    }

    try {
      const response = await createInventoryItem(newItem);
      
      setInventory(prev => [...prev, response.data]);
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: "¡Producto agregado! 📦",
        description: `${formData.name} en ${category.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar producto",
        variant: "destructive",
      });
    }
  };

  // Get status for different category types
  const getStockStatus = (item: InventoryItem) => {
    const defaultLogic = getCalculationLogic(item.superCategory, superCategories);
    const category = inventoryCategories.find(c => c.id === item.categoryId);
    const mType = category?.measurementType;

    if (mType === 'PIECES' || (!mType && (defaultLogic === 'CONSUMIBLES_BASICOS' || defaultLogic === 'DECORACION_CONTABLE'))) {
      if (!item.stockPieces || !item.minStockPieces) return 'ok';
      if (item.stockPieces <= item.minStockPieces) return 'critical';
      if (item.daysUntilEmpty && item.daysUntilEmpty <= 7) return 'urgent';
      if (item.daysUntilEmpty && item.daysUntilEmpty <= 14) return 'low';
      return 'ok';
    }
    
    if (mType === 'LIQUID' || (!mType && defaultLogic === 'QUIMICOS_GELES')) {
      if (!item.currentStock || !item.minStock) return 'ok';
      if (item.currentStock <= item.minStock) return 'critical';
      if (item.currentStock <= item.minStock * 1.5) return 'low';
      return 'ok';
    }

    if (!mType && defaultLogic === 'DECORACION_GRANEL') {
      if (item.visualStatus === 'bajo') return 'critical';
      if (item.visualStatus === 'medio') return 'low';
      return 'ok';
    }

    return 'ok';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge variant="destructive" className="gap-1 text-xs"><AlertTriangle className="h-3 w-3" />Crítico</Badge>;
      case "urgent":
        return <Badge className="bg-orange-500 text-white gap-1 text-xs"><Clock className="h-3 w-3" />Urgente</Badge>;
      case "low":
        return <Badge className="bg-accent text-accent-foreground gap-1 text-xs">Bajo</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">OK</Badge>;
    }
  };

  const getCostDisplay = (item: InventoryItem) => {
    const defaultLogic = getCalculationLogic(item.superCategory, superCategories);
    const category = inventoryCategories.find(c => c.id === item.categoryId);
    const mType = category?.measurementType;

    if (mType === 'PIECES' || (!mType && (defaultLogic === 'CONSUMIBLES_BASICOS' || defaultLogic === 'DECORACION_CONTABLE'))) {
      return `$${(item.costPerPiece || 0).toFixed(2)}/pz`;
    }
    if (mType === 'LIQUID' || (!mType && defaultLogic === 'QUIMICOS_GELES')) {
      return `$${(item.costPerUse || 0).toFixed(2)}/uso`;
    }
    if (!mType && defaultLogic === 'EQUIPO_HERRAMIENTAS') {
      return `$${(item.monthlyDepreciation || 0).toFixed(0)}/mes`;
    }
    if (!mType && defaultLogic === 'DECORACION_GRANEL') {
      return `$${item.purchaseCost.toFixed(0)}`;
    }
    
    return '-';
  };

  const getStockDisplay = (item: InventoryItem) => {
    const defaultLogic = getCalculationLogic(item.superCategory, superCategories);
    const category = inventoryCategories.find(c => c.id === item.categoryId);
    const mType = category?.measurementType;

    if (mType === 'PIECES' || (!mType && (defaultLogic === 'CONSUMIBLES_BASICOS' || defaultLogic === 'DECORACION_CONTABLE'))) {
      return `${item.stockPieces || 0} pz`;
    }
    if (mType === 'LIQUID' || (!mType && defaultLogic === 'QUIMICOS_GELES')) {
      return `${item.currentStock || 0} ${item.contentUnit || 'ml'}`;
    }
    if (!mType && defaultLogic === 'DECORACION_GRANEL') {
      return item.visualStatus || '-';
    }
    if (!mType && defaultLogic === 'EQUIPO_HERRAMIENTAS') {
      return `${item.usefulLifeMonths || 0}m`;
    }
    
    return '-';
  };

  // Group inventory by category within super category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, { category: InventoryCategory; items: InventoryItem[] }> = {};

    inventoryCategories.forEach(cat => {
      let items = inventory.filter(item => item.categoryId === cat.id);

      // Apply search filter
      if (searchTerm) {
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by priority: critical first
      items.sort((a, b) => {
        const priorityOrder = { critical: 0, urgent: 1, low: 2, ok: 3 };
        const statusA = getStockStatus(a);
        const statusB = getStockStatus(b);
        return priorityOrder[statusA as keyof typeof priorityOrder] - priorityOrder[statusB as keyof typeof priorityOrder];
      });

      if (items.length > 0 || !searchTerm) {
        groups[cat.id] = { category: cat, items };
      }
    });

    return groups;
  }, [inventory, inventoryCategories, searchTerm]);

  // Group categories by super category
  const groupedBySuperCategory = useMemo(() => {
    const groups: Record<string, { category: InventoryCategory; items: InventoryItem[] }[]> = {};

    Object.values(groupedByCategory).forEach(({ category, items }) => {
      // Si la key no existe, la inicializa antes de hacer push
      if (!groups[category.superCategory]) {
        groups[category.superCategory] = [];
      }
      groups[category.superCategory].push({ category, items });
    });

    return groups;
  }, [groupedByCategory]);

  // Filter which super categories to show
  // ✅ Después — usa las keys que realmente existen en los datos
  const filteredSuperCategories = useMemo(() => {
    const availableKeys = Object.keys(groupedBySuperCategory);
    if (selectedSuperCategories.size === 0) {
      return availableKeys;
    }
    return Array.from(selectedSuperCategories).filter(k => availableKeys.includes(k));
  }, [selectedSuperCategories, groupedBySuperCategory]);

  const isAllSelected = selectedSuperCategories.size === 0;

  // Stats
  const totalItems = inventory.length;
  const criticalItems = inventory.filter((i) => {
    const status = getStockStatus(i);
    return status === 'critical' || status === 'urgent';
  }).length;

  // Render item row
  const renderItemRow = (item: InventoryItem) => {
    const status = getStockStatus(item);
    const isGranel = item.superCategory === 'DECORACION_GRANEL';

    return (
      <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-sm group">
        <span className="font-medium flex-1 truncate text-sm">{item.name}</span>
        <span className="text-primary font-semibold text-xs">{getCostDisplay(item)}</span>
        {isGranel ? (
          <Select
            value={item.visualStatus}
            onValueChange={(v) => updateInventoryItem(item.id, { visualStatus: v as VisualStockStatus })}
          >
            <SelectTrigger className="w-20 h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visualStatusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <>
            <span className="text-xs text-muted-foreground hidden sm:inline">{getStockDisplay(item)}</span>
            {getStatusBadge(status)}
          </>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              openAdjustDialog(item);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
                try {
                  await deleteInventoryItemApi(item.id);
                  setInventory(prev => prev.filter(i => i.id !== item.id));
                  toast({
                    title: "Eliminado",
                    description: "Producto eliminado correctamente.",
                  });
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Error al eliminar",
                    variant: "destructive"
                  });
                }
              }
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  // Dynamic form fields based on category type
  const renderCategorySpecificFields = () => {
    if (!selectedCategory) return null;

    const mType = selectedCategory.measurementType;
    const logic = getCalculationLogic(selectedCategory.superCategory, superCategories);

    if (mType === 'PIECES' || (!mType && (logic === 'CONSUMIBLES_BASICOS' || logic === 'DECORACION_CONTABLE'))) {
      return (
        <div className="p-4 rounded-xl bg-blue-500/10 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Box className="h-4 w-4 text-blue-500" />
            Stock por Pieza
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cantidad de Piezas</Label>
              <Input type="number" value={formData.stockPieces} onChange={(e) => setFormData({ ...formData, stockPieces: e.target.value })} placeholder="100" />
            </div>
            <div>
              <Label>Stock Mínimo</Label>
              <Input type="number" value={formData.minStockPieces} onChange={(e) => setFormData({ ...formData, minStockPieces: e.target.value })} placeholder="20" />
            </div>
          </div>
          <div>
            <Label>Uso semanal (piezas)</Label>
            <Input type="number" value={formData.weeklyUsageRate} onChange={(e) => setFormData({ ...formData, weeklyUsageRate: e.target.value })} placeholder="25" />
          </div>
          {formData.purchaseCost && formData.stockPieces && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-background">
              <span className="text-sm">Costo por pieza:</span>
              <span className="text-lg font-bold text-blue-600">${(parseFloat(formData.purchaseCost) / parseFloat(formData.stockPieces)).toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }
    
    if (mType === 'LIQUID' || (!mType && logic === 'QUIMICOS_GELES')) {
      return (
        <div className="p-4 rounded-xl bg-purple-500/10 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Droplet className="h-4 w-4 text-purple-600" />
            Calculadora de Gota
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contenido Total</Label>
              <Input type="number" value={formData.totalContent} onChange={(e) => setFormData({ ...formData, totalContent: e.target.value })} placeholder="500" />
            </div>
            <div>
              <Label>Unidad</Label>
              <Select value={formData.contentUnit} onValueChange={(v) => setFormData({ ...formData, contentUnit: v as 'ml' | 'g' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Rendimiento (usos)</Label>
            <Input type="number" value={formData.estimatedUses} onChange={(e) => setFormData({ ...formData, estimatedUses: e.target.value })} placeholder="100" />
          </div>
          {formData.purchaseCost && formData.estimatedUses && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-background">
              <span className="text-sm">Costo por uso:</span>
              <span className="text-lg font-bold text-purple-600">${(parseFloat(formData.purchaseCost) / parseFloat(formData.estimatedUses)).toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }
    
    if (mType === 'CUSTOM') {
      return (
        <div className="p-4 rounded-xl bg-amber-500/10 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Producto Especial
          </h4>
          <div>
            <Label>Descripción del producto especial</Label>
            <Input value={formData.customNote} onChange={(e) => setFormData({ ...formData, customNote: e.target.value })} placeholder="Anotaciones extra..." />
          </div>
        </div>
      );
    }

    // Existing DECORACION_GRANEL logic fallback
    if (!mType && logic === 'DECORACION_GRANEL') {
      return (
        <div className="p-4 rounded-xl bg-rose-500/10 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-rose-500" />
            Estado Visual
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {visualStatusOptions.map((option) => (
              <Button key={option.value} type="button" variant={formData.visualStatus === option.value ? 'default' : 'outline'} className={formData.visualStatus === option.value ? option.color : ''} onClick={() => setFormData({ ...formData, visualStatus: option.value })}>
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // Existing EQUIPO_HERRAMIENTAS logic fallback
    if (!mType && logic === 'EQUIPO_HERRAMIENTAS') {
      return (
        <div className="p-4 rounded-xl bg-amber-500/10 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Depreciación
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha Compra</Label>
              <Input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
            </div>
            <div>
              <Label>Vida Útil (Meses)</Label>
              <Input type="number" value={formData.usefulLifeMonths} onChange={(e) => setFormData({ ...formData, usefulLifeMonths: e.target.value })} placeholder="24" />
            </div>
          </div>
          {formData.purchaseCost && formData.usefulLifeMonths && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-background">
              <span className="text-sm">Depreciación mensual:</span>
              <span className="text-lg font-bold text-amber-600">${(parseFloat(formData.purchaseCost) / parseFloat(formData.usefulLifeMonths)).toFixed(2)}/mes</span>
            </div>
          )}
        </div>
      );
    }
    
    // No mType and no recognized fallback logic
    return (
      <div className="p-4 rounded-xl border border-dashed text-center">
        <p className="text-sm text-muted-foreground">
          Esta categoría no tiene tipo de medición configurado.<br/>
          Edítala en Gestión de Categorías para habilitar el formulario completo.
        </p>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Inventario Inteligente
            </h1>
            <p className="text-muted-foreground mt-1">
              Top 5 por categoría • Click para ver todos
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
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-base font-semibold">1. Categoría</Label>
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Elige categoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryCategories.length === 0 ? (
                          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                            No hay categorías registradas
                          </div>
                        ) : (
                          inventoryCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{cat.icon}</span>
                                <span>{cat.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCategory && (
                    <>
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">2. Producto</Label>
                        <div>
                          <Label>Nombre</Label>
                          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Monómero Acrílico" />
                        </div>
                        <div>
                          <Label>Costo ($)</Label>
                          <Input type="number" value={formData.purchaseCost} onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })} placeholder="500" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold">3. Detalles</Label>
                        {renderCategorySpecificFields()}
                      </div>

                      <Button onClick={handleAddItem} className="w-full">Agregar Producto</Button>
                    </>
                  )}
                </div>
              </DialogContent>
              <Dialog open={!!adjustItem} onOpenChange={(o) => !o && setAdjustItem(null)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ajuste manual de inventario</DialogTitle>
                  </DialogHeader>

                  {adjustItem && (
                    <div className="space-y-4">
                      <div className="text-sm">
                        <strong>{adjustItem.name}</strong>
                      </div>

                      {/* Tipo */}
                      <div className="flex gap-2">
                        <Button
                          variant={adjustType === 'in' ? 'default' : 'outline'}
                          onClick={() => setAdjustType('in')}
                          className="flex-1"
                        >
                          ➕ Entrada
                        </Button>
                        <Button
                          variant={adjustType === 'out' ? 'default' : 'outline'}
                          onClick={() => setAdjustType('out')}
                          className="flex-1"
                        >
                          ➖ Salida
                        </Button>
                      </div>

                      {/* Cantidad */}
                      {adjustItem.superCategory !== 'DECORACION_GRANEL' && (
                        <div>
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Motivo */}
                      <div>
                        <Label>Motivo</Label>
                        <Input
                          placeholder="Uso extra, merma, ajuste físico…"
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={async () => {
                          const qty = parseFloat(adjustAmount || '0');
                          if (!qty || qty <= 0) {
                            toast({ title: "Cantidad inválida", variant: "destructive" });
                            return;
                          }

                          try {
                            // 1. Registra el movimiento en el backend
                            await createMovement({
                              itemId: adjustItem.id,
                              type: adjustType === 'in' ? 'IN' : 'OUT',
                              quantity: qty,
                              reason: adjustReason || undefined,
                            });

                            // 2. Actualiza el estado local sin recargar todo
                            setInventory(prev => prev.map(item => {
                              if (item.id !== adjustItem.id) return item;
                              const delta = adjustType === 'in' ? qty : -qty;

                              if (item.stockPieces !== undefined) {
                                return { ...item, stockPieces: Math.max(0, (item.stockPieces || 0) + delta) };
                              }
                              if (item.currentStock !== undefined) {
                                return { ...item, currentStock: Math.max(0, (item.currentStock || 0) + delta) };
                              }
                              return item;
                            }));

                            toast({ title: "Ajuste aplicado ✅" });
                            setAdjustItem(null);
                            setAdjustAmount('');
                            setAdjustReason('');

                          } catch (error: any) {
                            toast({
                              title: "Error al ajustar",
                              description: error.message || "No se pudo registrar el movimiento",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Confirmar ajuste
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 animate-fade-in">
          <Badge variant="secondary" className="py-1.5 px-3 text-sm">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-bold">{totalItems}</span> productos
          </Badge>
          <Badge variant="secondary" className="py-1.5 px-3 text-sm">
            <span className="font-bold text-primary">{inventoryCategories.length}</span> categorías
          </Badge>
          {criticalItems > 0 && (
            <Badge variant="destructive" className="py-1.5 px-3 text-sm">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              <span className="font-bold">{criticalItems}</span> críticos
            </Badge>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 animate-fade-in">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={isAllSelected ? "default" : "outline"} className="py-1.5 px-3 cursor-pointer hover:bg-primary/90 transition-colors" onClick={clearFilters}>
              Todas
            </Badge>
            {superCategories.map((superCat) => {
              const info = superCat;
              const isSelected = selectedSuperCategories.has(superCat.id);

              // ✅ Agrega || [] para evitar undefined
              const count = (groupedBySuperCategory[superCat.id] || [])
                .reduce((sum, g) => sum + g.items.length, 0);

              return (
                <Badge
                  key={superCat.id}
                  variant={isSelected ? "default" : "outline"}
                  className="py-1.5 px-3 cursor-pointer hover:bg-primary/90 transition-colors gap-1"
                  onClick={() => toggleSuperCategoryFilter(superCat.id)}
                >
                  <span>{info.emoji}</span>
                  <span>{info.name}</span>
                  <span className="ml-1 opacity-70">({count})</span>
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Empty state or Cards Grid */}
        {inventory.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold">Aún no hay productos en el inventario</h3>
              <p className="text-sm text-muted-foreground">
                Agrega tu primer material para comenzar a controlar tu stock.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-4 ${isAllSelected ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {filteredSuperCategories.map((superCatId) => {
              const categoryGroups = groupedBySuperCategory[superCatId] || [];
              const info = superCategories.find(sc => sc.id === superCatId);
              
              if (!info) return null;

              return categoryGroups.map(({ category, items }) => {
                if (items.length === 0) return null;

                const topItems = items.slice(0, TOP_ITEMS_LIMIT);
                const remainingCount = Math.max(0, items.length - TOP_ITEMS_LIMIT);
                const criticalCount = items.filter(i => ['critical', 'urgent'].includes(getStockStatus(i))).length;

                return (
                  <Card
                    key={category.id}
                    className="shadow-card animate-fade-in overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/inventario/categoria/${category.id}`)}
                  >
                    <CardHeader className="py-2 px-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded ${category.color} flex items-center justify-center text-xs`}>
                          {category.icon}
                        </div>
                        <CardTitle className="text-sm flex-1">{category.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                        {criticalCount > 0 && <Badge variant="destructive" className="text-xs">{criticalCount}</Badge>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <CardDescription className="text-xs flex items-center gap-1">
                        <span>{info.emoji}</span> {info.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        {topItems.map((item) => renderItemRow(item))}
                      </div>

                      {remainingCount > 0 && (
                        <Button
                          variant="ghost"
                          className="w-full mt-2 text-xs h-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => { e.stopPropagation(); navigate(`/inventario/categoria/${category.id}`); }}
                        >
                          Ver {remainingCount} más
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              });
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Info className="h-4 w-4" />
          <span>
            Mostrando los 5 items más críticos por categoría.
            <Link to="/extras" className="text-primary ml-1 hover:underline">
              Ver precios de extras →
            </Link>
          </span>
        </div>
      </div>
    </MainLayout>
  );
}
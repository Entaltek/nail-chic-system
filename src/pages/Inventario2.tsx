import { useState, useMemo } from "react";
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
  Eye,
  CircleDot,
  Search,
} from "lucide-react";
import { 
  useBusinessConfig, 
  InventoryItem, 
  InventoryCategory, 
  SuperCategoryType,
  VisualStockStatus 
} from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const superCategoryLabels: Record<SuperCategoryType, { label: string; emoji: string }> = {
  CONSUMIBLES_BASICOS: { label: 'Consumibles Básicos', emoji: '🔵' },
  QUIMICOS_GELES: { label: 'Químicos y Geles', emoji: '🟣' },
  DECORACION_CONTABLE: { label: 'Decoración Contable', emoji: '✨' },
  DECORACION_GRANEL: { label: 'Decoración a Granel', emoji: '🎨' },
  EQUIPO_HERRAMIENTAS: { label: 'Equipo y Herramientas', emoji: '🛠' },
};

const visualStatusOptions: { value: VisualStockStatus; label: string; color: string }[] = [
  { value: 'lleno', label: '🟢 Lleno', color: 'bg-green-500' },
  { value: 'medio', label: '🟡 Medio', color: 'bg-yellow-500' },
  { value: 'bajo', label: '🔴 Bajo (Comprar)', color: 'bg-red-500' },
];

export default function Inventario2() {
  const { inventory, inventoryCategories, addInventoryItem, updateInventoryItem, removeInventoryItem } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuperCategories, setSelectedSuperCategories] = useState<Set<SuperCategoryType>>(new Set());
  
  // Dynamic form state based on category
  const [formData, setFormData] = useState({
    name: '',
    purchaseCost: '',
    // CONSUMIBLES_BASICOS & DECORACION_CONTABLE
    stockPieces: '',
    minStockPieces: '',
    weeklyUsageRate: '',
    // QUIMICOS_GELES
    totalContent: '',
    contentUnit: 'ml' as 'ml' | 'g',
    estimatedUses: '',
    // DECORACION_GRANEL
    visualStatus: 'lleno' as VisualStockStatus,
    // EQUIPO_HERRAMIENTAS
    purchaseDate: '',
    usefulLifeMonths: '',
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

    const baseItem = {
      name: formData.name,
      categoryId: selectedCategoryId,
      category: category.name,
      superCategory: category.superCategory,
      purchaseCost: parseFloat(formData.purchaseCost),
    };

    let newItem: Omit<InventoryItem, 'id'>;

    switch (category.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE': {
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
        break;
      }
      case 'QUIMICOS_GELES': {
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
        break;
      }
      case 'DECORACION_GRANEL':
        newItem = {
          ...baseItem,
          visualStatus: formData.visualStatus,
        };
        break;
      case 'EQUIPO_HERRAMIENTAS': {
        const usefulLifeMonths = parseFloat(formData.usefulLifeMonths) || 12;
        newItem = {
          ...baseItem,
          purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
          usefulLifeMonths,
          monthlyDepreciation: parseFloat(formData.purchaseCost) / usefulLifeMonths,
        };
        break;
      }
      default:
        newItem = baseItem;
    }

    addInventoryItem(newItem);
    setIsDialogOpen(false);
    resetForm();

    toast({
      title: "¡Producto agregado! 📦",
      description: `${formData.name} en ${category.name}`,
    });
  };

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
        return 'ok'; // Assets don't have stock alerts
      default:
        return 'ok';
    }
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

  // Get visual status badge for DECORACION_GRANEL
  const getVisualStatusBadge = (status: VisualStockStatus) => {
    switch (status) {
      case 'lleno':
        return <Badge className="bg-green-500 text-white gap-1"><CircleDot className="h-3 w-3" />Lleno</Badge>;
      case 'medio':
        return <Badge className="bg-yellow-500 text-white gap-1"><CircleDot className="h-3 w-3" />Medio</Badge>;
      case 'bajo':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />¡Comprar!</Badge>;
    }
  };

  // Get display info based on category type
  const getCostDisplay = (item: InventoryItem) => {
    switch (item.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        return `$${(item.costPerPiece || 0).toFixed(2)}/pieza`;
      case 'QUIMICOS_GELES':
        return `$${(item.costPerUse || 0).toFixed(2)}/uso`;
      case 'DECORACION_GRANEL':
        return `$${item.purchaseCost.toFixed(0)} total`;
      case 'EQUIPO_HERRAMIENTAS':
        return `$${(item.monthlyDepreciation || 0).toFixed(2)}/mes`;
      default:
        return '-';
    }
  };

  const getStockDisplay = (item: InventoryItem) => {
    switch (item.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        return `${item.stockPieces || 0} piezas`;
      case 'QUIMICOS_GELES':
        return `${item.currentStock || 0} ${item.contentUnit || 'ml'}`;
      case 'DECORACION_GRANEL':
        return '-';
      case 'EQUIPO_HERRAMIENTAS':
        return `${item.usefulLifeMonths || 0} meses vida útil`;
      default:
        return '-';
    }
  };

  // Group inventory by super category with filters
  const groupedBySuperCategory = useMemo(() => {
    const groups: Record<SuperCategoryType, { category: InventoryCategory; items: InventoryItem[] }[]> = {
      CONSUMIBLES_BASICOS: [],
      QUIMICOS_GELES: [],
      DECORACION_CONTABLE: [],
      DECORACION_GRANEL: [],
      EQUIPO_HERRAMIENTAS: [],
    };

    inventoryCategories.forEach(cat => {
      let items = inventory.filter(item => item.categoryId === cat.id);
      
      // Apply search filter
      if (searchTerm) {
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      groups[cat.superCategory].push({ category: cat, items });
    });

    return groups;
  }, [inventory, inventoryCategories, searchTerm]);

  // Filter which super categories to show
  const filteredGroups = useMemo(() => {
    if (selectedSuperCategories.size === 0) {
      return Object.entries(groupedBySuperCategory);
    }
    return Object.entries(groupedBySuperCategory).filter(([key]) => 
      selectedSuperCategories.has(key as SuperCategoryType)
    );
  }, [groupedBySuperCategory, selectedSuperCategories]);

  const isAllSelected = selectedSuperCategories.size === 0;

  // Stats
  const totalItems = inventory.length;
  const criticalItems = inventory.filter((i) => {
    const status = getStockStatus(i);
    return status === 'critical' || status === 'urgent';
  }).length;
  const lowGranelItems = inventory.filter(i => i.superCategory === 'DECORACION_GRANEL' && i.visualStatus === 'bajo').length;

  // Dynamic form fields based on category type
  const renderCategorySpecificFields = () => {
    if (!selectedCategory) return null;

    switch (selectedCategory.superCategory) {
      case 'CONSUMIBLES_BASICOS':
      case 'DECORACION_CONTABLE':
        return (
          <div className="p-4 rounded-xl bg-blue-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Box className="h-4 w-4 text-blue-500" />
              Stock por Pieza
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantidad de Piezas</Label>
                <Input
                  type="number"
                  value={formData.stockPieces}
                  onChange={(e) => setFormData({ ...formData, stockPieces: e.target.value })}
                  placeholder="Ej. 100"
                />
              </div>
              <div>
                <Label>Stock Mínimo</Label>
                <Input
                  type="number"
                  value={formData.minStockPieces}
                  onChange={(e) => setFormData({ ...formData, minStockPieces: e.target.value })}
                  placeholder="Ej. 20"
                />
              </div>
            </div>
            <div>
              <Label>Uso semanal (piezas)</Label>
              <Input
                type="number"
                value={formData.weeklyUsageRate}
                onChange={(e) => setFormData({ ...formData, weeklyUsageRate: e.target.value })}
                placeholder="Ej. 25"
              />
            </div>
            {formData.purchaseCost && formData.stockPieces && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">Costo por pieza:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${(parseFloat(formData.purchaseCost) / parseFloat(formData.stockPieces)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        );

      case 'QUIMICOS_GELES':
        return (
          <div className="p-4 rounded-xl bg-purple-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Droplet className="h-4 w-4 text-purple-600" />
              Calculadora de Gota
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
                <span className="text-lg font-bold text-purple-600">
                  ${(parseFloat(formData.purchaseCost) / parseFloat(formData.estimatedUses)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        );

      case 'DECORACION_GRANEL':
        return (
          <div className="p-4 rounded-xl bg-rose-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-rose-500" />
              Estado Visual (Semáforo)
            </h4>
            <p className="text-sm text-muted-foreground">
              No se cuenta por gramos. Solo indica visualmente cuánto queda.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {visualStatusOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.visualStatus === option.value ? 'default' : 'outline'}
                  className={formData.visualStatus === option.value ? option.color : ''}
                  onClick={() => setFormData({ ...formData, visualStatus: option.value })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'EQUIPO_HERRAMIENTAS':
        return (
          <div className="p-4 rounded-xl bg-amber-500/10 space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Depreciación Mensual
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
                  placeholder="Ej. 24"
                />
              </div>
            </div>
            {formData.purchaseCost && formData.usefulLifeMonths && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">Depreciación mensual:</span>
                <span className="text-lg font-bold text-amber-600">
                  ${(parseFloat(formData.purchaseCost) / parseFloat(formData.usefulLifeMonths)).toFixed(2)}/mes
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              💡 Este costo se agrega a tus gastos fijos mensuales
            </p>
          </div>
        );

      default:
        return null;
    }
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
              Productos organizados por tipo con cálculo automático de costos
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
                        {Object.entries(superCategoryLabels).map(([superCat, info]) => {
                          const cats = inventoryCategories.filter(c => c.superCategory === superCat);
                          if (cats.length === 0) return null;
                          return (
                            <div key={superCat}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                {info.emoji} {info.label}
                              </div>
                              {cats.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{cat.icon}</span>
                                    <span>{cat.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          );
                        })}
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
                          <div className="col-span-2">
                            <Label>Costo del Producto ($)</Label>
                            <Input
                              type="number"
                              value={formData.purchaseCost}
                              onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                              placeholder="500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Category-specific fields */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">3. Detalles según tipo</Label>
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

        {/* Stats Cards - Compact inline */}
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
          {lowGranelItems > 0 && (
            <Badge className="bg-amber-500 text-white py-1.5 px-3 text-sm">
              <span className="font-bold">{lowGranelItems}</span> granel bajo
            </Badge>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 animate-fade-in">
          {/* Search Input */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Super Category Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={isAllSelected ? "default" : "outline"} 
              className="py-1.5 px-3 cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={clearFilters}
            >
              Todas
            </Badge>
            {Object.entries(superCategoryLabels).map(([key, info]) => {
              const superCat = key as SuperCategoryType;
              const isSelected = selectedSuperCategories.has(superCat);
              const count = Object.values(groupedBySuperCategory[superCat] || [])
                .reduce((sum, g) => sum + g.items.length, 0);
              return (
                <Badge 
                  key={key} 
                  variant={isSelected ? "default" : "outline"} 
                  className="py-1.5 px-3 cursor-pointer hover:bg-primary/90 transition-colors gap-1"
                  onClick={() => toggleSuperCategoryFilter(superCat)}
                >
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                  <span className="ml-1 opacity-70">({count})</span>
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Inventory by Super Category - Dynamic columns */}
        <div className={`grid gap-4 ${isAllSelected ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredGroups.map(([superCat, categoryGroups]) => {
            const info = superCategoryLabels[superCat as SuperCategoryType];
            const totalItems = categoryGroups.reduce((sum, g) => sum + g.items.length, 0);
            
            if (totalItems === 0) return null;

            return (
              <Card key={superCat} className="shadow-card animate-fade-in overflow-hidden">
                <CardHeader className="py-2.5 px-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.emoji}</span>
                    <CardTitle className="text-sm">{info.label}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{totalItems}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <Accordion type="multiple" defaultValue={categoryGroups.map(g => g.category.id)} className="space-y-1">
                    {categoryGroups.map(({ category, items }) => {
                      if (items.length === 0) return null;
                      const criticalCount = items.filter(i => {
                        const status = getStockStatus(i);
                        return status === 'critical' || status === 'urgent';
                      }).length;

                      return (
                        <AccordionItem key={category.id} value={category.id} className="border rounded-md px-2">
                          <AccordionTrigger className="hover:no-underline py-2">
                            <div className="flex items-center gap-2 w-full">
                              <div className={`w-6 h-6 rounded ${category.color} flex items-center justify-center text-xs`}>
                                {category.icon}
                              </div>
                              <span className="font-medium text-sm">{category.name}</span>
                              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                              {criticalCount > 0 && (
                                <Badge variant="destructive" className="text-xs">{criticalCount}</Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-0 pb-2">
                            <div className="space-y-1">
                              {items.map((item) => {
                                const status = getStockStatus(item);
                                const isGranel = item.superCategory === 'DECORACION_GRANEL';
                                return (
                                  <div key={item.id} className="flex items-center gap-2 p-1.5 rounded bg-muted/30 text-sm">
                                    <span className="font-medium flex-1 truncate">{item.name}</span>
                                    <span className="text-primary font-semibold text-xs">{getCostDisplay(item)}</span>
                                    {isGranel ? (
                                      <Select
                                        value={item.visualStatus}
                                        onValueChange={(v) => updateInventoryItem(item.id, { visualStatus: v as VisualStockStatus })}
                                      >
                                        <SelectTrigger className="w-24 h-6 text-xs">
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
                                        <span className="text-xs text-muted-foreground">{getStockDisplay(item)}</span>
                                        {getStatusBadge(status)}
                                      </>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() => removeInventoryItem(item.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Info className="h-4 w-4" />
          <span>
            Cada tipo de producto tiene su propia lógica de cálculo. 
            <Link to="/extras" className="text-primary ml-1 hover:underline">
              Ver precios de extras →
            </Link>
          </span>
        </div>
      </div>
    </MainLayout>
  );
}

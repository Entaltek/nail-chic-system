import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Box,
  Droplet,
  Clock,
  Sparkles,
  Eye,
  Search,
  ChevronRight,
  Package,
} from "lucide-react";
import { useBusinessConfig, InventoryCategory, SuperCategoryType, fetchCategories } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

const superCategoryInfo: Record<SuperCategoryType, { label: string; description: string; icon: React.ReactNode; color: string; emoji: string }> = {
  CONSUMIBLES_BASICOS: {
    label: 'Consumibles Básicos',
    description: 'Stock exacto por pieza (Limas, Guantes, Tips)',
    icon: <Box className="h-4 w-4" />,
    color: 'bg-blue-500',
    emoji: '🔵',
  },
  QUIMICOS_GELES: {
    label: 'Químicos y Geles',
    description: 'Calculadora de gota - costo por ml/gr (Monómero, Gel)',
    icon: <Droplet className="h-4 w-4" />,
    color: 'bg-purple-500',
    emoji: '🟣',
  },
  DECORACION_CONTABLE: {
    label: 'Decoración Contable',
    description: 'Stock exacto por pieza (Charms, Cristales Grandes)',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'bg-pink-500',
    emoji: '✨',
  },
  DECORACION_GRANEL: {
    label: 'Decoración a Granel',
    description: 'Estado visual: Lleno/Medio/Bajo (Glitter, Efectos)',
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-rose-400',
    emoji: '🎨',
  },
  EQUIPO_HERRAMIENTAS: {
    label: 'Equipo y Herramientas',
    description: 'Depreciación mensual (Drill, Lámpara, Pinceles)',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-amber-500',
    emoji: '🛠',
  },
};

const colorOptions = [
  { value: 'bg-blue-500', label: 'Azul' },
  { value: 'bg-blue-400', label: 'Azul Claro' },
  { value: 'bg-blue-300', label: 'Azul Suave' },
  { value: 'bg-purple-500', label: 'Púrpura' },
  { value: 'bg-purple-400', label: 'Púrpura Claro' },
  { value: 'bg-purple-300', label: 'Púrpura Suave' },
  { value: 'bg-pink-500', label: 'Rosa' },
  { value: 'bg-rose-400', label: 'Rosa Intenso' },
  { value: 'bg-rose-300', label: 'Rosa Suave' },
  { value: 'bg-amber-500', label: 'Ámbar' },
  { value: 'bg-amber-400', label: 'Ámbar Claro' },
  { value: 'bg-teal-500', label: 'Verde Azulado' },
  { value: 'bg-emerald-500', label: 'Esmeralda' },
];

const iconOptions = ['🧤', '💅', '✨', '🦶', '🔧', '💎', '🎨', '💄', '🧴', '✂️', '🪥', '💫', '📏', '🧪', '💧', '🎀', '🌟', '🔌'];

const TOP_ITEMS_LIMIT = 5;

export default function GestionCategorias() {
  const {
    inventoryCategories,
    setInventoryCategories,
    addInventoryCategory,
    updateInventoryCategory,
    removeInventoryCategory,
    inventory
  } = useBusinessConfig();

  useEffect(() => {
    fetchCategories()
      .then(setInventoryCategories)
      .catch(() => {
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        });
      });
  }, [setInventoryCategories]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuperCategories, setSelectedSuperCategories] = useState<Set<SuperCategoryType>>(new Set());
  
  // Expanded super category modal
  const [expandedSuperCategory, setExpandedSuperCategory] = useState<SuperCategoryType | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    superCategory: 'QUIMICOS_GELES' as SuperCategoryType,
    description: '',
    color: 'bg-blue-500',
    icon: '📦',
  });

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
    setFormData({
      name: '',
      superCategory: 'QUIMICOS_GELES',
      description: '',
      color: 'bg-blue-500',
      icon: '📦',
    });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: InventoryCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        superCategory: category.superCategory,
        description: category.description,
        color: category.color,
        icon: category.icon,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      updateInventoryCategory(editingCategory.id, formData);
      toast({
        title: "Categoría actualizada",
        description: `${formData.name} ha sido actualizada`,
      });
    } else {
      addInventoryCategory(formData);
      toast({
        title: "Categoría creada",
        description: `${formData.name} ha sido agregada`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (category: InventoryCategory) => {
    const itemsInCategory = inventory.filter(item => item.categoryId === category.id);
    if (itemsInCategory.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: `Hay ${itemsInCategory.length} productos en esta categoría`,
        variant: "destructive",
      });
      return;
    }

    removeInventoryCategory(category.id);
    toast({
      title: "Categoría eliminada",
      description: `${category.name} ha sido eliminada`,
    });
  };

  const getItemCount = (categoryId: string) => {
    return inventory.filter(item => item.categoryId === categoryId).length;
  };

  // Group categories by super category with filters
  const groupedCategories = useMemo(() => {
    return Object.entries(superCategoryInfo).map(([key, info]) => {
      const superCat = key as SuperCategoryType;
      let categories = inventoryCategories.filter(c => c.superCategory === key);
      
      // Apply search filter
      if (searchTerm) {
        categories = categories.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return {
        superCategory: superCat,
        info,
        categories,
      };
    });
  }, [inventoryCategories, searchTerm]);

  // Filter which super categories to show
  const filteredGroups = useMemo(() => {
    if (selectedSuperCategories.size === 0) {
      return groupedCategories;
    }
    return groupedCategories.filter(g => selectedSuperCategories.has(g.superCategory));
  }, [groupedCategories, selectedSuperCategories]);

  const isAllSelected = selectedSuperCategories.size === 0;

  // Render category row
  const renderCategoryRow = (category: InventoryCategory, showActions = true) => {
    const itemCount = getItemCount(category.id);
    return (
      <div key={category.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
        <div className={`w-6 h-6 rounded ${category.color} flex items-center justify-center text-xs`}>
          {category.icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm truncate block">{category.name}</span>
          {category.description && (
            <span className="text-xs text-muted-foreground truncate block">{category.description}</span>
          )}
        </div>
        <Badge variant="secondary" className="text-xs gap-1">
          <Package className="h-3 w-3" />
          {itemCount}
        </Badge>
        {showActions && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleOpenDialog(category); }}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(category); }} disabled={itemCount > 0}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-primary" />
              Gestión de Categorías
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura cómo se calcula el desgaste de cada tipo de producto
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <Label>Nombre de la Categoría</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Químicos Acrílico"
                    />
                  </div>
                  <div>
                    <Label>Icono</Label>
                    <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            <span className="text-xl">{icon}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Super Categoría (Lógica de Cálculo)</Label>
                  <Select 
                    value={formData.superCategory} 
                    onValueChange={(v) => setFormData({ ...formData, superCategory: v as SuperCategoryType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(superCategoryInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{info.emoji}</span>
                            <span>{info.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {superCategoryInfo[formData.superCategory].description}
                  </p>
                </div>

                <div>
                  <Label>Color de Etiqueta</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${color.value}`} />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción de qué productos incluye"
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoría..."
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
            {Object.entries(superCategoryInfo).map(([key, info]) => {
              const superCat = key as SuperCategoryType;
              const isSelected = selectedSuperCategories.has(superCat);
              const count = inventoryCategories.filter(c => c.superCategory === key).length;
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

        {/* Categories by Super Category - Dynamic columns with Top 5 */}
        <div className={`grid gap-4 ${isAllSelected ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredGroups.map(({ superCategory, info, categories }) => {
            if (categories.length === 0) return null;
            
            const topCategories = categories.slice(0, TOP_ITEMS_LIMIT);
            const remainingCount = Math.max(0, categories.length - TOP_ITEMS_LIMIT);
            const totalProducts = categories.reduce((sum, c) => sum + getItemCount(c.id), 0);
            
            return (
              <Card 
                key={superCategory} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => categories.length > TOP_ITEMS_LIMIT && setExpandedSuperCategory(superCategory)}
              >
                <CardHeader className="py-2.5 px-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{info.emoji}</span>
                    <CardTitle className="text-sm flex-1">{info.label}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{categories.length}</Badge>
                    {categories.length > TOP_ITEMS_LIMIT && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {totalProducts} productos totales
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {topCategories.map((category) => renderCategoryRow(category))}
                  </div>
                  
                  {remainingCount > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-2 text-xs h-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); setExpandedSuperCategory(superCategory); }}
                    >
                      Ver {remainingCount} categorías más
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Expanded Super Category Modal */}
        <Dialog open={expandedSuperCategory !== null} onOpenChange={(open) => !open && setExpandedSuperCategory(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            {expandedSuperCategory && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-xl">{superCategoryInfo[expandedSuperCategory].emoji}</span>
                    {superCategoryInfo[expandedSuperCategory].label}
                    <Badge variant="secondary" className="ml-2">
                      {groupedCategories.find(g => g.superCategory === expandedSuperCategory)?.categories.length || 0} categorías
                    </Badge>
                  </DialogTitle>
                  <CardDescription>
                    {superCategoryInfo[expandedSuperCategory].description}
                  </CardDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-1.5">
                    {groupedCategories
                      .find(g => g.superCategory === expandedSuperCategory)
                      ?.categories.map((category) => renderCategoryRow(category))}
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
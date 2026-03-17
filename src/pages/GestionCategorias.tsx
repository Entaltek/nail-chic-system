import { useState, useMemo, useEffect } from "react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Search,
  ChevronRight,
  Package,
  Layers,
  Droplet,
  Star,
  Box,
} from "lucide-react";

import {
  useBusinessConfig,
  type InventoryCategory,
  type SuperCategory,
} from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { categoryService } from "@/services/categoryService";
import { superCategoryService } from "@/services/superCategoryService";
import { getInventory } from "@/services/inventoryService";
import { SuperCategoryFormDialog } from "@/components/categorias/SuperCategoryFormDialog";

const colorOptions = [
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-blue-400", label: "Azul Claro" },
  { value: "bg-purple-500", label: "Púrpura" },
  { value: "bg-purple-400", label: "Púrpura Claro" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-rose-400", label: "Rosa Intenso" },
  { value: "bg-amber-500", label: "Ámbar" },
  { value: "bg-teal-500", label: "Verde Azulado" },
  { value: "bg-emerald-500", label: "Esmeralda" },
];

const iconOptions = [
  "🧤", "💅", "✨", "🦶", "🔧", "💎", "🎨", "💄",
  "🧴", "✂️", "🪥", "💫", "📏", "🧪", "💧", "🎀", "🌟", "🔌",
];

const TOP_ITEMS_LIMIT = 5;

export default function GestionCategorias() {
  const {
    inventoryCategories,
    setInventoryCategories,
    addInventoryCategory,
    updateInventoryCategory,
    removeInventoryCategory,
    superCategories,
    setSuperCategories,
    addSuperCategory,
    updateSuperCategory,
    removeSuperCategory,
    inventory,
  } = useBusinessConfig();

  useEffect(() => {
    // Cargar categorías regulares
    categoryService
      .getAll()
      .then(setInventoryCategories)
      .catch((e) => {
        console.error(e);
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías desde la API",
          variant: "destructive",
        });
      });

    // Cargar Súper Categorías
    superCategoryService
      .getAll()
      .then(setSuperCategories)
      .catch((e) => {
        console.error(e);
        toast({
          title: "Error",
          description: "No se pudieron cargar las Súper Categorías desde la API",
          variant: "destructive",
        });
      });

    // Cargar Inventario
    getInventory()
      .then(setInventoryItems)
      .catch((e) => console.error("Error cargando inventario:", e));
  }, [setInventoryCategories, setSuperCategories]);

  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuperCategories, setSelectedSuperCategories] = useState<Set<string>>(new Set());

  // Super category form
  const [isSuperCatDialogOpen, setIsSuperCatDialogOpen] = useState(false);
  const [editingSuperCat, setEditingSuperCat] = useState<SuperCategory | null>(null);

  // Expanded super category modal
  const [expandedSuperCategory, setExpandedSuperCategory] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    superCategory: superCategories[0]?.id ?? "",
    measurementType: "CUSTOM" as "PIECES" | "LIQUID" | "CUSTOM",
    description: "",
    color: "bg-blue-500",
    icon: "📦",
  });

  const getItemCount = (categoryId: string) =>
    inventoryItems.filter((item: any) => item?.categoryId === categoryId).length;

  const isAllSelected = selectedSuperCategories.size === 0 && searchTerm.trim() === "";

  const groupedCategories = useMemo(() => {
    return superCategories.map((sc) => ({
      superCategory: sc,
      categories: inventoryCategories.filter((c) => c.superCategory === sc.id),
    }));
  }, [inventoryCategories, superCategories]);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return groupedCategories.map((g) => {
      let cats = g.categories;

      if (selectedSuperCategories.size > 0 && !selectedSuperCategories.has(g.superCategory.id)) {
        cats = [];
      }

      if (term) {
        cats = cats.filter((c) => {
          const name = (c.name ?? "").toLowerCase();
          const desc = (c.description ?? "").toLowerCase();
          return name.includes(term) || desc.includes(term);
        });
      }

      return { ...g, categories: cats };
    });
  }, [groupedCategories, searchTerm, selectedSuperCategories]);

  const toggleSuperCategoryFilter = (superCatId: string) => {
    setSelectedSuperCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(superCatId)) newSet.delete(superCatId);
      else newSet.add(superCatId);
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedSuperCategories(new Set());
    setSearchTerm("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      superCategory: superCategories[0]?.id ?? "",
      measurementType: "CUSTOM",
      description: "",
      color: "bg-blue-500",
      icon: "📦",
    });
    setEditingCategory(null);
  };

  const handleOpenCategoryDialog = (category?: InventoryCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        superCategory: category.superCategory,
        measurementType: category.measurementType || "CUSTOM",
        description: category.description,
        color: category.color,
        icon: category.icon,
      });
    } else {
      resetForm();
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }

    try {
      if (editingCategory) {
        await updateInventoryCategory(editingCategory.id, formData);
        toast({ title: "Categoría actualizada", description: `${formData.name} actualizada` });
      } else {
        await addInventoryCategory(formData);
        toast({ title: "Categoría creada", description: `${formData.name} agregada` });
      }
      setIsCategoryDialogOpen(false);
      resetForm();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (category: InventoryCategory) => {
    const itemsInCategory = inventory.filter((item: any) => item?.categoryId === category.id);
    if (itemsInCategory.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: `Hay ${itemsInCategory.length} productos en esta categoría`,
        variant: "destructive",
      });
      return;
    }

    try {
      await removeInventoryCategory(category.id);
      toast({ title: "Categoría eliminada", description: `${category.name} eliminada` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  const handleSaveSuperCategory = async (data: Omit<SuperCategory, "id">) => {
    try {
      if (editingSuperCat) {
        await updateSuperCategory(editingSuperCat.id, data);
        toast({ title: "Super categoría actualizada", description: `${data.name} actualizada` });
      } else {
        await addSuperCategory(data);
        toast({ title: "Super categoría creada", description: `${data.name} agregada` });
      }
      setEditingSuperCat(null);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo guardar la súper categoría", variant: "destructive" });
    }
  };

  const handleDeleteSuperCategory = async (sc: SuperCategory) => {
    const hasCategories = inventoryCategories.some((c) => c.superCategory === sc.id);
    if (hasCategories) {
      toast({
        title: "No se puede eliminar",
        description: "Tiene categorías asociadas. Muévelas o elimínalas primero.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await removeSuperCategory(sc.id);
      toast({ title: "Super categoría eliminada", description: `${sc.name} eliminada` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo eliminar la súper categoría", variant: "destructive" });
    }
  };

  const renderCategoryRow = (category: InventoryCategory, showActions = true) => {
    const itemCount = getItemCount(category.id);
    return (
      <div
        key={category.id}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group"
      >
        <div className={`w-6 h-6 rounded ${category.color} flex items-center justify-center text-xs`}>
          {typeof category.icon === "string" ? category.icon : "📦"}
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
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleOpenCategoryDialog(category); }}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category); }} disabled={itemCount > 0}>
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setEditingSuperCat(null); setIsSuperCatDialogOpen(true); }}
            >
              <Layers className="mr-2 h-4 w-4" />
              Nueva Super Categoría
            </Button>

            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={(open) => { setIsCategoryDialogOpen(open); if (!open) resetForm(); }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenCategoryDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Categoría
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
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
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon} value={icon}><span className="text-xl">{icon}</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Super Categoría</Label>
                    <Select
                      value={formData.superCategory}
                      onValueChange={(v) => setFormData({ ...formData, superCategory: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {superCategories.map((sc) => (
                          <SelectItem key={sc.id} value={sc.id}>
                            <div className="flex items-center gap-2">
                              <span>{sc.emoji}</span>
                              <span>{sc.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.superCategory && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {superCategories.find((sc) => sc.id === formData.superCategory)?.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Color de Etiqueta</Label>
                    <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Label className="mb-2 block">Tipo de Medición</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* PIECES */}
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          formData.measurementType === 'PIECES' 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, measurementType: 'PIECES' })}
                      >
                        <div className="flex items-center gap-2 font-medium mb-1">
                          <Box className="w-4 h-4 text-blue-500" />
                          Stock por Pieza
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">
                          Productos que se cuentan uno a uno
                        </p>
                      </div>
                      
                      {/* LIQUID */}
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          formData.measurementType === 'LIQUID' 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, measurementType: 'LIQUID' })}
                      >
                        <div className="flex items-center gap-2 font-medium mb-1">
                          <Droplet className="w-4 h-4 text-purple-500" />
                          Stock por Gota
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">
                          Líquidos y geles medidos por contenido
                        </p>
                      </div>
                      
                      {/* CUSTOM */}
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          formData.measurementType === 'CUSTOM' 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, measurementType: 'CUSTOM' })}
                      >
                        <div className="flex items-center gap-2 font-medium mb-1">
                          <Star className="w-4 h-4 text-amber-500" />
                          Especial
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">
                          Sin cálculo automático, solo anotaciones
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Descripción</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Breve descripción de qué productos incluye"
                    />
                  </div>

                  <Button onClick={handleSaveCategory} className="w-full">
                    {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={isAllSelected ? "default" : "outline"}
              className="py-1.5 px-3 cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={clearFilters}
            >
              Todas
            </Badge>

            {superCategories.map((sc) => {
              const isSelected = selectedSuperCategories.has(sc.id);
              const count = inventoryCategories.filter((c) => c.superCategory === sc.id).length;
              return (
                <Badge
                  key={sc.id}
                  variant={isSelected ? "default" : "outline"}
                  className="py-1.5 px-3 cursor-pointer hover:bg-primary/90 transition-colors gap-1"
                  onClick={() => toggleSuperCategoryFilter(sc.id)}
                >
                  <span>{sc.emoji}</span>
                  <span>{sc.name}</span>
                  <span className="ml-1 opacity-70">({count})</span>
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Super Categories Grid */}
        <div
          className={`grid gap-4 ${
            isAllSelected ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {filteredGroups.every((g) => g.categories.length === 0) &&
            superCategories.length > 0 &&
            searchTerm.trim() === "" &&
            selectedSuperCategories.size === 0 ? (
            // Show all super categories with empty states
            superCategories.map((sc) => {
              const cats = inventoryCategories.filter((c) => c.superCategory === sc.id);
              return (
                <Card key={sc.id} className="overflow-hidden">
                  <CardHeader className="py-2.5 px-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sc.emoji}</span>
                      <CardTitle className="text-sm flex-1">{sc.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingSuperCat(sc); setIsSuperCatDialogOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteSuperCategory(sc)} disabled={cats.length > 0}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs">{sc.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {cats.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">Sin categorías aún</p>
                        <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => {
                          setFormData((prev) => ({ ...prev, superCategory: sc.id }));
                          setIsCategoryDialogOpen(true);
                        }}>
                          <Plus className="mr-1 h-3 w-3" />
                          Agregar
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1">{cats.map((cat) => renderCategoryRow(cat))}</div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <>
              {filteredGroups.every((g) => g.categories.length === 0) && (
                <Card className="col-span-full border-dashed bg-muted/20 min-h-[180px]">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Search className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="font-semibold">No se encontraron categorías</h3>
                    <p className="text-sm text-muted-foreground">
                      Prueba limpiar los filtros o cambiar el término de búsqueda.
                    </p>
                    <Button variant="outline" className="mt-3" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  </CardContent>
                </Card>
              )}

              {filteredGroups.map(({ superCategory: sc, categories }) => {
                if (categories.length === 0 && (searchTerm.trim() || selectedSuperCategories.size > 0)) return null;

                const allCatsForSc = inventoryCategories.filter((c) => c.superCategory === sc.id);
                const catsToShow = categories.length > 0 ? categories : allCatsForSc;
                const topCategories = catsToShow.slice(0, TOP_ITEMS_LIMIT);
                const remainingCount = Math.max(0, catsToShow.length - TOP_ITEMS_LIMIT);
                const totalProducts = catsToShow.reduce((sum, c) => sum + getItemCount(c.id), 0);

                return (
                  <Card
                    key={sc.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => catsToShow.length > TOP_ITEMS_LIMIT && setExpandedSuperCategory(sc.id)}
                  >
                    <CardHeader className="py-2.5 px-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{sc.emoji}</span>
                        <CardTitle className="text-sm flex-1">{sc.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">{catsToShow.length}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingSuperCat(sc); setIsSuperCatDialogOpen(true); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteSuperCategory(sc); }} disabled={allCatsForSc.length > 0}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          {catsToShow.length > TOP_ITEMS_LIMIT && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <CardDescription className="text-xs">{totalProducts} productos totales</CardDescription>
                    </CardHeader>

                    <CardContent className="p-2">
                      {catsToShow.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                          <p className="text-xs text-muted-foreground">Sin categorías aún</p>
                          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={(e) => {
                            e.stopPropagation();
                            setFormData((prev) => ({ ...prev, superCategory: sc.id }));
                            setIsCategoryDialogOpen(true);
                          }}>
                            <Plus className="mr-1 h-3 w-3" />
                            Agregar
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">{topCategories.map((cat) => renderCategoryRow(cat))}</div>
                          {remainingCount > 0 && (
                            <Button
                              variant="ghost"
                              className="w-full mt-2 text-xs h-8 text-muted-foreground hover:text-foreground"
                              onClick={(e) => { e.stopPropagation(); setExpandedSuperCategory(sc.id); }}
                            >
                              Ver {remainingCount} categorías más
                            </Button>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>

        {/* No super categories at all */}
        {superCategories.length === 0 && (
          <Card className="border-dashed border-2 bg-muted/20 mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aún no tienes super categorías</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Crea super categorías para organizar tus categorías de inventario.
              </p>
              <Button className="mt-4" onClick={() => { setEditingSuperCat(null); setIsSuperCatDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primera super categoría
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Expanded Super Category Modal */}
        <Dialog open={expandedSuperCategory !== null} onOpenChange={(open) => !open && setExpandedSuperCategory(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            {expandedSuperCategory && (() => {
              const sc = superCategories.find((s) => s.id === expandedSuperCategory);
              const cats = inventoryCategories.filter((c) => c.superCategory === expandedSuperCategory);
              if (!sc) return null;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-xl">{sc.emoji}</span>
                      {sc.name}
                      <Badge variant="secondary" className="ml-2">{cats.length} categorías</Badge>
                    </DialogTitle>
                    <CardDescription>{sc.description}</CardDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-1.5">
                      {cats.map((category) => renderCategoryRow(category))}
                    </div>
                  </ScrollArea>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Super Category Form Dialog */}
        <SuperCategoryFormDialog
          open={isSuperCatDialogOpen}
          onOpenChange={setIsSuperCatDialogOpen}
          editing={editingSuperCat}
          onSave={handleSaveSuperCategory}
        />
      </div>
    </MainLayout>
  );
}

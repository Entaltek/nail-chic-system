import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Box,
  Droplet,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { useBusinessConfig, InventoryCategory, WearType } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

const wearTypeInfo: Record<WearType, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  POR_UNIDAD: {
    label: 'Por Unidad',
    description: 'Se descuenta 1 pieza entera (ej. Limas, Guantes)',
    icon: <Box className="h-4 w-4" />,
    color: 'bg-blue-500',
  },
  POR_VOLUMEN: {
    label: 'Por Volumen',
    description: 'Se descuenta por ml/gr (ej. Monómero, Gel)',
    icon: <Droplet className="h-4 w-4" />,
    color: 'bg-purple-500',
  },
  POR_TIEMPO: {
    label: 'Por Tiempo',
    description: 'No se descuenta, se deprecia (ej. Lámpara UV)',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-amber-500',
  },
  ADICIONAL: {
    label: 'Adicional',
    description: 'Costo directo al ticket, no gestiona stock estricto (ej. Stickers, Arte)',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'bg-rose-500',
  },
};

const colorOptions = [
  { value: 'bg-blue-500', label: 'Azul' },
  { value: 'bg-pink-500', label: 'Rosa' },
  { value: 'bg-purple-500', label: 'Púrpura' },
  { value: 'bg-teal-500', label: 'Verde Azulado' },
  { value: 'bg-amber-500', label: 'Ámbar' },
  { value: 'bg-rose-500', label: 'Rosa Intenso' },
  { value: 'bg-emerald-500', label: 'Esmeralda' },
  { value: 'bg-indigo-500', label: 'Índigo' },
];

const iconOptions = ['🧤', '💅', '✨', '🦶', '🔧', '💎', '🎨', '💄', '🧴', '✂️', '🪥', '💫'];

export default function GestionCategorias() {
  const { inventoryCategories, addInventoryCategory, updateInventoryCategory, removeInventoryCategory, inventory } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    wearType: 'POR_VOLUMEN' as WearType,
    description: '',
    color: 'bg-blue-500',
    icon: '📦',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      wearType: 'POR_VOLUMEN',
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
        wearType: category.wearType,
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

  return (
    <MainLayout>
      <div className="space-y-6">
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
                  <Label>Tipo de Desgaste</Label>
                  <Select 
                    value={formData.wearType} 
                    onValueChange={(v) => setFormData({ ...formData, wearType: v as WearType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(wearTypeInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {info.icon}
                            <span>{info.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {wearTypeInfo[formData.wearType].description}
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

        {/* Wear Type Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Tipos de Desgaste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(wearTypeInfo).map(([key, info]) => (
                <div key={key} className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${info.color} text-white`}>
                      {info.icon}
                    </div>
                    <span className="font-medium">{info.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Categorías Configuradas</CardTitle>
            <CardDescription>
              Los productos heredan su lógica de cálculo de la categoría asignada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo de Desgaste</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center">Productos</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryCategories.map((category) => {
                  const wearInfo = wearTypeInfo[category.wearType];
                  const itemCount = getItemCount(category.id);

                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center text-xl`}>
                            {category.icon}
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {wearInfo.icon}
                          {wearInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {category.description}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{itemCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(category)}
                            disabled={itemCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

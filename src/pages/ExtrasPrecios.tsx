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
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Clock,
  DollarSign,
  Info,
  Palette,
  Gem,
  Wand2,
  Package,
} from "lucide-react";
import { useBusinessConfig, ExtraItem, ExtraType } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const categoryOptions = [
  'Técnicas',
  'Efectos',
  'Arte',
  'Decoración',
  'Tratamientos',
  'Otros',
];

const extraTypeInfo: Record<ExtraType, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  TECNICA: {
    label: 'Técnica',
    description: 'Solo agrega precio y tiempo. NO resta inventario.',
    icon: <Palette className="h-4 w-4" />,
    color: 'bg-purple-500',
  },
  APLICACION: {
    label: 'Aplicación',
    description: 'Puede vincular a un producto del inventario.',
    icon: <Gem className="h-4 w-4" />,
    color: 'bg-pink-500',
  },
};

export default function ExtrasPrecios() {
  const { extras, inventory, addExtra, updateExtra, removeExtra } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'TECNICA' as ExtraType,
    category: 'Técnicas',
    basePrice: '',
    extraMinutes: '',
    description: '',
    linkedInventoryId: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'TECNICA',
      category: 'Técnicas',
      basePrice: '',
      extraMinutes: '',
      description: '',
      linkedInventoryId: '',
    });
    setEditingExtra(null);
  };

  const handleOpenDialog = (extra?: ExtraItem) => {
    if (extra) {
      setEditingExtra(extra);
      setFormData({
        name: extra.name,
        type: extra.type,
        category: extra.category,
        basePrice: extra.basePrice.toString(),
        extraMinutes: extra.extraMinutes.toString(),
        description: extra.description || '',
        linkedInventoryId: extra.linkedInventoryId || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.basePrice) {
      toast({
        title: "Error",
        description: "Nombre y precio son requeridos",
        variant: "destructive",
      });
      return;
    }

    const linkedItem = formData.linkedInventoryId 
      ? inventory.find(i => i.id === formData.linkedInventoryId)
      : undefined;

    const extraData = {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      basePrice: parseFloat(formData.basePrice),
      extraMinutes: parseFloat(formData.extraMinutes) || 0,
      description: formData.description,
      linkedInventoryId: formData.linkedInventoryId || undefined,
      linkedInventoryName: linkedItem?.name || undefined,
    };

    if (editingExtra) {
      updateExtra(editingExtra.id, extraData);
      toast({
        title: "Extra actualizado",
        description: `${formData.name} ha sido actualizado`,
      });
    } else {
      addExtra(extraData);
      toast({
        title: "Extra creado",
        description: `${formData.name} ha sido agregado`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (extra: ExtraItem) => {
    removeExtra(extra.id);
    toast({
      title: "Extra eliminado",
      description: `${extra.name} ha sido eliminado`,
    });
  };

  // Separate by type first, then group by category
  const tecnicaExtras = extras.filter(e => e.type === 'TECNICA');
  const aplicacionExtras = extras.filter(e => e.type === 'APLICACION');

  const groupedTecnicas = categoryOptions.map(cat => ({
    category: cat,
    items: tecnicaExtras.filter(e => e.category === cat),
  })).filter(g => g.items.length > 0);

  const groupedAplicaciones = categoryOptions.map(cat => ({
    category: cat,
    items: aplicacionExtras.filter(e => e.category === cat),
  })).filter(g => g.items.length > 0);

  // Stats
  const totalExtras = extras.length;
  const avgPrice = extras.length > 0 
    ? extras.reduce((sum, e) => sum + e.basePrice, 0) / extras.length 
    : 0;
  const totalExtraMinutes = extras.reduce((sum, e) => sum + e.extraMinutes, 0);

  // Linkable inventory items (DECORACION_CONTABLE mainly)
  const linkableInventory = inventory.filter(i => 
    i.superCategory === 'DECORACION_CONTABLE' || 
    i.superCategory === 'DECORACION_GRANEL'
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Wand2 className="h-8 w-8 text-primary" />
              Catálogo de Adicionales
            </h1>
            <p className="text-muted-foreground mt-1">
              Técnicas y decoraciones que suman al servicio base
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Adicional
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExtra ? 'Editar Adicional' : 'Nuevo Adicional'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Type Selection */}
                <div>
                  <Label>Tipo de Adicional</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(extraTypeInfo).map(([key, info]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={formData.type === key ? 'default' : 'outline'}
                        className={`justify-start gap-2 h-auto py-3 ${formData.type === key ? info.color : ''}`}
                        onClick={() => setFormData({ ...formData, type: key as ExtraType, linkedInventoryId: '' })}
                      >
                        {info.icon}
                        <div className="text-left">
                          <p className="font-medium">{info.label}</p>
                          <p className="text-xs opacity-80 font-normal">{info.description}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Nombre del Adicional</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Francés Baby Boomer"
                  />
                </div>

                <div>
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio Base ($)</Label>
                    <Input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <Label>Tiempo Extra (min)</Label>
                    <Input
                      type="number"
                      value={formData.extraMinutes}
                      onChange={(e) => setFormData({ ...formData, extraMinutes: e.target.value })}
                      placeholder="15"
                    />
                  </div>
                </div>

                {/* Link to inventory for APLICACION type */}
                {formData.type === 'APLICACION' && linkableInventory.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      Vincular a Inventario (opcional)
                    </Label>
                    <Select 
                      value={formData.linkedInventoryId} 
                      onValueChange={(v) => setFormData({ ...formData, linkedInventoryId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin vincular</SelectItem>
                        {linkableInventory.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} (${item.costPerPiece?.toFixed(2) || item.purchaseCost})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Al vincular, el costo del producto se suma automáticamente
                    </p>
                  </div>
                )}

                <div>
                  <Label>Descripción (opcional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción"
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editingExtra ? 'Guardar Cambios' : 'Agregar Adicional'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card - Important distinction */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">¿Cuál es la diferencia?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-purple-500 text-white shrink-0">Técnica</Badge>
                    <p className="text-sm text-muted-foreground">
                      Solo suma <strong>precio y tiempo</strong> al ticket. NO afecta inventario.
                      <span className="block text-xs mt-1">Ej: Francés, Encapsulado, Mano Alzada</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-pink-500 text-white shrink-0">Aplicación</Badge>
                    <p className="text-sm text-muted-foreground">
                      Puede <strong>vincular a inventario</strong> para restar stock automático.
                      <span className="block text-xs mt-1">Ej: Cristales, Charms, Foil</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Adicionales</p>
              <p className="text-2xl font-bold text-foreground">{totalExtras}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Técnicas</p>
              <p className="text-2xl font-bold text-purple-500">{tecnicaExtras.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Aplicaciones</p>
              <p className="text-2xl font-bold text-pink-500">{aplicacionExtras.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Precio Promedio</p>
              <p className="text-2xl font-bold text-primary">${avgPrice.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* TÉCNICAS Section */}
        {groupedTecnicas.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500 text-white gap-1">
                <Palette className="h-3 w-3" />
                Técnicas
              </Badge>
              <span className="text-sm text-muted-foreground">
                Solo tiempo y precio, sin inventario
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {groupedTecnicas.map(({ category, items }) => (
                <Card key={category} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{category}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {items.map((extra) => (
                        <div key={extra.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
                          <span className="font-medium text-sm flex-1">{extra.name}</span>
                          <Badge variant="outline" className="text-primary font-bold text-xs">
                            ${extra.basePrice}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            +{extra.extraMinutes}min
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDialog(extra)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(extra)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* APLICACIONES Section */}
        {groupedAplicaciones.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-500 text-white gap-1">
                <Gem className="h-3 w-3" />
                Aplicaciones
              </Badge>
              <span className="text-sm text-muted-foreground">
                Pueden vincular a inventario
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {groupedAplicaciones.map(({ category, items }) => (
                <Card key={category} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{category}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {items.map((extra) => (
                        <div key={extra.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
                          <span className="font-medium text-sm flex-1">{extra.name}</span>
                          {extra.linkedInventoryName && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Package className="h-3 w-3" />
                              {extra.linkedInventoryName}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-primary font-bold text-xs">
                            ${extra.basePrice}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            +{extra.extraMinutes}min
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDialog(extra)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(extra)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {extras.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay adicionales configurados. ¡Agrega tu primer extra!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Link to inventory */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>
            Los adicionales tipo "Aplicación" pueden vincularse a productos del 
            <Link to="/inventario" className="text-primary ml-1 hover:underline">
              Inventario →
            </Link>
          </span>
        </div>
      </div>
    </MainLayout>
  );
}
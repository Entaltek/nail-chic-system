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
} from "lucide-react";
import { useBusinessConfig, ExtraItem } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

const categoryOptions = [
  'Técnicas',
  'Efectos',
  'Arte',
  'Decoración',
  'Tratamientos',
  'Otros',
];

export default function ExtrasPrecios() {
  const { extras, addExtra, updateExtra, removeExtra } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Técnicas',
    basePrice: '',
    extraMinutes: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Técnicas',
      basePrice: '',
      extraMinutes: '',
      description: '',
    });
    setEditingExtra(null);
  };

  const handleOpenDialog = (extra?: ExtraItem) => {
    if (extra) {
      setEditingExtra(extra);
      setFormData({
        name: extra.name,
        category: extra.category,
        basePrice: extra.basePrice.toString(),
        extraMinutes: extra.extraMinutes.toString(),
        description: extra.description || '',
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

    const extraData = {
      name: formData.name,
      type: 'TECNICA' as const,
      category: formData.category,
      basePrice: parseFloat(formData.basePrice),
      extraMinutes: parseFloat(formData.extraMinutes) || 0,
      description: formData.description,
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

  // Group extras by category
  const groupedExtras = categoryOptions.map(cat => ({
    category: cat,
    items: extras.filter(e => e.category === cat),
  })).filter(g => g.items.length > 0);

  // Stats
  const totalExtras = extras.length;
  const avgPrice = extras.length > 0 
    ? extras.reduce((sum, e) => sum + e.basePrice, 0) / extras.length 
    : 0;
  const totalExtraMinutes = extras.reduce((sum, e) => sum + e.extraMinutes, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Precios de Extras y Arte
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura precios de técnicas y decoraciones (no gestiona stock)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Extra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExtra ? 'Editar Extra' : 'Nuevo Extra'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nombre del Extra</Label>
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

                <div>
                  <Label>Descripción (opcional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción"
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editingExtra ? 'Guardar Cambios' : 'Agregar Extra'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">¿Qué son los Extras?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Son técnicas, efectos o decoraciones que sumas al servicio base. 
                  <strong> No restan inventario</strong> — solo agregan precio y tiempo al ticket.
                  Ejemplos: Francés, Encapsulado, Efecto Espejo, Nail Art.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Extras</p>
              <p className="text-2xl font-bold text-foreground">{totalExtras}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Precio Promedio</p>
              <p className="text-2xl font-bold text-primary">${avgPrice.toFixed(0)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tiempo Extra Total</p>
              <p className="text-2xl font-bold text-amber-500">{totalExtraMinutes} min</p>
            </CardContent>
          </Card>
        </div>

        {/* Extras by Category */}
        {groupedExtras.map(({ category, items }) => (
          <Card key={category} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{category}</CardTitle>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Precio
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4" />
                        Tiempo
                      </div>
                    </TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((extra) => (
                    <TableRow key={extra.id}>
                      <TableCell className="font-medium">{extra.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-primary font-bold">
                          ${extra.basePrice}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-muted-foreground">+{extra.extraMinutes} min</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {extra.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(extra)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(extra)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {extras.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay extras configurados. ¡Agrega tu primer extra!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

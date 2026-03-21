import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Info,
  Palette,
  Gem,
  Wand2,
  Package,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAdicionales } from "@/hooks/useAdicionales";

const extraTypeInfo = {
  tecnica: {
    label: 'Técnica',
    description: 'Solo agrega precio y tiempo. NO resta inventario.',
    icon: <Palette className="h-4 w-4" />,
    color: 'bg-purple-500',
  },
  aplicacion: {
    label: 'Aplicación',
    description: 'Puede vincular a múltiples productos de inventario.',
    icon: <Gem className="h-4 w-4" />,
    color: 'bg-pink-500',
  },
};

export default function ExtrasPrecios() {
  const {
    data,
    inventario,
    loading,
    loadingInv,
    fetchAdicionales,
    fetchInventario,
    addAdicional,
    updateAdicional,
    removeAdicional
  } = useAdicionales();

  useEffect(() => {
    fetchAdicionales();
  }, [fetchAdicionales]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'tecnica' as 'tecnica' | 'aplicacion',
    precio_base: '',
    tiempo_extra_min: '',
    descripcion: '',
  });

  // Ingredientes State
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadInput, setCantidadInput] = useState(1);
  const [ingredientes, setIngredientes] = useState<{
    producto_id: string;
    nombre: string;
    cantidad: number;
    costo_unitario: number;
    unidad: string;
  }[]>([]);

  const resetForm = () => {
    setForm({
      nombre: '',
      tipo: 'tecnica',
      precio_base: '',
      tiempo_extra_min: '',
      descripcion: '',
    });
    setIngredientes([]);
    setProductoSeleccionado('');
    setCantidadInput(1);
    setEditingExtraId(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      if (form.tipo === 'aplicacion' && inventario.length === 0) fetchInventario();
    } else {
      resetForm();
    }
  };

  const handleOpenDialog = (extra?: any) => {
    if (extra) {
      setEditingExtraId(extra.id);
      setForm({
        nombre: extra.nombre,
        tipo: extra.tipo,
        precio_base: extra.precio_base?.toString() || '',
        tiempo_extra_min: extra.tiempo_extra_min?.toString() || '',
        descripcion: extra.descripcion || '',
      });
      // Inyectar Array de ingredientes populado desde el backend
      if (extra.tipo === 'aplicacion' && Array.isArray(extra.ingredientes)) {
        setIngredientes(extra.ingredientes.map((i: any) => ({
          producto_id: i.producto_id,
          nombre: i.producto?.nombre || 'Producto eliminado',
          cantidad: i.cantidad,
          costo_unitario: i.producto?.costo || 0,
          unidad: i.producto?.unidad || 'u',
        })));
      } else {
        setIngredientes([]);
      }
      if (extra.tipo === 'aplicacion' && inventario.length === 0) fetchInventario();
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (isDialogOpen && form.tipo === 'aplicacion' && inventario.length === 0) {
      fetchInventario();
    }
  }, [form.tipo, isDialogOpen, inventario.length, fetchInventario]);

  const handleAgregarIngrediente = () => {
    if (!productoSeleccionado) return;
    
    const producto = inventario.find(i => i.id === productoSeleccionado);
    if (!producto) return;
    
    const existente = ingredientes.findIndex(i => i.producto_id === productoSeleccionado);
    
    if (existente >= 0) {
      const updated = [...ingredientes];
      updated[existente].cantidad += cantidadInput;
      setIngredientes(updated);
    } else {
      setIngredientes([...ingredientes, {
        producto_id:    producto.id,
        nombre:         producto.nombre,
        cantidad:       cantidadInput,
        costo_unitario: producto.costo,
        unidad:         producto.unidad,
      }]);
    }
    
    setProductoSeleccionado('');
    setCantidadInput(1);
  };

  const handleRemoverIngrediente = (idx: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== idx));
  };

  const subtotalMateriales = ingredientes.reduce(
    (sum, ing) => sum + ing.cantidad * ing.costo_unitario, 0
  );

  const handleSubmit = async () => {
    if (!form.nombre) return toast({ title: "Requerido", description: "Nombre es requerido", variant: "destructive" });
    if (!form.precio_base) return toast({ title: "Requerido", description: "Precio es requerido", variant: "destructive" });
    if (!form.tiempo_extra_min) return toast({ title: "Requerido", description: "Tiempo extra requerido", variant: "destructive" });

    const payload: any = {
      nombre: form.nombre,
      tipo: form.tipo,
      precio_base: Number(form.precio_base),
      tiempo_extra_min: Number(form.tiempo_extra_min),
      descripcion: form.descripcion || null,
      ingredientes: form.tipo === 'aplicacion' 
        ? ingredientes.map(i => ({ 
            producto_id: i.producto_id, 
            cantidad:    i.cantidad 
          }))
        : [],
    };

    setFormLoading(true);
    try {
      if (editingExtraId) {
        await updateAdicional(editingExtraId, payload);
        toast({ title: "¡Adicional actualizado! ✨" });
      } else {
        await addAdicional(payload);
        toast({ title: "¡Adicional creado! ✨" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await removeAdicional(id);
      toast({ title: "Adicional eliminado" });
    } catch (err: any) {
      toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && data.items.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center p-20 animate-pulse h-full">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const { items = [], meta = {} } = data;
  const tecnicaExtras = items.filter((e: any) => e.tipo === 'tecnica');
  const aplicacionExtras = items.filter((e: any) => e.tipo === 'aplicacion');

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in p-2 pb-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Wand2 className="h-8 w-8 text-primary" />
              Catálogo de Extras y Arte
            </h1>
            <p className="text-muted-foreground mt-1">
              Técnicas y decoraciones que suman al servicio base
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Adicional
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                   <Wand2 className="h-5 w-5 text-primary"/>
                   {editingExtraId ? 'Editar Adicional' : 'Nuevo Adicional'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Type Selection */}
                <div>
                  <Label>Tipo de Adicional</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {Object.entries(extraTypeInfo).map(([key, info]) => {
                      const isSelected = form.tipo === key;
                      return (
                        <Button
                          key={key}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          className={`justify-start gap-3 h-auto py-3 px-4 ${isSelected ? info.color : ''}`}
                          onClick={() => setForm(prev => ({ ...prev, tipo: key as any }))}
                        >
                          <div className={`p-2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-muted'}`}>
                            {info.icon}
                          </div>
                          <div className="text-left whitespace-normal leading-snug">
                            <p className="font-semibold">{info.label}</p>
                            <p className="text-[10px] opacity-80 font-normal leading-tight">{info.description}</p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Nombre del Adicional</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Francés Clásico"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Precio Base ($)</Label>
                    <Input
                      type="number"
                      value={form.precio_base}
                      onChange={(e) => setForm({ ...form, precio_base: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tiempo Extra (min)</Label>
                    <Input
                      type="number"
                      value={form.tiempo_extra_min}
                      onChange={(e) => setForm({ ...form, tiempo_extra_min: e.target.value })}
                      placeholder="15"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descripción (opcional)</Label>
                  <Input
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Breve descripción del adicional"
                  />
                </div>

                {/* Conditional Ingredientes Selector */}
                {form.tipo === 'aplicacion' && (
                  <div className="border border-pink-500/20 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 shadow-sm">
                    {/* Header */}
                    <div className="px-4 py-2 bg-pink-500/10 border-b border-pink-500/20 flex items-center justify-between">
                      <span className="text-sm font-bold flex items-center gap-2 text-pink-700 dark:text-pink-400">
                        <Package className="h-4 w-4" /> Ingredientes Insumidos
                      </span>
                    </div>

                    {/* Selector Fields */}
                    <div className="p-3 bg-muted/10 flex flex-col sm:flex-row items-center gap-2 border-b">
                      <Select 
                        value={productoSeleccionado}
                        onValueChange={setProductoSeleccionado}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={loadingInv ? "Cargando inventario..." : "Seleccionar producto de inventario..."} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {inventario.map((item: any) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex items-center justify-between w-full gap-6">
                                <div>
                                  <span className="font-medium">{item.nombre}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {item.categoria}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono shrink-0">
                                  ${item.costo}/{item.unidad} · Stock: {item.stock}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          type="number"
                          min="1"
                          value={cantidadInput}
                          onChange={e => setCantidadInput(Number(e.target.value))}
                          className="w-20 text-center font-bold"
                        />
                        <Button 
                          onClick={handleAgregarIngrediente}
                          disabled={!productoSeleccionado}
                          size="sm"
                          className="shrink-0 w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          <Plus className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Agregar</span>
                        </Button>
                      </div>
                    </div>

                    {/* List Items Added */}
                    <div className="p-3 space-y-2 bg-background">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                        Receta de descontables
                      </p>

                      {ingredientes.length === 0 && (
                        <p className="text-xs text-center text-muted-foreground py-4 border-2 border-dashed rounded-lg">
                          No has vinculado inventario. Será solo cobro manual.
                        </p>
                      )}

                      {ingredientes.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-pink-500/5 border border-pink-500/10 text-sm group">
                          <div>
                            <p className="font-semibold text-xs text-pink-900 dark:text-pink-300">{ing.nombre}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {ing.cantidad} unds × ${ing.costo_unitario} = 
                              <span className="font-bold text-pink-700 dark:text-pink-400 ml-1">
                                ${(ing.cantidad * ing.costo_unitario).toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleRemoverIngrediente(idx)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 opacity-60 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Footer Subtotal */}
                    {ingredientes.length > 0 && (
                      <div className="px-4 py-3 border-t bg-pink-500/10 space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-pink-900 dark:text-pink-200">Total Merma por Adicional</span>
                          <span className="text-base font-black text-pink-700 dark:text-pink-400">
                            ${subtotalMateriales.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview Card */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-[10px] text-primary/70 mb-2 font-bold uppercase tracking-wider">Vista previa final</p>
                  <div className="flex items-center justify-between">
                     <p className="text-base font-bold text-foreground">
                       {form.nombre || "Nombre del Adicional"}
                     </p>
                     <div className="flex items-center gap-2">
                        {form.tipo === 'tecnica' ? (
                          <Badge className="bg-purple-500 hover:bg-purple-600 text-[10px] h-5"><Palette className="w-3 h-3 mr-1"/>Técnica</Badge>
                        ) : (
                          <Badge className="bg-pink-500 hover:bg-pink-600 text-[10px] h-5"><Gem className="w-3 h-3 mr-1"/>Aplicación</Badge>
                        )}
                     </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                     <p className="text-sm font-semibold text-primary">
                       +${form.precio_base || "0"}
                     </p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                       ⌚ +{form.tiempo_extra_min || "0"} mins
                     </p>
                  </div>
                  
                  {form.tipo === 'aplicacion' && ingredientes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <p className="text-[10px] text-pink-600/80 font-bold uppercase mb-1">Impacto Inventario</p>
                      <ul className="space-y-0.5">
                        {ingredientes.map((i, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5 pl-1 font-medium">
                            <span className="h-1 w-1 bg-pink-400 rounded-full inline-block"></span>
                            Descuenta {i.cantidad} de {i.nombre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full h-11 text-base font-semibold"
                  disabled={formLoading}
                >
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingExtraId ? 'Guardar Cambios' : 'Crear Adicional'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg shrink-0">
                 <Info className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">Diferencia Operativa</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-purple-500 text-white shrink-0 shadow-sm border-0">Técnica</Badge>
                    <p className="text-sm text-foreground/80 leading-snug">
                      Solo suma <strong>precio y tiempo</strong> al ticket. NO afecta inventario en lo absoluto.
                      <span className="block text-[11px] mt-1 text-muted-foreground/80 font-medium">Ej: Francés, Encapsulado, Mano Alzada</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-pink-500 text-white shrink-0 shadow-sm border-0">Aplicación</Badge>
                    <p className="text-sm text-foreground/80 leading-snug">
                      <strong>Resta inventario combinado</strong>. Agrega recetas a lo que pones encima de un diseño.
                      <span className="block text-[11px] mt-1 text-muted-foreground/80 font-medium">Ej: Diseño con Foil y Cristales</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Adicionales</p>
              <p className="text-2xl font-black text-foreground mt-1">{meta.total || 0}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Técnicas</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{meta.tecnicas || 0}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aplicaciones</p>
              <p className="text-2xl font-black text-pink-600 mt-1">{meta.aplicaciones || 0}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Precio Promedio</p>
              <p className="text-2xl font-black text-primary mt-1">${meta.precio_promedio?.toFixed(2) || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* LISTINGS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4">
          
          {/* TÉCNICAS */}
          <Card className="shadow-sm border-muted/60 bg-muted/5">
            <CardHeader className="pb-3 border-b border-muted/30 bg-muted/10 p-4">
              <div className="flex items-center gap-2 mb-1 mt-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  ✦ Técnicas
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 h-4 ml-auto bg-background shadow-sm border">{tecnicaExtras.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 bg-transparent">
              {tecnicaExtras.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-6">Sin técnicas configuradas</p>
              )}
              {tecnicaExtras.map((extra: any) => (
                <div key={extra.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  {/* Info izquierda */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {extra.nombre}
                    </p>
                  </div>

                  {/* Badges centro */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      +${extra.precio_base}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      +{extra.tiempo_extra_min}min
                    </span>
                  </div>

                  {/* Botones derecha — siempre visibles */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => handleOpenDialog(extra)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este adicional?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará permanentemente "{extra.nombre}". 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(extra.id)}
                          >
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* APLICACIONES */}
          <Card className="shadow-sm border-muted/60 bg-muted/5">
            <CardHeader className="pb-3 border-b border-muted/30 bg-muted/10 p-4">
              <div className="flex items-center gap-2 mb-1 mt-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
                  ✦ Aplicaciones
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 h-4 ml-auto bg-background shadow-sm border">{aplicacionExtras.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 bg-transparent">
              {aplicacionExtras.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-6">Sin aplicaciones configuradas</p>
              )}
              {aplicacionExtras.map((extra: any) => (
                <div key={extra.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  
                  {/* Info izquierda */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {extra.nombre}
                    </p>
                    
                    {/* Receta solo si es aplicacion y tiene ingredientes */}
                    {extra.tipo === 'aplicacion' && extra.ingredientes?.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Receta / Insumos
                        </p>
                        {extra.ingredientes.map((ing: any, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"/>
                            {ing.cantidad} uds de {ing.producto?.nombre || 'Producto'}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Badges centro */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      +${extra.precio_base}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      +{extra.tiempo_extra_min}min
                    </span>
                  </div>

                  {/* Botones derecha — siempre visibles */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => handleOpenDialog(extra)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este adicional?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará permanentemente "{extra.nombre}". 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(extra.id)}
                          >
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}
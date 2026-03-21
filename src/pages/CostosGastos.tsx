import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Clock,
  Calculator,
  PiggyBank,
  Trash2,
  Plus,
  Heart,
  Gift,
  AlertTriangle,
  TrendingUp,
  Building2,
  Settings,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";
import { useCostos } from "@/hooks/useCostos";

export default function CostosGastos() {
  const {
    loading,
    resumen,
    metaMensual,
    updateMetaField,
    
    costosFijosGroups,
    costosFijosTotal,
    addCostoFijo,
    removeCostoFijo,

    fondosAhorro,
    porcentajeAhorroTotal,
    addFondoAhorro,
    removeFondoAhorro,

    tiposGasto,
    addTipoGasto,
    editTipoGasto,
    removeTipoGasto
  } = useCostos();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isFondoDialogOpen, setIsFondoDialogOpen] = useState(false);
  const [isTiposManagerOpen, setIsTiposManagerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Expense State
  const [newExpense, setNewExpense] = useState({ 
    nombre: "", 
    etiqueta: "", 
    tipo_gasto_id: "",
    amount: "", 
    budget: "" 
  });

  // Inline Category Creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3B82F6");

  // Tipos Manager State
  const [editingTipoId, setEditingTipoId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatColor, setEditCatColor] = useState("");
  
  // New Category Modal Form (Feature 2)
  const [managerNewCatName, setManagerNewCatName] = useState("");
  const [managerNewCatColor, setManagerNewCatColor] = useState("#3B82F6");
  const PREDEFINED_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#6B7280'];

  // New Fondo State
  const [newFondo, setNewFondo] = useState({
    nombre: "",
    porcentaje: "",
    icono: "piggy-bank"
  });

  // --- HANDLERS ---
  const handleAddExpense = async () => {
    if (!newExpense.nombre || !newExpense.amount || (!newExpense.tipo_gasto_id && !isCreatingCategory)) {
      toast({ title: "Requerido", description: "Faltan campos obligatorios.", variant: "destructive" });
      return;
    }

    try {
      let finalTipoId = newExpense.tipo_gasto_id;

      if (isCreatingCategory) {
        if (!newCatName) return toast({ title: "Falta Nombre", description: "Nombre de la categoría requerido", variant: "destructive" });
        const created = await addTipoGasto({ nombre: newCatName, color: newCatColor });
        finalTipoId = created.id;
      }

      await addCostoFijo({
        nombre: newExpense.nombre,
        etiqueta: newExpense.etiqueta || null,
        tipo_gasto_id: finalTipoId,
        monto: parseFloat(newExpense.amount),
        presupuesto: newExpense.budget ? parseFloat(newExpense.budget) : null,
      });

      setNewExpense({ nombre: "", etiqueta: "", tipo_gasto_id: "", amount: "", budget: "" });
      setIsCreatingCategory(false);
      setNewCatName("");
      setIsExpenseDialogOpen(false);
      toast({ title: "¡Gasto fijo agregado! 💰" });
    } catch (err: any) {
      toast({ title: "Error al guardar costo fijo", description: err.message, variant: "destructive" });
    }
  };

  const handleRemoveExpense = async (id: string) => {
    setIsDeleting(true);
    try {
      await removeCostoFijo(id);
      toast({ title: "Gasto fijo eliminado." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fondos
  const handleAddFondo = async () => {
    if (!newFondo.nombre || !newFondo.porcentaje) {
      toast({ title: "Requerido", description: "Nombre y porcentaje son obligatorios.", variant: "destructive" });
      return;
    }
    try {
      await addFondoAhorro({
        nombre: newFondo.nombre,
        porcentaje: parseFloat(newFondo.porcentaje),
        icono: newFondo.icono,
      });
      setNewFondo({ nombre: "", porcentaje: "", icono: "piggy-bank" });
      setIsFondoDialogOpen(false);
      toast({ title: "¡Fondo de ahorro creado! 🐷" });
    } catch (err: any) {
      toast({ title: "Error al crear fondo", description: err.message, variant: "destructive" });
    }
  };

  const handleRemoveFondo = async (id: string) => {
    setIsDeleting(true);
    try {
      await removeFondoAhorro(id);
      toast({ title: "Fondo de ahorro eliminado." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Tipos Manager
  const handleSaveTipoEdit = async (id: string) => {
    if (!editCatName) return;
    try {
      await editTipoGasto(id, { nombre: editCatName, color: editCatColor });
      setEditingTipoId(null);
      toast({ title: "Categoría actualizada" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleManagerAddCategory = async () => {
    if (!managerNewCatName) return toast({ title: "Requerido", description: "Nombre obligatorio", variant: "destructive" });
    try {
      await addTipoGasto({ nombre: managerNewCatName, color: managerNewCatColor });
      setManagerNewCatName("");
      toast({ title: "Categoría agregada" });
    } catch (err: any) {
      toast({ title: "Error al crear", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteTipo = async (id: string) => {
    try {
      await removeTipoGasto(id);
      toast({ title: "Categoría eliminada" });
    } catch (err: any) {
      toast({ title: "Operación rechazada", description: err.message, variant: "destructive" });
    }
  };

  if (loading || !resumen || !metaMensual) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center p-20 animate-pulse h-full">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const metaTotal = resumen.meta_total || 0;

  return (
    <MainLayout>
      <div className="w-full px-6 flex flex-col h-full pt-4 pb-4">
        
        {/* Header Title + Stats */}
        <div className="flex-shrink-0 animate-fade-in mb-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Costos y Gastos
            </h1>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Gastos Fijos</p>
                <p className="text-xl font-bold text-foreground">
                  ${resumen.gastos_fijos_total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Sueldo Base</p>
                <p className="text-xl font-bold text-foreground">
                  ${resumen.sueldo_base.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center flex flex-col items-center justify-center h-full">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Provisiones (Fondos)</p>
                <p className="text-xl font-bold text-foreground">
                  ${resumen.provisiones_total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 bg-muted/50 px-2 py-0.5 rounded">
                  {resumen.porcentaje_ahorro_total}% del subtotal
                </p>
              </CardContent>
            </Card>
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-3 text-center">
                <p className="text-xs opacity-90 mb-1">Meta Total</p>
                <p className="text-xl font-bold drop-shadow-md">
                  ${resumen.meta_total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contenido principal — 3 Columnas flex-1 */}
        <div className="grid grid-cols-1 lg:grid-cols-[30fr_40fr_30fr] gap-4 flex-1 min-h-0 animate-fade-in">
          
          {/* Col 1 — Metas: scroll interno */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <Card className="shadow-card overflow-hidden shrink-0">
              <CardHeader className="p-4 border-b bg-muted/20">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Metas y Condiciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-xs font-semibold">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    ¿Cuánto quieres ganar al mes?
                  </Label>
                  <Input
                    type="number"
                    value={metaMensual.sueldo_base || ""}
                    onChange={(e) => updateMetaField('sueldo_base', Number(e.target.value))}
                    className="h-9 font-medium"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-xs font-semibold">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    Horas laborales al mes
                  </Label>
                  <Input
                    type="number"
                    value={metaMensual.horas_laborales_mes || ""}
                    onChange={(e) => updateMetaField('horas_laborales_mes', Number(e.target.value))}
                    className="h-9 font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-none bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-900/40 shrink-0">
              <CardContent className="p-4 space-y-4">
                <div className="bg-white dark:bg-black/20 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tu Costo por Minuto</p>
                      <p className="text-2xl font-black text-primary mt-0.5">
                        ${resumen.costo_por_minuto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}<span className="text-xs font-normal text-muted-foreground">/min</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium bg-muted px-2 py-0.5 rounded inline-flex">
                        ${resumen.costo_por_hora.toLocaleString("es-MX", { minimumFractionDigits: 2 })}/hora
                      </p>
                    </div>
                    <Calculator className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-md">
                        <Gift className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Incluir Aguinaldo</p>
                        <p className="text-[10px] text-muted-foreground">
                          +${metaMensual.incluir_aguinaldo ? Number(metaMensual.aguinaldo_mensual || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 }) : "0.00"}/mes
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={metaMensual.incluir_aguinaldo}
                      onCheckedChange={(checked) => updateMetaField('incluir_aguinaldo', checked)}
                    />
                  </div>

                  {/* Feature 2: Expandable Aguinaldo Config Block */}
                  {metaMensual.incluir_aguinaldo && (
                    <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                      <p className="text-[10px] text-pink-600/70 font-semibold uppercase tracking-wider">Monto apartando al mes</p>
                      <p className="text-xl font-bold text-pink-600 mt-0.5">
                        ${Number(metaMensual.aguinaldo_mensual || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-pink-600/50 mt-1 font-medium">Calculado automáticamente (Sueldo Base / 12)</p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-bold m-0">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                        <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Seguro Médico Anual
                    </Label>
                    <div className="pt-1">
                      <Input
                        type="number"
                        value={metaMensual.seguro_medico_anual || ""}
                        onChange={(e) => updateMetaField('seguro_medico_anual', Number(e.target.value))}
                        className="bg-transparent border-t-0 border-x-0 border-b-2 rounded-none px-1 h-8 text-sm focus-visible:ring-0 focus-visible:border-primary font-medium"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">
                        = ${Number(metaMensual.seguro_medico_mensual || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}/mes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Col 2 — Gastos Fijos: flex column */}
          <div className="flex flex-col border rounded-lg bg-card shadow-sm h-full max-h-full">
            <div className="flex-shrink-0 p-3 border-b bg-muted/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" /> Gastos Fijos
              </h3>

              <div className="flex items-center gap-2">
                
                {/* Categorias CRUD Manager Modal */}
                <Dialog open={isTiposManagerOpen} onOpenChange={setIsTiposManagerOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                       + Tipo de Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Settings className="h-4 w-4"/> Gestionar Categorías</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      {tiposGasto.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                          {editingTipoId === t.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input type="color" value={editCatColor} onChange={e => setEditCatColor(e.target.value)} className="w-8 h-8 rounded shrink-0 p-0 border-0 cursor-pointer"/>
                              <Input value={editCatName} onChange={e => setEditCatName(e.target.value)} className="h-8 text-sm" />
                              <Button size="icon" variant="ghost" onClick={() => handleSaveTipoEdit(t.id)} className="text-green-600"><Check className="h-4 w-4"/></Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingTipoId(null)} className="text-muted-foreground"><X className="h-4 w-4"/></Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }}></div>
                                <span className="font-semibold text-sm">{t.nombre}</span>
                                <Badge variant="secondary" className="text-[10px] ml-2">{t.gastos_count}</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" onClick={() => { setEditingTipoId(t.id); setEditCatName(t.nombre); setEditCatColor(t.color); }}><Pencil className="h-3.5 w-3.5"/></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar esta categoría?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Se eliminará "{t.nombre}" del sistema. No se puede deshacer. (No es posible eliminar si continúan gastos asociados).
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteTipo(t.id)}>Sí, eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t mt-4 border-border space-y-3">
                         <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Crear nueva categoría</Label>
                         <div className="flex gap-2">
                            {PREDEFINED_COLORS.map(colorHex => (
                               <button 
                                 key={colorHex} 
                                 className={`w-6 h-6 rounded-full focus:ring-2 focus:ring-offset-1 focus:outline-none transition-all ${managerNewCatColor === colorHex ? 'ring-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
                                 style={{ backgroundColor: colorHex }} 
                                 onClick={() => setManagerNewCatColor(colorHex)}
                                 aria-label="Color Picker"
                               />
                            ))}
                         </div>
                         <div className="flex gap-2">
                           <Input placeholder="Ej. Comisiones bancarias" value={managerNewCatName} onChange={e => setManagerNewCatName(e.target.value)} className="h-9"/>
                           <Button onClick={handleManagerAddCategory} className="h-9">Agregar</Button>
                         </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Nuevo Gasto Modal */}
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" /> Nuevo Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" /> Agregar Gasto
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Nombre</Label>
                          <Input
                            value={newExpense.nombre}
                            onChange={(e) => setNewExpense({ ...newExpense, nombre: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Etiqueta <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                          <Input
                            value={newExpense.etiqueta}
                            onChange={(e) => setNewExpense({ ...newExpense, etiqueta: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 p-3 border rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                           <Label>Tipo de Gasto</Label>
                           {isCreatingCategory && (
                              <Button variant="ghost" className="h-5 px-2 text-[10px]" onClick={() => setIsCreatingCategory(false)}>Volver a lista</Button>
                           )}
                        </div>

                        {isCreatingCategory ? (
                          <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                            <input type="color" className="w-9 h-9 p-0 border-0 rounded cursor-pointer shrink-0" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} />
                            <Input placeholder="Nombre de categoría" className="h-9" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                          </div>
                        ) : (
                          <Select 
                            value={newExpense.tipo_gasto_id} 
                            onValueChange={(v) => {
                              if (v === "NEW") setIsCreatingCategory(true);
                              else setNewExpense({ ...newExpense, tipo_gasto_id: v });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría..." />
                            </SelectTrigger>
                            <SelectContent>
                              {tiposGasto.map((tipo) => (
                                <SelectItem key={tipo.id} value={tipo.id}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: tipo.color }} />
                                    {tipo.nombre}
                                  </div>
                                </SelectItem>
                              ))}
                              <SelectItem value="NEW" className="text-primary font-bold bg-primary/5 cursor-pointer mt-1">
                                + Crear nueva categoría
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Monto</Label>
                          <Input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Presupuesto</Label>
                          <Input
                            type="number"
                            value={newExpense.budget}
                            onChange={(e) => setNewExpense({ ...newExpense, budget: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddExpense} className="w-full">
                        Guardar Gasto Fijo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              
               {/* Dynamic Categories Mapping */}
              {tiposGasto.map((tipo) => {
                const expenses = costosFijosGroups[tipo.nombre] || [];
                if (expenses.length === 0) return null;
                const typeTotal = expenses.reduce((sum: number, e: any) => sum + e.monto, 0);
                
                return (
                  <div key={tipo.id} className="space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 mb-1 border-b pb-1 border-border/50">
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: tipo.color }}></div>
                      <h4 className="font-semibold text-[13px]">{tipo.nombre}</h4>
                      <span className="text-xs font-bold ml-auto">${typeTotal.toLocaleString()}</span>
                    </div>
                    {expenses.map((expense: any) => (
                      <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg bg-background border shadow-sm group hover:shadow-md transition-shadow">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-xs truncate">{expense.nombre}</p>
                          {expense.etiqueta && (
                            <Badge variant="secondary" className="mt-0.5 text-[9px] px-1 py-0 h-3">
                              {expense.etiqueta}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-xs">${expense.monto.toLocaleString()}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost" size="icon" disabled={isDeleting}
                                className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente "{expense.nombre}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleRemoveExpense(expense.id)}>Sí, eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Orphans rendered fallback */}
              {(costosFijosGroups['Otros'] && costosFijosGroups['Otros'].length > 0) && (
                <div className="space-y-1.5 opacity-80">
                  <div className="flex items-center gap-2 mb-1 border-b pb-1">
                    <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                    <h4 className="font-semibold text-[13px] italic">No clasificados</h4>
                  </div>
                  {costosFijosGroups['Otros'].map((expense: any) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg border group bg-slate-50/50">
                       <p className="font-semibold text-xs truncate">{expense.nombre}</p>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100">
                             <Trash2 className="h-3 w-3"/>
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
                                <AlertDialogDescription>Se eliminará permanentemente "{expense.nombre}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleRemoveExpense(expense.id)}>Sí, eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                    </div>
                  ))}
                </div>
              )}

              {Object.values(costosFijosGroups).every((arr: any) => arr.length === 0) && (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center p-8 h-full">
                  <div className="text-4xl opacity-30">💸</div>
                  <p className="text-gray-400 font-medium">Sin gastos fijos aún</p>
                  <p className="text-gray-400 opacity-60 text-sm">
                    Agrega tus gastos recurrentes como renta,<br/>
                    servicios o suscripciones
                  </p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-3 bg-muted/20 border-t flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide">Monto Bruto</span>
              <span className="text-lg font-black text-primary">${costosFijosTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Col 3 — Fondos: flex column */}
          <div className="flex flex-col border rounded-lg bg-card shadow-sm h-full max-h-full">
            <div className="flex-shrink-0 p-3 border-b bg-muted/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <PiggyBank className="h-4 w-4 text-primary" /> Fondos (Buckets)
              </h3>
              <Dialog open={isFondoDialogOpen} onOpenChange={setIsFondoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                    <Plus className="h-3 w-3 mr-1" /> Nuevo Fondo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary"/> Crear Fondo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <Label>Nombre</Label>
                      <Input value={newFondo.nombre} onChange={(e) => setNewFondo({ ...newFondo, nombre: e.target.value })}/>
                    </div>
                    <div className="space-y-1">
                      <Label>Porcentaje (%)</Label>
                      <Input type="number" step="0.1" max="100" value={newFondo.porcentaje} onChange={(e) => setNewFondo({ ...newFondo, porcentaje: e.target.value })}/>
                    </div>
                    <Button onClick={handleAddFondo} className="w-full">Crear Fondo</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {porcentajeAhorroTotal > 40 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-semibold">Tus abonos automáticos superan el 40% operativo.</p>
                </div>
              )}
              {fondosAhorro.map((fondo: any) => {
                const montoMensualFondo = metaTotal * (fondo.porcentaje / 100);
                return (
                  <div key={fondo.id} className="p-3 rounded-lg bg-muted/10 border shadow-sm group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 pr-2">
                        <PiggyBank className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold text-xs truncate">{fondo.nombre}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className="font-bold text-[10px]">{fondo.porcentaje.toFixed(1)}%</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost" size="icon" disabled={isDeleting}
                              className="h-5 w-5 text-destructive opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar este fondo de ahorro?</AlertDialogTitle>
                                  <AlertDialogDescription>Se eliminará permanentemente "{fondo.nombre}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleRemoveFondo(fondo.id)}>Sí, eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <Progress value={fondo.porcentaje * 2.5} className="h-1 bg-muted/40 mb-2" />
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground flex items-center"><TrendingUp className="h-2.5 w-2.5 mr-1"/> Acopio al mes</span>
                      <span className="font-bold text-primary">+${montoMensualFondo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
              {fondosAhorro.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                   <PiggyBank className="h-8 w-8 mb-2" />
                   <p className="text-xs">No hay fondos creados</p>
                 </div>
              )}
            </div>

            <div className="flex-shrink-0 p-3 bg-muted/20 border-t flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide">Fondeo Compartido</span>
              <span className="text-lg font-black text-primary">{porcentajeAhorroTotal.toLocaleString("es-MX", { minimumFractionDigits: 1 })}%</span>
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Menu,
  Plus,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Edit2,
  Trash2,
  Calculator,
  Check,
  Loader2,
  Info,
  X,
} from "lucide-react";
import { useBusinessConfig, ServiceDefinition, InventoryItem } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { getServices, createService, updateServiceApi, deleteServiceApi } from "@/services/serviceService";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { getInventory } from "@/services/inventoryService";

interface RecipeItem {
  materialId: string;
  materialName: string;
  usageAmount: number;
  costPerUnit: number;
  totalCost: number;
}

interface ServiceFormData {
  name: string;
  basePrice: string;
  estimatedMinutes: string;
  materialCost: string;
  needsLength: boolean;
}

export default function MenuServicios() {
  const {
    totalFixedExpenses,
    desiredMonthlySalary,
    monthlyWorkHours,
  } = useBusinessConfig();

  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<ServiceDefinition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  const getCostPerUnit = (item: InventoryItem): number => {
    if (item.measurementType === 'PIECES') return item.costPerPiece || 0;
    if (item.measurementType === 'LIQUID') return item.costPerUse || 0;
    return item.purchaseCost || 0;
  };

  const materialCost = recipe.reduce((sum, item) => sum + item.totalCost, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, inventoryData] = await Promise.all([
          getServices(),
          getInventory(),
        ]);
        setServices(servicesData);
        setInventoryItems(inventoryData);
      } catch (error) {
        toast({ title: "Error al cargar datos", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ServiceFormData>({
    defaultValues: {
      name: "",
      basePrice: "",
      estimatedMinutes: "",
      needsLength: false,
    },
  });

  // Calculate cost per minute based on business config
  const minutesPerMonth = monthlyWorkHours * 60;
  const costPerMinute = (totalFixedExpenses + desiredMonthlySalary) / minutesPerMonth;

  // Calculate suggested price for a service
  const calculateSuggestedPrice = (minutes: number, materialCost: number) => {
    const timeCost = minutes * costPerMinute;
    return Math.ceil((timeCost + materialCost) / 10) * 10; // Round up to nearest 10
  };

  // Watch form values for live calculation
  const watchMinutes = watch("estimatedMinutes");
  const liveSuggestedPrice = calculateSuggestedPrice(
    parseFloat(watchMinutes) || 0,
    materialCost
  );

  const onSubmit = async (data: ServiceFormData) => {
    const suggestedPrice = calculateSuggestedPrice(
      parseFloat(data.estimatedMinutes),
      materialCost
    );

    try {
      if (editingId) {
        await updateServiceApi(editingId, {
          name: data.name,
          basePrice: parseFloat(data.basePrice),
          estimatedMinutes: parseInt(data.estimatedMinutes),
          materialCost,
          needsLength: data.needsLength,
          suggestedPrice,
          recipe,
        });

        setServices(prev => prev.map(s =>
          s.id === editingId
            ? { ...s, name: data.name, basePrice: parseFloat(data.basePrice), estimatedMinutes: parseInt(data.estimatedMinutes), materialCost, needsLength: data.needsLength, suggestedPrice, recipe }
            : s
        ));
        toast({ title: "Servicio actualizado ✨" });
      } else {
        const response = await createService({
          name: data.name,
          basePrice: parseFloat(data.basePrice),
          estimatedMinutes: parseInt(data.estimatedMinutes),
          materialCost,
          needsLength: data.needsLength,
          suggestedPrice,
          recipe,
        });

        setServices(prev => [...prev, response]);
        toast({ title: "Servicio agregado 💅" });
      }

      reset();
      setRecipe([]);
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handleEdit = (service: typeof services[0]) => {
    setEditingId(service.id);
    setValue("name", service.name);
    setValue("basePrice", service.basePrice.toString());
    setValue("estimatedMinutes", service.estimatedMinutes.toString());
    setValue("needsLength", service.needsLength);
    setRecipe(service.recipe || []);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deleteServiceApi(itemToDelete.id);
      setServices(prev => prev.filter(s => s.id !== itemToDelete.id));
      toast({ title: "Servicio eliminado" });
      setItemToDelete(null);
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if price is below suggested
  const isPriceWarning = (service: typeof services[0]) => {
    const suggested = calculateSuggestedPrice(service.estimatedMinutes, service.materialCost);
    return service.basePrice < suggested;
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Menu className="h-8 w-8 text-primary" />
              Menú de Servicios
            </h1>
            <p className="text-muted-foreground mt-1">
              Smart Pricing con precios mínimos sugeridos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              reset();
              setRecipe([]);
              setSelectedItemId('');
              setSelectedQty(1);
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="shadow-button">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px] min-h-[480px]">

                  {/* Columna izquierda — formulario */}
                  <div className="flex flex-col gap-4 p-5 overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingId ? "Editar Servicio" : "Nuevo Servicio"}
                      </DialogTitle>
                    </DialogHeader>

                    <div>
                      <Label>Nombre del Servicio</Label>
                      <Input
                        {...register("name", { required: "Nombre requerido" })}
                        placeholder="Ej. Acrílico con Diseño"
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Duración (min)
                      </Label>
                      <Input
                        type="number"
                        {...register("estimatedMinutes", { required: true, min: 1 })}
                        placeholder="120"
                      />
                    </div>

                    {/* Smart Price Calculator */}
                    <div className="p-4 rounded-xl bg-primary/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Calculadora de Precio</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Costo de tiempo:</p>
                          <p className="font-bold">
                            ${((parseFloat(watchMinutes) || 0) * costPerMinute).toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Costo material:</p>
                          <p className="font-bold">${materialCost.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                        <span className="font-medium">Precio Mínimo Sugerido:</span>
                        <span className="text-xl font-bold text-primary">
                          ${liveSuggestedPrice}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Precio de Venta
                      </Label>
                      <Input
                        type="number"
                        {...register("basePrice", { required: true, min: 0 })}
                        placeholder={liveSuggestedPrice.toString()}
                      />
                    </div>

                    {/* Price Warning */}
                    {parseFloat(watch("basePrice")) > 0 && parseFloat(watch("basePrice")) < liveSuggestedPrice && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-destructive">
                            ⚠️ ¡Estás perdiendo dinero!
                          </p>
                          <p className="text-muted-foreground">
                            Tu precio (${watch("basePrice")}) es menor al costo real (${liveSuggestedPrice}).
                            Pierdes ${liveSuggestedPrice - parseFloat(watch("basePrice"))} por servicio.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <Label>¿Requiere largo de uña?</Label>
                        <p className="text-xs text-muted-foreground">
                          Para servicios como acrílico o soft gel
                        </p>
                      </div>
                      <Switch
                        checked={watch("needsLength")}
                        onCheckedChange={(val) => setValue("needsLength", val, { shouldDirty: true })}
                      />
                    </div>

                    <Button type="submit" className="w-full mt-auto">
                      {editingId ? "Guardar Cambios" : "Agregar Servicio"}
                    </Button>
                  </div>

                  {/* Columna derecha — ticket de ingredientes */}
                  <div className="flex flex-col border-l bg-muted/30">

                    {/* Selector */}
                    <div className="p-3 border-b space-y-2">
                      <Label className="text-xs font-semibold">Ingredientes</Label>
                      <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Seleccionar producto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id} className="text-xs">
                              {item.name} — ${getCostPerUnit(item).toFixed(2)}/u
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={selectedQty}
                          onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-xs bg-background"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => {
                            const item = inventoryItems.find(i => i.id === selectedItemId);
                            if (!item) return;
                            const costPerUnit = getCostPerUnit(item);
                            setRecipe(prev => {
                              const existing = prev.find(r => r.materialId === item.id);
                              if (existing) {
                                return prev.map(r => r.materialId === item.id
                                  ? { ...r, usageAmount: r.usageAmount + selectedQty, totalCost: (r.usageAmount + selectedQty) * r.costPerUnit }
                                  : r
                                );
                              }
                              return [...prev, {
                                materialId: item.id,
                                materialName: item.name,
                                usageAmount: selectedQty,
                                costPerUnit,
                                totalCost: selectedQty * costPerUnit,
                              }];
                            });
                            setSelectedItemId('');
                            setSelectedQty(1);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Agregar
                        </Button>
                      </div>
                    </div>

                    {/* Lista con scroll */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[280px]">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Receta del servicio</p>
                      {recipe.map((r) => (
                        <div key={r.materialId} className="bg-background border rounded-lg p-2">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-medium flex-1">{r.materialName}</span>
                            <button type="button" onClick={() => setRecipe(prev => prev.filter(i => i.materialId !== r.materialId))}
                              className="text-destructive text-xs ml-1 hover:text-destructive/80 transition-colors">✕</button>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {r.usageAmount} × ${r.costPerUnit.toFixed(2)} = <span className="text-foreground font-medium">${r.totalCost.toFixed(2)}</span>
                          </p>
                        </div>
                      ))}
                      {recipe.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">Sin ingredientes aún</p>
                      )}
                    </div>

                    {/* Total fijo abajo */}
                    <div className="p-3 border-t bg-background mt-auto">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Subtotal materiales</span>
                        <span>${materialCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total receta</span>
                        <span className="text-primary">${materialCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cost per Minute Info */}
        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Tu costo por minuto:</p>
                  <p className="text-xs text-muted-foreground">
                    (Gastos + Sueldo) ÷ Minutos laborales
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ${costPerMinute.toFixed(2)}/min
                </p>
                <p className="text-xs text-muted-foreground">
                  = ${(costPerMinute * 60).toFixed(0)}/hora
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden animate-fade-in">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Costo Material</TableHead>
                  <TableHead>Precio Sugerido</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay servicios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => {
                    const suggested = calculateSuggestedPrice(service.estimatedMinutes, service.materialCost);
                    const isWarning = service.basePrice < suggested;
                    const profit = service.basePrice - suggested;

                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-accent" />
                            <span className="font-medium">{service.name}</span>
                          </div>
                          {service.needsLength && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              +Largo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {service.estimatedMinutes} min
                          </div>
                        </TableCell>
                        <TableCell>
                          {(!service.recipe || service.recipe.length === 0) ? (
                            <span>${service.materialCost}</span>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/50">
                                  <span>${service.materialCost}</span>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 text-sm">
                                    <p className="font-semibold mb-1">Receta:</p>
                                    {service.recipe.map((r, idx) => (
                                      <p key={idx} className="text-muted-foreground">
                                        {r.usageAmount}x {r.materialName} = ${r.totalCost?.toFixed(2) || 0}
                                      </p>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-primary">${suggested}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${isWarning ? 'text-destructive' : ''}`}>
                            ${service.basePrice}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isWarning ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              -${Math.abs(profit)}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 gap-1">
                              <Check className="h-3 w-3" />
                              +${profit}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setItemToDelete(service)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="¿Eliminar servicio?"
        description="Esta acción no se puede deshacer. Se eliminará el servicio y su receta asociada."
        itemName={itemToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </MainLayout>
  );
}

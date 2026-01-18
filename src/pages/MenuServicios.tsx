import { useState } from "react";
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
} from "lucide-react";
import { useBusinessConfig } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

interface ServiceFormData {
  name: string;
  basePrice: string;
  estimatedMinutes: string;
  materialCost: string;
  needsLength: boolean;
}

export default function MenuServicios() {
  const {
    services,
    totalFixedExpenses,
    desiredMonthlySalary,
    monthlyWorkHours,
    addService,
    updateService,
    removeService,
  } = useBusinessConfig();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ServiceFormData>({
    defaultValues: {
      name: "",
      basePrice: "",
      estimatedMinutes: "",
      materialCost: "40",
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
  const watchMaterial = watch("materialCost");
  const liveSuggestedPrice = calculateSuggestedPrice(
    parseFloat(watchMinutes) || 0,
    parseFloat(watchMaterial) || 0
  );

  const onSubmit = (data: ServiceFormData) => {
    const suggestedPrice = calculateSuggestedPrice(
      parseFloat(data.estimatedMinutes),
      parseFloat(data.materialCost)
    );

    if (editingId) {
      updateService(editingId, {
        name: data.name,
        basePrice: parseFloat(data.basePrice),
        estimatedMinutes: parseInt(data.estimatedMinutes),
        materialCost: parseFloat(data.materialCost),
        needsLength: data.needsLength,
        suggestedPrice,
      });
      toast({ title: "Servicio actualizado ✨" });
    } else {
      addService({
        name: data.name,
        basePrice: parseFloat(data.basePrice),
        estimatedMinutes: parseInt(data.estimatedMinutes),
        needsLength: data.needsLength,
        recipe: [],
      });
      toast({ title: "Servicio agregado 💅" });
    }

    reset();
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (service: typeof services[0]) => {
    setEditingId(service.id);
    setValue("name", service.name);
    setValue("basePrice", service.basePrice.toString());
    setValue("estimatedMinutes", service.estimatedMinutes.toString());
    setValue("materialCost", service.materialCost.toString());
    setValue("needsLength", service.needsLength);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    removeService(id);
    toast({ title: "Servicio eliminado" });
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
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="shadow-button">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Servicio" : "Nuevo Servicio"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Costo Material
                    </Label>
                    <Input
                      type="number"
                      {...register("materialCost", { required: true, min: 0 })}
                      placeholder="40"
                    />
                  </div>
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
                      <p className="font-bold">${parseFloat(watchMaterial) || 0}</p>
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
                  <Switch {...register("needsLength")} />
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Guardar Cambios" : "Agregar Servicio"}
                </Button>
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
              {services.map((service) => {
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
                    <TableCell>${service.materialCost}</TableCell>
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
                          onClick={() => handleDelete(service.id)}
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
        </div>

        {/* Summary */}
        <Card className="shadow-card animate-fade-in bg-secondary text-secondary-foreground">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Calculator className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-bold text-lg mb-2">📊 Fórmula de Precio Sugerido</h3>
                <p className="text-sm opacity-90">
                  <strong>Precio Mínimo</strong> = (Costo por Minuto × Duración) + Costo de Materiales
                </p>
                <p className="text-sm opacity-70 mt-2">
                  Donde Costo por Minuto = (Gastos Fijos ${totalFixedExpenses.toLocaleString()} + Sueldo ${desiredMonthlySalary.toLocaleString()}) 
                  ÷ ({monthlyWorkHours} horas × 60 min) = <strong>${costPerMinute.toFixed(2)}/min</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

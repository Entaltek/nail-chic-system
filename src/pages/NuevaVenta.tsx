import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Sparkles, Check } from "lucide-react";

// Pricing configuration
const services = [
  { id: "pedicure", name: "Pedicure Spa", basePrice: 450, needsLength: false },
  { id: "gel", name: "Gel Semipermanente", basePrice: 350, needsLength: false },
  { id: "rubber", name: "Rubber Gel", basePrice: 500, needsLength: false },
  { id: "softgel", name: "Soft Gel", basePrice: 650, needsLength: true },
  { id: "acrylic", name: "Acrílico", basePrice: 700, needsLength: true },
];

const lengthPrices = {
  "1": 0,
  "2": 100,
  "3": 200,
  "4": 300,
  "5": 450,
};

const artLevels = [
  { id: "basic", name: "Básico", price: 50 },
  { id: "intermediate", name: "Intermedio", price: 150 },
  { id: "advanced", name: "Avanzado", price: 300 },
];

const extras = [
  { id: "stickers", name: "Stickers", price: 30 },
  { id: "gems", name: "Pedrería", price: 80 },
  { id: "effects", name: "Efectos Especiales", price: 120 },
];

export default function NuevaVenta() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [nailLength, setNailLength] = useState<string>("1");
  const [artLevel, setArtLevel] = useState<string>("basic");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const service = services.find((s) => s.id === selectedService);
  const art = artLevels.find((a) => a.id === artLevel);

  const totalPrice = useMemo(() => {
    if (!service) return 0;

    let total = service.basePrice;

    // Add length price if applicable
    if (service.needsLength) {
      total += lengthPrices[nailLength as keyof typeof lengthPrices] || 0;
    }

    // Add art level
    if (art) {
      total += art.price;
    }

    // Add extras
    selectedExtras.forEach((extraId) => {
      const extra = extras.find((e) => e.id === extraId);
      if (extra) total += extra.price;
    });

    return total;
  }, [selectedService, nailLength, artLevel, selectedExtras, service, art]);

  const handleSave = () => {
    if (!service) {
      toast({
        title: "Selecciona un servicio",
        description: "Debes elegir un servicio base para continuar",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "¡Venta registrada! 💅",
      description: `${service.name} - $${totalPrice.toLocaleString()} MXN`,
    });

    // Reset form
    setSelectedService("");
    setNailLength("1");
    setArtLevel("basic");
    setSelectedExtras([]);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Nueva Venta
          </h1>
          <p className="text-muted-foreground mt-1">
            Construye el ticket de servicio paso a paso
          </p>
        </div>

        <div className="space-y-6">
          {/* Service Selection */}
          <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in space-y-4">
            <Label className="text-base font-semibold">Servicio Base</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex justify-between items-center w-full gap-4">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">
                        ${s.basePrice}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nail Length - Conditional */}
          {service?.needsLength && (
            <div className="rounded-2xl bg-card p-6 shadow-card animate-scale-in space-y-4">
              <Label className="text-base font-semibold">Largo de Uña</Label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(lengthPrices).map(([level, price]) => (
                  <button
                    key={level}
                    onClick={() => setNailLength(level)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      nailLength === level
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xl font-bold">{level}</div>
                    <div className="text-xs text-muted-foreground">
                      {price > 0 ? `+$${price}` : "Base"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Art Level */}
          <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in space-y-4">
            <Label className="text-base font-semibold">Arte Lineal</Label>
            <RadioGroup
              value={artLevel}
              onValueChange={setArtLevel}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {artLevels.map((level) => (
                <div key={level.id}>
                  <RadioGroupItem
                    value={level.id}
                    id={level.id}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={level.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      artLevel === level.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">{level.name}</span>
                    <span className="text-muted-foreground">
                      +${level.price}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Extras */}
          <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in space-y-4">
            <Label className="text-base font-semibold">Extras</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {extras.map((extra) => {
                const isSelected = selectedExtras.includes(extra.id);
                return (
                  <div
                    key={extra.id}
                    onClick={() => {
                      setSelectedExtras((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== extra.id)
                          : [...prev, extra.id]
                      );
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <span className="font-medium">{extra.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      +${extra.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total & Save */}
          <div className="rounded-2xl gradient-primary p-6 shadow-button animate-fade-in">
            <div className="flex items-center justify-between text-primary-foreground">
              <div>
                <p className="text-sm opacity-90">Total del Servicio</p>
                <p className="text-4xl font-bold">
                  ${totalPrice.toLocaleString()}
                  <span className="text-lg font-normal ml-1">MXN</span>
                </p>
              </div>
              <Sparkles className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <Button
            onClick={handleSave}
            size="lg"
            className="w-full h-14 text-lg shadow-button"
            disabled={!selectedService}
          >
            <Check className="mr-2 h-5 w-5" />
            Guardar Venta
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Square,
  Clock,
  Timer,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  AlertTriangle,
  Check,
  Sparkles,
  User,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useBusinessConfig } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";
import { getServices } from "@/services/serviceService";
import { teamMemberService } from "@/services/teamMemberService";
import { serviceRecordService } from "@/services/serviceRecordService";
import { useAuth } from "@/auth/AuthProvider";

const TIMER_STORAGE_KEY = "entaltek-active-timer";

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  serviceId: string;
  serviceName: string;
}

export default function ServicioEnCurso() {
  const { costPerMinute } = useBusinessConfig();

  // New API states
  const [services, setServices] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // If there was a running timer, calculate elapsed time
      if (parsed.isRunning && parsed.startTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - parsed.startTime) / 1000);
        return { ...parsed, elapsedSeconds: elapsed };
      }
      return parsed;
    }
    return {
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      serviceId: "",
      serviceName: "",
    };
  });

  // Form state
  // Don't initialize with [0]?.id because it's empty initially
  const [selectedService, setSelectedService] = useState(timerState.serviceId || "");
  const [selectedTeamMember, setSelectedTeamMember] = useState(""); 
  const [selectedClient, setSelectedClient] = useState(""); 
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    realMinutes: number;
    estimatedMinutes: number;
    chargedAmount: number;
    profit: number;
    isUnprofitable: boolean;
  } | null>(null);

  const { user, loading: authLoading } = useAuth();

  // Fetch data on mount, waiting for user
  useEffect(() => {
    let mounted = true;
    
    // Si no hay usuario o Firebase sigue cargando la sesión, no hacer fetch
    if (!user || authLoading) return;

    const loadData = async () => {
      try {
        const [servicesData, membersData] = await Promise.all([
          getServices(),
          teamMemberService.getAll()
        ]);
        
        if (mounted) {
          setServices(servicesData);
          setTeamMembers(membersData);
          if (membersData.length > 0 && !selectedTeamMember) {
             setSelectedTeamMember(membersData[0].id);
          }
        }
      } catch (error: any) {
        console.error("Error loading data:", error);
        if (mounted) {
          toast({
            title: "Error cargando datos",
            description: error?.message || "No se pudieron cargar los servicios o el equipo.",
            variant: "destructive"
          });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [user, authLoading]);

  const service = services.find((s) => s.id === selectedService);
  const teamMember = teamMembers.find((m) => m.id === selectedTeamMember);

  const addOnOptions = [
    { id: "crystals", name: "Cristales", price: 100 },
    { id: "reliefs", name: "Relieves 3D", price: 150 },
    { id: "handpainted", name: "Mano Alzada", price: 200 },
    { id: "foil", name: "Foil/Papel", price: 50 },
    { id: "encapsulated", name: "Encapsulado", price: 80 },
  ];

  // Save timer state to localStorage
  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
  }, [timerState]);

  // Timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timerState.startTime!) / 1000);
        setTimerState((prev) => ({ ...prev, elapsedSeconds: elapsed }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!selectedService || !selectedTeamMember) {
      toast({
        title: "Faltan datos",
        description: "Selecciona un servicio y quién lo realizará.",
        variant: "destructive",
      });
      return;
    }

    const serviceName = service?.name || "";
    setTimerState({
      isRunning: true,
      startTime: Date.now(),
      elapsedSeconds: 0,
      serviceId: selectedService,
      serviceName,
    });

    toast({
      title: "⏱️ Cronómetro iniciado",
      description: `Servicio: ${serviceName}`,
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStop = async () => {
    if (!timerState.isRunning || !timerState.startTime) return;
    
    setIsSubmitting(true);

    try {
      const finishTime = Date.now();
      const realMinutes = Math.ceil(timerState.elapsedSeconds / 60);
      const estimatedMinutes = service?.estimatedMinutes || 60;
      
      // Calculate costs
      const timeCost = realMinutes * costPerMinute;
      const materialCost = service?.materialCost || 0;
      const addOnTotal = addOns.reduce((sum, id) => {
        const addOn = addOnOptions.find((a) => a.id === id);
        return sum + (addOn?.price || 0);
      }, 0);
      
      const chargedAmount = (service?.basePrice || 0) + addOnTotal;
      const calculatedCost = timeCost + materialCost;
      const profit = chargedAmount - calculatedCost;
      const isUnprofitable = profit < 0 || realMinutes > estimatedMinutes * 1.5;

      // 1. Save to new ServiceRecord API
      await serviceRecordService.create({
        serviceId: timerState.serviceId,
        serviceName: timerState.serviceName,
        performedById: selectedTeamMember,
        performedByName: teamMember?.name || "Desconocido",
        clientId: null,
        clientName: null,
        startedAt: new Date(timerState.startTime).toISOString(),
        finishedAt: new Date(finishTime).toISOString(),
        extras: addOns,
        notes: null
      });

      // Show result
      setLastResult({
        realMinutes,
        estimatedMinutes,
        chargedAmount,
        profit,
        isUnprofitable,
      });
      setShowResult(true);

      // Reset timer
      setTimerState({
        isRunning: false,
        startTime: null,
        elapsedSeconds: 0,
        serviceId: "",
        serviceName: "",
      });
      setAddOns([]);

      toast({
        title: isUnprofitable ? "⚠️ ¡Atención!" : "✅ Servicio registrado",
        description: isUnprofitable 
          ? "Este servicio no fue rentable. Revisa los detalles."
          : `Ganancia: $${profit.toFixed(0)}`,
        variant: isUnprofitable ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Error al guardar el servicio",
        description: error.message || "Inténtalo nuevamente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTimerState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      serviceId: "",
      serviceName: "",
    });
    setShowResult(false);
    setLastResult(null);
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Timer className="h-8 w-8 text-primary" />
            Servicio en Curso
          </h1>
          <p className="text-muted-foreground mt-1">
            Cronometra tu trabajo para conocer la rentabilidad real
          </p>
        </div>

        {/* Timer Display */}
        <Card className={`shadow-card animate-fade-in overflow-hidden ${
          timerState.isRunning ? 'border-primary border-2' : ''
        }`}>
          <div className={`p-8 text-center ${
            timerState.isRunning ? 'gradient-primary text-primary-foreground' : 'bg-muted/50'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className={`h-6 w-6 ${timerState.isRunning ? 'animate-pulse' : ''}`} />
              {timerState.isRunning && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {timerState.serviceName}
                </Badge>
              )}
            </div>
            <div className="text-6xl md:text-7xl font-bold font-mono tracking-wider">
              {formatTime(timerState.elapsedSeconds)}
            </div>
            {timerState.isRunning && service && (
              <p className="mt-4 opacity-80">
                Tiempo estimado: {service.estimatedMinutes} min
                {timerState.elapsedSeconds > service.estimatedMinutes * 60 && (
                  <span className="ml-2 text-yellow-200">
                    ⚠️ Excedido
                  </span>
                )}
              </p>
            )}
          </div>
        </Card>

        {/* Service Selection - only when not running */}
        {!timerState.isRunning && (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle>Configurar Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Servicio</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} - ${s.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>¿Quién realiza el servicio?</Label>
                  <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.filter((m) => m.isActive).map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {m.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 opacity-50">
                  <Label>Cliente (Opcional)</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Próximamente" />
                    </SelectTrigger>
                    <SelectContent>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {service && (
                <div className="p-4 rounded-xl bg-primary/10">
                  <div className="flex items-center justify-between">
                    <span>Tiempo estimado:</span>
                    <span className="font-bold">{service.estimatedMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span>Costo materiales:</span>
                    <span className="font-bold">${service.materialCost}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add-ons - while running */}
        {timerState.isRunning && (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Add-Ons Extra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {addOnOptions.map((addOn) => {
                  const isSelected = addOns.includes(addOn.id);
                  return (
                    <div
                      key={addOn.id}
                      onClick={() => {
                        setAddOns((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== addOn.id)
                            : [...prev, addOn.id]
                        );
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isSelected} />
                        <span className="font-medium text-sm">{addOn.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">+${addOn.price}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method - while running */}
        {timerState.isRunning && (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as "cash" | "card" | "transfer")}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { id: "cash", name: "Efectivo", icon: Banknote },
                  { id: "card", name: "Tarjeta", icon: CreditCard },
                  { id: "transfer", name: "Transferencia", icon: Smartphone },
                ].map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <Label
                      htmlFor={method.id}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <method.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          {!timerState.isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="flex-1 h-16 text-lg shadow-button"
              disabled={!selectedService || !selectedTeamMember}
            >
              <Play className="mr-2 h-6 w-6" />
              INICIAR SERVICIO
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              size="lg"
              variant="destructive"
              className="flex-1 h-16 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Square className="mr-2 h-6 w-6" />
              )}
              {isSubmitting ? "GUARDANDO..." : "FINALIZAR"}
            </Button>
          )}
        </div>

        {/* Result Modal */}
        {showResult && lastResult && (
          <Card className={`shadow-card animate-scale-in ${
            lastResult.isUnprofitable ? 'border-destructive border-2' : 'border-green-500 border-2'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastResult.isUnprofitable ? (
                  <>
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    Alerta de Rentabilidad
                  </>
                ) : (
                  <>
                    <Check className="h-6 w-6 text-green-500" />
                    ¡Servicio Rentable!
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Tiempo Real</p>
                  <p className={`text-2xl font-bold ${
                    lastResult.realMinutes > lastResult.estimatedMinutes ? 'text-destructive' : ''
                  }`}>
                    {lastResult.realMinutes} min
                  </p>
                  <p className="text-xs text-muted-foreground">
                    vs {lastResult.estimatedMinutes} estimados
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Cobrado</p>
                  <p className="text-2xl font-bold">${lastResult.chargedAmount}</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl text-center ${
                lastResult.profit >= 0 ? 'bg-green-100' : 'bg-destructive/10'
              }`}>
                <p className="text-sm">
                  {lastResult.profit >= 0 ? 'Ganancia' : 'Pérdida'}
                </p>
                <p className={`text-3xl font-bold ${
                  lastResult.profit >= 0 ? 'text-green-600' : 'text-destructive'
                }`}>
                  {lastResult.profit >= 0 ? '+' : ''}${lastResult.profit.toFixed(0)}
                </p>
              </div>

              {lastResult.isUnprofitable && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">
                      Este servicio tomó {lastResult.realMinutes} min y cobraste ${lastResult.chargedAmount}.
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Ganaste menos de tu costo por hora. ¡Considera ajustar el precio o mejorar tu tiempo!
                    </p>
                  </div>
                </div>
              )}

              <Button onClick={handleReset} className="w-full">
                Nuevo Servicio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

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
  Plus,
  X,
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

export interface SessionData {
  id: string;
  servicio_nombre: string;
  precio_estimado: number;
  tiempo_estimado_min: number;
  inicio: string;
}

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  serviceId: string;
  serviceName: string;
  sesion_id?: string;
  sesionActiva?: SessionData | null;
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
  const [adicionales, setAdicionales] = useState<any[]>([]);
  const [adicionalSeleccionado, setAdicionalSeleccionado] = useState('');
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState<any[]>([]);

  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    realMinutes: number;
    estimatedMinutes: number;
    chargedAmount: number;
    profit: number;
    isUnprofitable: boolean;
  } | null>(null);

  const { user, loading: authLoading } = useAuth();
  const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) ?? 'https://us-central1-entaltek-manicura.cloudfunctions.net/api';

  // Fetch data on mount, waiting for user
  useEffect(() => {
    let mounted = true;
    
    // Si no hay usuario o Firebase sigue cargando la sesión, no hacer fetch
    if (!user || authLoading) return;

    const loadData = async () => {
      try {
        const token = await user.getIdToken();
        const [servicesData, membersData, adicionalesRes] = await Promise.all([
          getServices(),
          teamMemberService.getAll(),
          fetch(`${API_URL}/adicionales`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
        ]);
        
        if (mounted) {
          setServices(servicesData);
          setTeamMembers(membersData);
          setAdicionales(adicionalesRes.data?.items ?? []);
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

  const handleAgregarAdicional = () => {
    const a = adicionales.find(x => x.id === adicionalSeleccionado);
    if (!a) return;
    if (adicionalesSeleccionados.find(x => x.id === a.id)) {
      toast({ 
        title: "Ya agregado", 
        description: `${a.nombre} ya está en la lista`,
        variant: "destructive" 
      });
      return;
    }
    setAdicionalesSeleccionados([...adicionalesSeleccionados, a]);
    setAdicionalSeleccionado('');
  };

  const handleRemoverAdicional = (idx: number) => {
    setAdicionalesSeleccionados(
      adicionalesSeleccionados.filter((_, i) => i !== idx)
    );
  };

  const [isSubmittingStart, setIsSubmittingStart] = useState(false);

  const handleStart = async () => {
    if (!selectedService || !selectedTeamMember) {
      toast({
        title: "Faltan datos",
        description: "Selecciona un servicio y quién lo realizará.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingStart(true);
    try {
      const token = await user?.getIdToken();
      const payload = {
        servicio_id:     selectedService,
        trabajador_id:   selectedTeamMember || null,
        cliente_id:      selectedClient || null,
        adicionales_ids: adicionalesSeleccionados.map(a => a.id),
      };

      const res = await fetch(`${API_URL}/sesiones/iniciar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      let sesion_id = undefined;
      let sesionActiva = null;

      if (res.ok && data.status === 1) {
         sesion_id = data.data?.id;
         sesionActiva = data.data;
         setAdicionalesSeleccionados([]);
      } else {
         toast({ title: "Error iniciando API Sesion", description: data.message, variant: "destructive" });
         setIsSubmittingStart(false);
         return; // Force abort if we fail the backend strict flow over allowing optimistic timers
      }

      const serviceName = service?.name || "";
      setTimerState({
        isRunning: true,
        startTime: Date.now(),
        elapsedSeconds: 0,
        serviceId: selectedService,
        serviceName,
        sesion_id,
        sesionActiva,
      });

      toast({
        title: "⏱️ ¡Servicio iniciado!",
        description: `Cronómetro rodando para: ${serviceName}`,
      });
    } catch (e: any) {
      toast({ title: "Error de conexión", description: e.message || "No se pudo contactar al servidor.", variant: "destructive" });
    } finally {
      setIsSubmittingStart(false);
    }
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
      <div className="w-full xl:max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col pt-2 pb-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 mb-4 mt-4 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3 tracking-tight">
            <Timer className="h-8 w-8 text-primary" strokeWidth={2.5} />
            Servicio en Curso
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
            Cronometra tu trabajo y gestiona adicionales para conocer la rentabilidad real
          </p>
        </div>

        {/* Global Active Session Banner */}
        {timerState.sesionActiva && !showResult && (
          <div className="w-full mb-6 mt-1 shrink-0 animate-fade-in">
            <div className="flex items-center justify-between p-3.5 bg-green-50/80 border border-green-200/80 rounded-2xl shadow-sm text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-green-700">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm" />
                <span className="font-bold tracking-tight">
                  Sesión activa — {timerState.sesionActiva.servicio_nombre}
                </span>
              </div>
              <div className="flex items-center gap-3 text-green-700">
                <span className="font-semibold opacity-90 hidden sm:inline">Estimado: <span className="font-black">${timerState.sesionActiva.precio_estimado}</span></span>
                <span className="font-mono font-black text-base bg-white/80 px-2 py-0.5 rounded-lg border border-green-200/50 shadow-sm">
                  {formatTime(timerState.elapsedSeconds)}
                </span>
              </div>
            </div>
          </div>
        )}

        {showResult && lastResult ? (
          /* RESULT MODAL COMPLETAMENTE CENTRADO */
          <div className="flex-1 flex flex-col items-center pt-8 animate-scale-in">
            <Card className={`w-full max-w-2xl shadow-2xl border-2 ${
              lastResult.isUnprofitable ? 'border-destructive' : 'border-green-500'
            }`}>
              <CardHeader className="bg-muted/10 border-b p-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  {lastResult.isUnprofitable ? (
                    <>
                      <AlertTriangle className="h-7 w-7 text-destructive" />
                      Alerta de Rentabilidad
                    </>
                  ) : (
                    <>
                      <Check className="h-7 w-7 text-green-500" />
                      ¡Servicio Rentable!
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 px-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-muted/40 text-center border shadow-sm">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Tiempo Real</p>
                    <p className={`text-4xl font-black tracking-tight ${
                      lastResult.realMinutes > lastResult.estimatedMinutes ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {lastResult.realMinutes} <span className="text-sm tracking-normal">min</span>
                    </p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                      vs {lastResult.estimatedMinutes} estimados
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/40 text-center border shadow-sm">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Cobrado</p>
                    <p className="text-4xl font-black tracking-tight text-foreground"><span className="text-sm tracking-normal font-bold mr-0.5">$</span>{lastResult.chargedAmount}</p>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl text-center border shadow-sm ${
                  lastResult.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-destructive/5 border-destructive/20'
                }`}>
                  <p className="text-[12px] uppercase tracking-widest font-black mb-1 opacity-70">
                    {lastResult.profit >= 0 ? 'Ganancia Neta' : 'Pérdida'}
                  </p>
                  <p className={`text-5xl tracking-tighter font-black ${
                    lastResult.profit >= 0 ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {lastResult.profit >= 0 ? '+' : ''}${lastResult.profit.toFixed(0)}
                  </p>
                </div>

                {lastResult.isUnprofitable && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mt-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-bold text-destructive">
                        Este servicio tomó {lastResult.realMinutes} min y cobraste ${lastResult.chargedAmount}.
                      </p>
                      <p className="text-muted-foreground mt-1 font-medium">
                        Ganaste menos de tu costo por hora. ¡Considera ajustar el precio o mejorar tu tiempo!
                      </p>
                    </div>
                  </div>
                )}

                <Button onClick={handleReset} className="w-full h-14 text-lg font-bold shadow-lg mt-4">
                  Nuevo Servicio
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* WORKSPACE GRID */
          <div className="flex flex-col flex-1 h-full min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 xl:gap-8 flex-1 min-h-0 overflow-y-auto pr-2 pb-4 layout-scrollbar">
              
              {/* === COLUMNA IZQUIERDA === */}
              <div className="flex flex-col gap-6">
                
                {/* 1. Cronómetro Gigante */}
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-sm rounded-[2rem] p-8 gap-2 relative overflow-hidden group shrink-0">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground z-10">
                    {timerState.isRunning && timerState.serviceName ? timerState.serviceName : 'Tiempo en servicio'}
                  </p>
                  <p className={`text-[80px] leading-none md:text-[100px] font-black tracking-tighter text-foreground tabular-nums z-10 my-2 ${timerState.isRunning ? 'animate-pulse text-primary drop-shadow-sm' : ''}`}>
                    {formatTime(timerState.elapsedSeconds)}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-black tracking-widest uppercase z-10">minutos : segundos</p>
                  
                  {timerState.isRunning && service && timerState.elapsedSeconds > service.estimatedMinutes * 60 && (
                    <span className="absolute top-5 right-5 text-[10px] font-black uppercase tracking-widest text-destructive bg-destructive/10 px-3 py-1.5 rounded-full animate-bounce shadow-sm">
                      ⚠️ Excedido
                    </span>
                  )}
                </div>

                {/* 2. Configurar Servicio (Solo !isRunning) */}
                {!timerState.isRunning && (
                  <Card className="shadow-sm border-muted/60 animate-fade-in shrink-0">
                    <CardHeader className="p-4 pb-3 border-b bg-muted/5">
                      <CardTitle className="text-sm flex items-center gap-2 font-bold">
                        <Square className="h-4 w-4 opacity-70" /> Configurar Servicio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      {/* Servicio Base */}
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Servicio Base</Label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger className="h-12 shadow-sm border-muted-foreground/20 font-medium">
                            <SelectValue placeholder="Selecciona un servicio..." />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <div className="flex justify-between items-center w-full gap-4">
                                  <span className="font-semibold">{s.name}</span>
                                  <span className="text-primary font-bold">${s.basePrice}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Team + Client */}
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">¿Quién realiza?</Label>
                          <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
                            <SelectTrigger className="h-12 shadow-sm border-muted-foreground/20 font-medium">
                              <SelectValue placeholder="Técnica..." />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.filter((m) => m.isActive).map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  <div className="flex items-center gap-2 font-semibold">
                                    <User className="h-3.5 w-3.5 opacity-60" />
                                    {m.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 opacity-50">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Cliente (Opcional)</Label>
                          <Select value={selectedClient} onValueChange={setSelectedClient} disabled>
                            <SelectTrigger className="h-12 shadow-sm border-muted-foreground/20">
                              <SelectValue placeholder="Próximamente" />
                            </SelectTrigger>
                            <SelectContent></SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Info Resumen */}
                      {service && (
                        <div className="grid grid-cols-2 gap-px bg-border rounded-xl overflow-hidden mt-2 shadow-sm border">
                          <div className="text-center p-3.5 bg-muted/20">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">
                              Estimado
                            </p>
                            <p className="text-2xl font-black text-primary leading-none tracking-tight">{service.estimatedMinutes} <span className="text-sm font-bold text-muted-foreground tracking-normal">min</span></p>
                          </div>
                          <div className="text-center p-3.5 bg-muted/20">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">
                              Insumos
                            </p>
                            <p className="text-2xl font-black text-foreground leading-none tracking-tight"><span className="text-sm font-bold text-muted-foreground mr-0.5 tracking-normal">$</span>{service.materialCost}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 3. Método de Pago (isRunning) */}
                {timerState.isRunning && (
                  <Card className="shadow-sm border-muted/60 animate-fade-in shrink-0">
                    <CardHeader className="p-4 pb-3 border-b bg-muted/5">
                      <CardTitle className="text-sm font-bold">Método de Pago</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) => setPaymentMethod(v as "cash" | "card" | "transfer")}
                        className="grid grid-cols-3 gap-4"
                      >
                        {[
                          { id: "cash", name: "Efectivo", icon: Banknote },
                          { id: "card", name: "Tarjeta", icon: CreditCard },
                          { id: "transfer", name: "Transfer.", icon: Smartphone },
                        ].map((method) => (
                          <div key={method.id} className="relative">
                            <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                            <Label
                              htmlFor={method.id}
                              className={`flex flex-col items-center justify-center gap-2 p-4 h-[90px] rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === method.id
                                  ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20 ring-offset-1"
                                  : "border-border hover:border-primary/50 text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              <method.icon className="h-6 w-6" />
                              <span className="text-[10px] uppercase font-black tracking-wider text-center">{method.name}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* === COLUMNA DERECHA === */}
              <div className="flex flex-col gap-6 h-full min-h-0">
                
                {/* 4. Nuevo Adicionales Selector (Solo !isRunning y seleccionado) */}
                {!timerState.isRunning && selectedService && (
                  <Card className="shadow-sm border border-muted/60 flex flex-col h-full animate-fade-in overflow-hidden">
                    <CardHeader className="p-4 pb-3 border-b bg-muted/5 shrink-0">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold">
                          <Sparkles className="h-4 w-4 text-primary" /> Adicionales al Servicio
                        </span>
                        <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground bg-white px-2 py-0.5 rounded-full border shadow-sm">
                          Opcional
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col flex-1 min-h-[300px] overflow-hidden">
                      
                      {/* Selector */}
                      <div className="flex gap-2 mb-2 shrink-0">
                        <Select
                          value={adicionalSeleccionado}
                          onValueChange={setAdicionalSeleccionado}
                        >
                          <SelectTrigger className="flex-1 h-12 shadow-sm border-muted-foreground/20 font-medium">
                            <SelectValue placeholder="Agregar técnica o aplicación..." />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Grupo Técnicas */}
                            {adicionales.filter(a => a.tipo === 'tecnica').length > 0 && (
                              <>
                                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50/50 mt-1">
                                  ✦ Técnicas
                                </div>
                                {adicionales.filter(a => a.tipo === 'tecnica').map(a => (
                                  <SelectItem key={a.id} value={a.id}>
                                    <div className="flex items-center justify-between w-[250px] sm:w-[300px] gap-4 py-0.5">
                                      <span className="font-semibold whitespace-normal truncate">{a.nombre}</span>
                                      <span className="text-xs font-bold text-muted-foreground shrink-0 border bg-muted/20 px-1.5 py-0.5 rounded">
                                        +${a.precio_base} · +{a.tiempo_extra_min}min
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </>
                            )}

                            {/* Grupo Aplicaciones */}
                            {adicionales.filter(a => a.tipo === 'aplicacion').length > 0 && (
                              <>
                                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-pink-700 bg-pink-50/50 mt-1 border-t">
                                  💎 Aplicaciones
                                </div>
                                {adicionales.filter(a => a.tipo === 'aplicacion').map(a => (
                                  <SelectItem key={a.id} value={a.id}>
                                    <div className="flex items-center justify-between w-[250px] sm:w-[300px] gap-4 py-0.5">
                                      <span className="font-semibold whitespace-normal truncate">{a.nombre}</span>
                                      <span className="text-xs font-bold text-muted-foreground shrink-0 border bg-muted/20 px-1.5 py-0.5 rounded">
                                        +${a.precio_base} · +{a.tiempo_extra_min}min
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>

                        <Button onClick={handleAgregarAdicional} disabled={!adicionalSeleccionado} variant="default" className="shrink-0 h-12 px-5 shadow-sm">
                          <Plus className="h-4 w-4 mr-1.5" /> Agregar
                        </Button>
                      </div>

                      {/* Lista scrollable */}
                      <div className="flex-1 overflow-y-auto pr-2 pt-2 pb-4 space-y-2 layout-scrollbar">
                        {adicionalesSeleccionados.map((a, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border shadow-sm group hover:border-border/80 transition-all text-sm animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] flex items-center justify-center font-bold h-6 w-6 rounded-full border shadow-sm ${
                                a.tipo === 'tecnica' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-pink-50 text-pink-700 border-pink-200'
                              }`}>
                                {a.tipo === 'tecnica' ? '✦' : '💎'}
                              </span>
                              <span className="font-bold text-xs text-foreground">{a.nombre}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex shadow-sm rounded-lg overflow-hidden border divide-x">
                                <span className="text-[11px] font-black text-primary px-2 py-1 bg-primary/5">
                                  +${a.precio_base}
                                </span>
                                <span className="text-[11px] font-black text-muted-foreground px-2 py-1 bg-muted/20">
                                  +{a.tiempo_extra_min}m
                                </span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 border shadow-sm bg-white shrink-0" onClick={() => handleRemoverAdicional(idx)}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {adicionalesSeleccionados.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center border-2 border-dashed rounded-2xl bg-muted/10 opacity-70">
                            <p className="text-4xl opacity-50 mb-3 hover:scale-110 transition-transform">✨</p>
                            <p className="text-sm font-bold text-muted-foreground">
                              Sin adicionales aún
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground opacity-70 mt-1 max-w-[200px]">
                              Agrega técnicas o decoraciones extra para aumentar el valor del ticket.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Sticky Footer Total */}
                      {adicionalesSeleccionados.length > 0 && (
                        <div className="shrink-0 pt-4 border-t space-y-3 mt-auto bg-card">
                          <div className="space-y-1.5 px-2">
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                              <span>Precio base ({service?.name})</span>
                              <span className="font-mono text-sm">${service?.basePrice ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                              <span>Adicionales ({adicionalesSeleccionados.length})</span>
                              <span className="font-mono text-primary text-sm">+${adicionalesSeleccionados.reduce((acc, curr) => acc + curr.precio_base, 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                              <span>Tiempo extra est.</span>
                              <span className="font-mono text-sm">+{adicionalesSeleccionados.reduce((acc, curr) => acc + curr.tiempo_extra_min, 0)}m</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center p-4 bg-primary rounded-xl shadow-lg border-2 border-primary-foreground/10 text-primary-foreground">
                            <span className="font-black text-sm uppercase tracking-widest">Total Estimado</span>
                            <span className="text-3xl font-black tabular-nums tracking-tighter">
                              ${(service?.basePrice ?? 0) + adicionalesSeleccionados.reduce((acc, curr) => acc + curr.precio_base, 0)}
                            </span>
                          </div>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                )}

                {/* Legacy Add-Ons Extra (Durante isRunning) */}
                {timerState.isRunning && (
                  <Card className="shadow-sm border-muted/60 animate-fade-in shrink-0">
                    <CardHeader className="p-4 pb-3 border-b bg-muted/5">
                      <CardTitle className="flex items-center gap-2 text-sm font-bold">
                        <Sparkles className="h-4 w-4 text-accent" />
                        Add-Ons Rápidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 gap-3">
                        {addOnOptions.map((addOn) => {
                          const isSelected = addOns.includes(addOn.id);
                          return (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                setAddOns((prev) =>
                                  isSelected ? prev.filter((id) => id !== addOn.id) : [...prev, addOn.id]
                                );
                              }}
                              className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-accent bg-accent/5 shadow-sm text-accent"
                                  : "border-border hover:border-accent/40 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox checked={isSelected} className={isSelected ? "border-accent text-accent data-[state=checked]:bg-accent data-[state=checked]:text-white" : ""} />
                                <span className="font-bold text-xs">{addOn.name}</span>
                              </div>
                              <span className="text-[10px] font-black opacity-80">+${addOn.price}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
              </div>
            </div>

            {/* MAIN CTA TETHERED TO BOTTOM */}
            <div className="shrink-0 mt-6 pt-2 border-t flex items-end">
              {!timerState.isRunning ? (
                <Button
                  onClick={handleStart}
                  className="w-full h-[68px] text-lg tracking-widest font-black uppercase shadow-xl transition-all hover:scale-[1.01] bg-foreground hover:bg-foreground/90 text-background rounded-2xl"
                  disabled={!selectedService || !selectedTeamMember || isSubmittingStart}
                >
                  {isSubmittingStart ? (
                    <Loader2 className="mr-3 h-6 w-6 animate-spin opacity-80" />
                  ) : (
                    <Play className="mr-3 h-6 w-6 fill-current opacity-80" />
                  )}
                  {isSubmittingStart ? "INICIANDO..." : "INICIAR SERVICIO"}
                </Button>
              ) : (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="w-full h-[68px] text-lg tracking-widest font-black uppercase shadow-xl transition-all hover:scale-[1.01] rounded-2xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-3 h-6 w-6 animate-spin opacity-80" />
                  ) : (
                    <Square className="mr-3 h-6 w-6 fill-current opacity-80" />
                  )}
                  {isSubmitting ? "GUARDANDO..." : "FINALIZAR SERVICIO"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

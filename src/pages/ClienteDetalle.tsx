import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Clock, Pencil, Loader2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://us-central1-entaltek-manicura.cloudfunctions.net/api";

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [cliente, setCliente] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false); // To handle edit form later

  const fetchCliente = async () => {
    try {
      if (!user) return;
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setCliente(data.data);
        setHistorial(data.data.historial_sesiones ?? []);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error al cargar el cliente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) fetchCliente();
  }, [id, user]);

  const handleCambiarTipo = async (nuevoTipo: "nuevo" | "frecuente") => {
    try {
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/clientes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo: nuevoTipo }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setCliente((prev: any) => ({ ...prev!, tipo: nuevoTipo }));
        toast({ title: `Cliente marcado como ${nuevoTipo}` });
      }
    } catch {
      toast({ title: "Error al actualizar tipo", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!cliente) {
    return (
      <MainLayout>
        <div className="w-full flex flex-col items-center justify-center p-12">
          <p className="text-xl text-muted-foreground mb-4">Cliente no encontrado</p>
          <Button onClick={() => navigate("/clientes")}>Volver a Clientes</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full px-6 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/clientes")}
            className="hover:text-primary flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Clientes
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">
            {cliente?.nombre} {cliente?.apellido_paterno}
          </span>
        </div>

        {/* Header del cliente */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-start mb-6">
          {/* Avatar grande */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary uppercase">
            {cliente?.nombre?.[0]}
          </div>

          {/* Info básica */}
          <div>
            <h1 className="text-2xl font-bold">
              {cliente?.nombre} {cliente?.apellido_paterno} {cliente?.apellido_materno}
            </h1>
            <p className="text-muted-foreground">{cliente?.telefono}</p>
            {cliente?.correo && (
              <p className="text-muted-foreground text-sm">{cliente?.correo}</p>
            )}

            {/* Badge de tipo */}
            <div className="flex items-center gap-2 mt-2">
              <Select value={cliente?.tipo} onValueChange={handleCambiarTipo}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">
                    <span className="flex items-center gap-1">🆕 Nuevo</span>
                  </SelectItem>
                  <SelectItem value="frecuente">
                    <span className="flex items-center gap-1">⭐ Frecuente</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                (calculado automático, editable manualmente)
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            {/* The edit button could trigger a modal form if needed. We'll leave it simple for now */}
            <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
            </Button>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Gasto Total</p>
            <p className="text-2xl font-bold text-primary">
              ${cliente?.gasto_total?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Sesiones</p>
            <p className="text-2xl font-bold">{cliente?.sesiones_total}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Última visita</p>
            <p className="text-lg font-bold">
              {cliente?.ultima_visita
                ? new Date(cliente.ultima_visita).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC"
                  })
                : "—"}
            </p>
          </Card>
        </div>

        {/* Historial de Sesiones */}
        <Card>
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Historial de Sesiones
              <Badge variant="secondary" className="ml-auto">
                {historial.length} sesiones
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">

            {historial.length === 0 && (
              <div className="flex flex-col items-center justify-center 
                              py-12 text-muted-foreground">
                <Clock className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Sin sesiones registradas aún</p>
              </div>
            )}

            {historial.map((sesion, i) => (
              <div key={i} className="p-4 hover:bg-muted/20 transition-colors">
                
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Servicio + fecha */}
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-sm">{sesion.servicio_nombre}</p>
                      <span className="text-xs text-muted-foreground">
                        📅 {sesion.fecha 
                          ? new Date(sesion.fecha).toLocaleDateString('es-MX', {
                              day:   'numeric',
                              month: 'long',
                              year:  'numeric',
                              timeZone: 'UTC'
                            })
                          : '—'}
                      </span>
                    </div>

                    {/* Adicionales */}
                    {sesion.adicionales?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {sesion.adicionales.map((a: any, j: number) => (
                          <span key={j} className={`text-[10px] px-2 py-0.5 
                                                    rounded-full font-medium ${
                            a.tipo === 'tecnica'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {a.tipo === 'tecnica' ? '✦' : '💎'} {a.nombre}
                            {a.precio > 0 && ` +$${a.precio}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadatos en fila */}
                    <div className="flex flex-wrap items-center gap-3 text-xs 
                                    text-muted-foreground">
                      
                      {/* Duración real vs estimada */}
                      {sesion.duracion_real_min && (
                        <span className="flex items-center gap-1">
                          ⏱️ {sesion.duracion_real_min} min reales
                          {sesion.duracion_estimada && (
                            <span className={
                              sesion.duracion_real_min > sesion.duracion_estimada
                                ? 'text-amber-500 font-medium'
                                : 'text-green-600 font-medium'
                            }>
                              ({sesion.duracion_real_min > sesion.duracion_estimada
                                ? `+${sesion.duracion_real_min - sesion.duracion_estimada} sobre estimado`
                                : `${sesion.duracion_estimada - sesion.duracion_real_min} min antes`
                              })
                            </span>
                          )}
                        </span>
                      )}

                      {/* Quién realizó */}
                      {sesion.trabajador_nombre && (
                        <span className="flex items-center gap-1">
                          💅 {sesion.trabajador_nombre}
                        </span>
                      )}

                      {/* Método de pago */}
                      {sesion.metodo_pago && (
                        <span className="flex items-center gap-1 capitalize
                                          bg-muted px-2 py-0.5 rounded-full">
                          {sesion.metodo_pago === 'efectivo'  ? '💵' :
                           sesion.metodo_pago === 'tarjeta'   ? '💳' :
                           sesion.metodo_pago === 'transfer'  ? '📱' : '💰'}
                          {' '}{sesion.metodo_pago}
                        </span>
                      )}

                    </div>
                  </div>

                  {/* Precio — columna derecha */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-primary">
                      ${sesion.precio_cobrado?.toLocaleString('es-MX', 
                        { minimumFractionDigits: 2 })}
                    </p>
                    {/* Desglose si hay adicionales */}
                    {sesion.precio_adicionales > 0 && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Base: ${(sesion.precio_cobrado - sesion.precio_adicionales)
                          ?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        <p>+Extras: ${sesion.precio_adicionales
                          ?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}

          </CardContent>

          {/* Footer con totales */}
          {historial.length > 0 && (
            <div className="p-4 border-t bg-muted/10 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total gastado</p>
                <p className="font-bold text-primary">
                  ${historial.reduce((s, h) => s + (h.precio_cobrado || 0), 0)
                    .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ticket promedio</p>
                <p className="font-bold">
                  ${(historial.reduce((s, h) => s + (h.precio_cobrado || 0), 0) / historial.length)
                    .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tiempo promedio</p>
                <p className="font-bold">
                  {Math.round(
                    historial.filter(h => h.duracion_real_min)
                      .reduce((s, h) => s + (h.duracion_real_min ?? 0), 0) /
                    (historial.filter(h => h.duracion_real_min).length || 1)
                  )} min
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

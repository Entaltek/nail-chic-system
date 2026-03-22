import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Search, Pencil, Trash2, Eye, Users, MoreVertical, AlertCircle, UserPlus, RefreshCw, Calendar, DollarSign, Clock, CheckCircle2, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientFormDialog } from "@/components/clientes/ClientFormDialog";
import { useAuth } from "@/auth/AuthProvider";

// --- Types ---
type FilterType = "Todos" | "Nuevo" | "Frecuente";
type ViewState = "loading" | "error" | "empty" | "data";

interface Cliente {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  correo: string | null;
  telefono: string;
  tipo: "nuevo" | "frecuente";
}

interface SesionHistorial {
  id: string;
  fecha: string;
  servicio_nombre: string;
  duracion_minutos: number;
  precio_total: number;
  adicionales: string[];
}

interface ClienteDetalle extends Cliente {
  sesiones_total: number;
  gasto_total: number;
  ultima_visita: string | null;
  historial_sesiones: SesionHistorial[];
}

// Simple debounce
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const fullName = (c: Cliente) => `${c.nombre} ${c.apellido_paterno} ${c.apellido_materno || ""}`.trim();

export default function Clientes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://us-central1-entaltek-manicura.cloudfunctions.net/api';

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [viewState, setViewState] = useState<ViewState>("loading");
  
  const [addOpen, setAddOpen] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);

  // Fetch logic
  const fetchClientes = useCallback(async (filtroTipo?: 'nuevo' | 'frecuente', searchTerm?: string) => {
    if (!user) return;
    setViewState("loading");
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (filtroTipo) params.set('tipo', filtroTipo);
      if (searchTerm) params.set('search', searchTerm);
      
      const res = await fetch(`${API_URL}/clientes?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        const list = data.data ?? [];
        setClientes(list);
        setTotal(data.meta?.total ?? list.length);
        setViewState(list.length > 0 || searchTerm || filtroTipo ? "data" : "empty");
      } else {
        setViewState("error");
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      console.error(error);
      setViewState("error");
      toast({ title: "Error de conexión", description: "No se pudieron cargar los clientes", variant: "destructive" });
    }
  }, [user, API_URL]);

  useEffect(() => {
    const apiFiltro = filter === "Todos" ? undefined : filter.toLowerCase() as "nuevo" | "frecuente";
    fetchClientes(apiFiltro, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user]); // Run when filter or user changes

  // Debounced search trigger
  const debouncedFetchRef = useRef(
    debounce((filtroActivo: FilterType, texto: string, fetchFn: typeof fetchClientes) => {
      const apiFiltro = filtroActivo === "Todos" ? undefined : filtroActivo.toLowerCase() as "nuevo" | "frecuente";
      fetchFn(apiFiltro, texto);
    }, 400)
  );

  const handleSearchChange = (val: string) => {
    setSearch(val);
    debouncedFetchRef.current(filter, val, fetchClientes);
  };

  const handleEdit = (c: Cliente) => {
    setEditClientId(c.id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/clientes/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.status === 'success') {
        toast({ title: "Cliente eliminado" });
        fetchClientes(filter === "Todos" ? undefined : filter.toLowerCase() as "nuevo" | "frecuente", search);
      } else {
        toast({ title: "No se puede eliminar", description: data.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: "No se pudo eliminar el cliente", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleView = (c: Cliente) => {
    navigate(`/clientes/${c.id}`);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  // --- Sub-renders ---
  const renderLoading = () => (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <p className="font-semibold text-foreground">No se pudo cargar clientes</p>
        <p className="text-sm text-muted-foreground mt-1">Verifica tu conexión e intenta de nuevo</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => fetchClientes(filter === "Todos" ? undefined : filter.toLowerCase() as "nuevo" | "frecuente", search)}>
        <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
      </Button>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">Sin clientes aún</p>
        <p className="text-sm text-muted-foreground mt-1">Agrega tu primer cliente para comenzar</p>
      </div>
      <Button size="sm" onClick={() => setAddOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" /> Agregar cliente
      </Button>
    </div>
  );

  const typeBadge = (tipo: string) => (
    <Badge
      className={
        tipo === 'frecuente'
          ? 'bg-pink-100 text-pink-700 border-pink-200 pointer-events-none'
          : 'bg-gray-100 text-gray-600 border-gray-200 pointer-events-none'
      }
      variant="outline"
    >
      {tipo === 'frecuente' ? 'Frecuente' : 'Nuevo'}
    </Badge>
  );

  const actionButtons = (c: Cliente) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(c)} title="Ver">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(c)} title="Editar">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)} title="Eliminar">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const mobileActions = (c: Cliente) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleView(c)}><Eye className="h-4 w-4 mr-2" /> Ver detalle</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEdit(c)}><Pencil className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(c)}><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderDesktopTable = () => (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre(s)</TableHead>
            <TableHead>Apellido Paterno</TableHead>
            <TableHead>Apellido Materno</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((c) => (
            <TableRow key={c.id} className="cursor-pointer" onClick={() => handleView(c)}>
              <TableCell className="font-medium">{c.nombre}</TableCell>
              <TableCell>{c.apellido_paterno}</TableCell>
              <TableCell>{c.apellido_materno || <span className="text-muted-foreground italic">-</span>}</TableCell>
              <TableCell>{c.telefono}</TableCell>
              <TableCell>{typeBadge(c.tipo)}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                {actionButtons(c)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderMobileCards = () => (
    <div className="md:hidden space-y-3 p-4">
      {clientes.map((c) => (
        <Card key={c.id} className="overflow-hidden" onClick={() => handleView(c)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{c.nombre}</p>
                <p className="text-sm text-muted-foreground">{c.apellido_paterno} {c.apellido_materno}</p>
                <p className="text-xs text-muted-foreground">{c.telefono}</p>
              </div>
              <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  {mobileActions(c)}
                </div>
                {typeBadge(c.tipo)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const content = () => {
    if (viewState === "loading" && clientes.length === 0) return renderLoading();
    if (viewState === "error" && clientes.length === 0) return renderError();
    if (viewState === "empty" && search === "" && filter === "Todos") return renderEmpty();
    if (clientes.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">Sin resultados</p>
          <p className="text-sm mt-1">Prueba con otro término de búsqueda o filtro</p>
        </div>
      );
    }
    return (
      <div className={viewState === "loading" ? "opacity-50 pointer-events-none" : ""}>
        {renderDesktopTable()}
        {renderMobileCards()}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Clientes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Administra tus clientes y su tipo (nuevo/frecuente)</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Agregar cliente
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-card animate-fade-in">
        <div className="p-4 border-b border-border flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {(["Todos", "Nuevo", "Frecuente"] as FilterType[]).map((f) => (
              <Badge
                key={f}
                variant={filter === f ? "default" : "outline"}
                className={cn(
                  "cursor-pointer select-none transition-colors",
                  filter === f ? "" : "hover:bg-accent"
                )}
                onClick={() => setFilter(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-auto">
            {total} cliente{total !== 1 ? "s" : ""}
          </span>
        </div>

        <CardContent className="p-0 relative min-h-[400px]">
          {content()}
        </CardContent>
      </Card>

      {/* Add & Edit form dialog */}
      <ClientFormDialog
        open={addOpen || !!editClientId}
        onOpenChange={(open) => {
          if (!open) {
            setAddOpen(false);
            setEditClientId(null);
          }
        }}
        editClientId={editClientId}
        onSuccess={() => {
          setAddOpen(false);
          setEditClientId(null);
          fetchClientes(filter === "Todos" ? undefined : filter.toLowerCase() as "nuevo" | "frecuente", search);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" /> Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar a <span className="font-semibold text-foreground">{deleteTarget ? fullName(deleteTarget) : ""}</span>?<br/>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      </div>
    </MainLayout>
  );
}

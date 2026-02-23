import { useState } from "react";
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
import { toast } from "sonner";
import {
  Plus, Search, Pencil, Trash2, Eye, Users, MoreVertical, AlertCircle, UserPlus, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientFormDialog, type ClientFormValues } from "@/components/clientes/ClientFormDialog";

// --- Types ---
type ClientType = "Nuevo" | "Frecuente";

interface Client {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipo: ClientType;
}

// --- Dummy data ---
// TODO: Reemplazar por fetch real → GET /api/clients_list
// Campos esperados: nombres, apellidoPaterno, apellidoMaterno, tipo
const initialClients: Client[] = [
  { id: "1", nombres: "María Fernanda", apellidoPaterno: "García", apellidoMaterno: "López", tipo: "Frecuente" },
  { id: "2", nombres: "Ana Sofía", apellidoPaterno: "Hernández", apellidoMaterno: "Ruiz", tipo: "Nuevo" },
  { id: "3", nombres: "Valeria", apellidoPaterno: "Martínez", apellidoMaterno: "Cano", tipo: "Frecuente" },
  { id: "4", nombres: "Lucía", apellidoPaterno: "Gómez", apellidoMaterno: "Santos", tipo: "Nuevo" },
  { id: "5", nombres: "Daniela", apellidoPaterno: "Ramírez", apellidoMaterno: "Flores", tipo: "Frecuente" },
  { id: "6", nombres: "Paola", apellidoPaterno: "Torres", apellidoMaterno: "Vega", tipo: "Nuevo" },
  { id: "7", nombres: "Ximena", apellidoPaterno: "Navarro", apellidoMaterno: "Ortiz", tipo: "Frecuente" },
  { id: "8", nombres: "Regina", apellidoPaterno: "Morales", apellidoMaterno: "Cruz", tipo: "Nuevo" },
  { id: "9", nombres: "Camila", apellidoPaterno: "Ríos", apellidoMaterno: "Chávez", tipo: "Frecuente" },
  { id: "10", nombres: "Sofía", apellidoPaterno: "Mendoza", apellidoMaterno: "Pérez", tipo: "Nuevo" },
];

type FilterType = "Todos" | "Nuevo" | "Frecuente";
type ViewState = "loading" | "error" | "empty" | "data";

const fullName = (c: Client) => `${c.nombres} ${c.apellidoPaterno} ${c.apellidoMaterno}`;

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [viewState] = useState<ViewState>("data"); // toggle for demo
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const filtered = clients.filter((c) => {
    const matchesSearch =
      search === "" ||
      fullName(c).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Todos" || c.tipo === filter;
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (c: Client) => toast.info(`Editar cliente: ${fullName(c)} (pendiente)`);
  const handleView = (c: Client) => toast.info(`Ver detalle: ${fullName(c)} (pendiente)`);
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success(`Cliente ${fullName(deleteTarget)} eliminado`);
    setDeleteTarget(null);
  };

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
      <Button variant="outline" size="sm" onClick={() => toast.info("Reintentar (pendiente)")}>
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

  const typeBadge = (tipo: ClientType) => (
    <Badge
      variant={tipo === "Frecuente" ? "default" : "secondary"}
      className={cn(
        "text-xs",
        tipo === "Frecuente"
          ? "bg-primary/15 text-primary border-primary/30"
          : "bg-accent text-accent-foreground"
      )}
    >
      {tipo}
    </Badge>
  );

  const actionButtons = (c: Client) => (
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

  const mobileActions = (c: Client) => (
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
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id} className="cursor-pointer" onClick={() => handleView(c)}>
              <TableCell className="font-medium">{c.nombres}</TableCell>
              <TableCell>{c.apellidoPaterno}</TableCell>
              <TableCell>{c.apellidoMaterno}</TableCell>
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
      {filtered.map((c) => (
        <Card key={c.id} className="overflow-hidden" onClick={() => handleView(c)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{c.nombres}</p>
                <p className="text-sm text-muted-foreground">{c.apellidoPaterno} {c.apellidoMaterno}</p>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {typeBadge(c.tipo)}
                {mobileActions(c)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const content = () => {
    if (viewState === "loading") return renderLoading();
    if (viewState === "error") return renderError();
    if (viewState === "data" && filtered.length === 0 && search === "" && filter === "Todos") return renderEmpty();
    if (viewState === "data" && filtered.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">Sin resultados</p>
          <p className="text-sm mt-1">Prueba con otro término de búsqueda o filtro</p>
        </div>
      );
    }
    return (
      <>
        {renderDesktopTable()}
        {renderMobileCards()}
      </>
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
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
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
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <CardContent className="p-0">
          {content()}
        </CardContent>
      </Card>

      {/* Add client form */}
      <ClientFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(data: ClientFormValues) => {
          const newClient: Client = {
            id: String(Date.now()),
            nombres: data.nombres,
            apellidoPaterno: data.apellidoPaterno,
            apellidoMaterno: data.apellidoMaterno || "",
            tipo: "Nuevo",
          };
          setClients((prev) => [newClient, ...prev]);
          setAddOpen(false);
          toast.success(`Cliente ${data.nombres} ${data.apellidoPaterno} registrado`);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar a <span className="font-semibold text-foreground">{deleteTarget ? fullName(deleteTarget) : ""}</span>?
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

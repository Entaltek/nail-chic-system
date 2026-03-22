import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

const formatName = (val: string) =>
  val
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());

const clientSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(nameRegex, "Solo letras y espacios"),
  apellido_paterno: z
    .string()
    .trim()
    .min(1, "El apellido paterno es requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(nameRegex, "Solo letras y espacios"),
  apellido_materno: z
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .regex(nameRegex, "Solo letras y espacios")
    .or(z.literal("")),
  correo: z
    .string()
    .trim()
    .email("Formato de correo inválido")
    .max(255, "Máximo 255 caracteres")
    .or(z.literal("")),
  telefono: z
    .string()
    .trim()
    .min(10, "Mínimo 10 dígitos")
    .max(15, "Máximo 15 dígitos")
    .regex(/^\d{10,15}$/, "Debe tener entre 10 y 15 dígitos"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

type FetchState = "idle" | "loading" | "error" | "ready";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editClientId?: string | null;
}

export function ClientFormDialog({ open, onOpenChange, onSuccess, editClientId }: ClientFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://us-central1-entaltek-manicura.cloudfunctions.net/api';

  const isEditMode = !!editClientId;
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      correo: "",
      telefono: "",
    },
    mode: "onChange",
  });

  // Fetch client data when opening in edit mode
  useEffect(() => {
    if (!open) {
      setFetchState("idle");
      return;
    }
    if (!editClientId) {
      setFetchState("ready");
      form.reset({ nombre: "", apellido_paterno: "", apellido_materno: "", correo: "", telefono: "" });
      return;
    }
    loadClient(editClientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editClientId, user]);

  const loadClient = async (id: string) => {
    if (!user) return;
    setFetchState("loading");
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/clientes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        const client = data.data;
        form.reset({
          nombre: client.nombre || "",
          apellido_paterno: client.apellido_paterno || "",
          apellido_materno: client.apellido_materno || "",
          correo: client.correo || "",
          telefono: client.telefono || ""
        });
        setFetchState("ready");
      } else {
        setFetchState("error");
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch {
      setFetchState("error");
    }
  };

  const handleSubmit = async (data: ClientFormValues) => {
    if (!user) return;
    setSubmitting(true);
    
    try {
      const token = await user.getIdToken();
      
      const payload = {
        nombre: formatName(data.nombre),
        apellido_paterno: formatName(data.apellido_paterno),
        apellido_materno: data.apellido_materno ? formatName(data.apellido_materno) : undefined,
        telefono: data.telefono,
        correo: data.correo || undefined,
      };

      const endpoint = isEditMode ? `${API_URL}/clientes/${editClientId}` : `${API_URL}/clientes`;
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (responseData.status === 'success') {
        toast({ title: isEditMode ? "Cliente actualizado" : "¡Cliente registrado! 🎉" });
        form.reset();
        onSuccess();
      } else {
        toast({ 
          title: "Error al guardar", 
          description: responseData.message || "Verifica los datos y vuelve a intentar",
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo conectar con el servidor",
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      form.reset();
      setFetchState("idle");
    }
    onOpenChange(val);
  };

  const renderLoading = () => (
    <div className="space-y-4 py-2">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <p className="font-semibold text-foreground">No se pudo cargar los datos</p>
        <p className="text-sm text-muted-foreground mt-1">Verifica tu conexión e intenta de nuevo</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => editClientId && loadClient(editClientId)}>
        <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
      </Button>
    </div>
  );

  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Nombres — full width */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre(s) *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. María Fernanda"
                  {...field}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                    field.onChange(cleaned);
                  }}
                  onBlur={(e) => { field.onChange(formatName(e.target.value)); field.onBlur(); }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="apellido_paterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Paterno *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. García"
                    {...field}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                      field.onChange(cleaned);
                    }}
                    onBlur={(e) => { field.onChange(formatName(e.target.value)); field.onBlur(); }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apellido_materno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Materno</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. López"
                    {...field}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                      field.onChange(cleaned);
                    }}
                    onBlur={(e) => { field.onChange(formatName(e.target.value)); field.onBlur(); }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="10 a 15 dígitos"
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 15))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={submitting}>Cancelar</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={submitting || (isEditMode ? (!form.formState.isDirty || !form.formState.isValid) : !form.formState.isValid)}
          >
            {submitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Actualizar" : "Guardar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica los datos del cliente y guarda los cambios"
              : "Completa los datos para registrar un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>

        {fetchState === "loading" && renderLoading()}
        {fetchState === "error" && renderError()}
        {(fetchState === "ready" || (!isEditMode && fetchState === "idle")) && renderForm()}
      </DialogContent>
    </Dialog>
  );
}

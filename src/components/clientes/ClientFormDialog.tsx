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

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

const formatName = (val: string) =>
  val
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());

const clientSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(nameRegex, "Solo letras y espacios"),
  apellidoPaterno: z
    .string()
    .trim()
    .min(1, "El apellido paterno es requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(nameRegex, "Solo letras y espacios"),
  apellidoMaterno: z
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
    .min(1, "El teléfono es requerido")
    .regex(/^\d{10,15}$/, "Debe tener entre 10 y 15 dígitos"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

/** Raw shape coming from Firebase — fields may use English names or be null */
interface FirebaseClientData {
  id: string;
  nombres?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  correo?: string | null;
  email?: string | null;
  telefono?: string | null;
  phone?: string | null;
  [key: string]: unknown;
}

type FetchState = "idle" | "loading" | "error" | "ready";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ClientFormValues) => void;
  /** When set the dialog works in edit mode */
  editClientId?: string | null;
}

// --- Simulated Firebase helpers ------------------------------------------------
// TODO: Replace with real Firebase calls
const simulateGetClient = (id: string): Promise<FirebaseClientData> =>
  new Promise((resolve) => {
    setTimeout(() => {
      // Simulated response — uses English field names & nulls on purpose
      const mockDb: Record<string, FirebaseClientData> = {
        "1": { id: "1", nombres: "María Fernanda", apellidoPaterno: "García", apellidoMaterno: "López", email: "maria@correo.com", phone: "5512345678" },
        "2": { id: "2", nombres: "Ana Sofía", apellidoPaterno: "Hernández", apellidoMaterno: "Ruiz", correo: null, telefono: "5587654321" },
        "3": { id: "3", nombres: "Valeria", apellidoPaterno: "Martínez", apellidoMaterno: "Cano", email: "valeria@mail.com", phone: "5511223344" },
        "4": { id: "4", nombres: "Lucía", apellidoPaterno: "Gómez", apellidoMaterno: null, correo: "", telefono: "5544332211" },
        "5": { id: "5", nombres: "Daniela", apellidoPaterno: "Ramírez", apellidoMaterno: "Flores", email: "dani@email.com", phone: "5566778899" },
        "6": { id: "6", nombres: "Paola", apellidoPaterno: "Torres", apellidoMaterno: "Vega", correo: null, telefono: "5599887766" },
        "7": { id: "7", nombres: "Ximena", apellidoPaterno: "Navarro", apellidoMaterno: "Ortiz", email: "ximena@test.com", phone: "5533221100" },
        "8": { id: "8", nombres: "Regina", apellidoPaterno: "Morales", apellidoMaterno: "Cruz", correo: null, telefono: "5500112233" },
        "9": { id: "9", nombres: "Camila", apellidoPaterno: "Ríos", apellidoMaterno: "Chávez", email: "camila@demo.com", phone: "5544556677" },
        "10": { id: "10", nombres: "Sofía", apellidoPaterno: "Mendoza", apellidoMaterno: "Pérez", correo: "", telefono: "5577889900" },
      };
      resolve(mockDb[id] ?? { id, nombres: "Desconocido", apellidoPaterno: "", apellidoMaterno: null, email: null, phone: "" });
    }, 800);
  });

/** Map Firebase response to form values, normalising nulls → "" and English → Spanish keys */
const mapFirebaseToForm = (data: FirebaseClientData): ClientFormValues => ({
  nombres: data.nombres ?? "",
  apellidoPaterno: data.apellidoPaterno ?? "",
  apellidoMaterno: data.apellidoMaterno ?? "",
  correo: data.correo ?? data.email ?? "",
  telefono: data.telefono ?? data.phone ?? "",
});

// -------------------------------------------------------------------------------

export function ClientFormDialog({ open, onOpenChange, onSave, editClientId }: ClientFormDialogProps) {
  const isEditMode = !!editClientId;
  const [fetchState, setFetchState] = useState<FetchState>("idle");

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
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
      form.reset({ nombres: "", apellidoPaterno: "", apellidoMaterno: "", correo: "", telefono: "" });
      return;
    }
    loadClient(editClientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editClientId]);

  const loadClient = async (id: string) => {
    setFetchState("loading");
    try {
      // TODO: Replace with real Firebase GET → doc(db, "clients", id)
      const data = await simulateGetClient(id);
      const mapped = mapFirebaseToForm(data);
      form.reset(mapped);
      setFetchState("ready");
    } catch {
      setFetchState("error");
    }
  };

  const handleSubmit = (data: ClientFormValues) => {
    // TODO: In edit mode → updateDoc(doc(db, "clients", editClientId), ...)
    // In create mode → addDoc(collection(db, "clients"), ...)
    onSave({
      ...data,
      nombres: formatName(data.nombres),
      apellidoPaterno: formatName(data.apellidoPaterno),
      apellidoMaterno: data.apellidoMaterno ? formatName(data.apellidoMaterno) : "",
    });
    form.reset();
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
          name="nombres"
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
            name="apellidoPaterno"
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
            name="apellidoMaterno"
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
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isEditMode ? (!form.formState.isDirty || !form.formState.isValid) : !form.formState.isValid}
          >
            {isEditMode ? "Actualizar" : "Guardar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
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

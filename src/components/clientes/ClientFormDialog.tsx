import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";

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

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ClientFormValues) => void;
}

export function ClientFormDialog({ open, onOpenChange, onSave }: ClientFormDialogProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      correo: "",
      telefono: "",
    },
    mode: "onTouched",
  });

  const handleSubmit = (data: ClientFormValues) => {
    onSave({
      ...data,
      nombres: formatName(data.nombres),
      apellidoPaterno: formatName(data.apellidoPaterno),
      apellidoMaterno: data.apellidoMaterno ? formatName(data.apellidoMaterno) : "",
    });
    form.reset();
  };

  const handleClose = (val: boolean) => {
    if (!val) form.reset();
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription>Completa los datos para registrar un nuevo cliente</DialogDescription>
        </DialogHeader>

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
                      onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ""))}
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
                        onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ""))}
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
                        onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ""))}
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
              <Button type="submit" disabled={!form.formState.isValid}>Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

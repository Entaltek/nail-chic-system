import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const textOnly = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

const clientSchema = z.object({
  nombres: z.string().trim()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(textOnly, "Solo letras y espacios"),
  apellidoPaterno: z.string().trim()
    .min(1, "El apellido paterno es requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(textOnly, "Solo letras y espacios"),
  apellidoMaterno: z.string().trim()
    .max(100, "Máximo 100 caracteres")
    .regex(textOnly, "Solo letras y espacios")
    .or(z.literal(""))
    .optional()
    .default(""),
  telefono: z.string().trim()
    .min(1, "El teléfono es requerido")
    .regex(/^\d{10,15}$/, "Solo dígitos, entre 10 y 15"),
  correo: z.string().trim()
    .email("Formato de correo inválido")
    .max(255, "Máximo 255 caracteres")
    .or(z.literal(""))
    .optional()
    .default(""),
});

export type ClientFormData = z.infer<typeof clientSchema>;

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ClientFormData) => void;
}

export function AddClientDialog({ open, onOpenChange, onSave }: AddClientDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onChange",
    defaultValues: { nombres: "", apellidoPaterno: "", apellidoMaterno: "", telefono: "", correo: "" },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription>Completa los datos del cliente para registrarlo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          {/* Nombre(s) - full width */}
          <div className="space-y-1.5">
            <Label htmlFor="nombres">Nombre(s) *</Label>
            <Input id="nombres" placeholder="Ej. María Fernanda" {...register("nombres")} />
            {errors.nombres && <p className="text-sm text-destructive">{errors.nombres.message}</p>}
          </div>

          {/* Grid 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
              <Input id="apellidoPaterno" placeholder="Ej. García" {...register("apellidoPaterno")} />
              {errors.apellidoPaterno && <p className="text-sm text-destructive">{errors.apellidoPaterno.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
              <Input id="apellidoMaterno" placeholder="Ej. López" {...register("apellidoMaterno")} />
              {errors.apellidoMaterno && <p className="text-sm text-destructive">{errors.apellidoMaterno.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input id="telefono" placeholder="Ej. 5551234567" inputMode="numeric" {...register("telefono")} />
              {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo</Label>
              <Input id="correo" type="email" placeholder="Ej. cliente@email.com" {...register("correo")} />
              {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!isValid}>Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

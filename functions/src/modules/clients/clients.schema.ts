import { z } from "zod";

export const createClientSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio"),

  ap_paterno: z
    .string()
    .min(1, "El apellido paterno es obligatorio"),

  ap_materno: z
    .string()
    .optional(),

  correo: z
  .string()
  .min(1, "El correo es obligatorio")
  .email({ message: "El correo no tiene un formato válido" }),
    

  telefono: z
    .string()
    .regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos"),

  tipo: z
    .string()
    .refine((val) => ["nuevo", "frecuente"].includes(val), {
      message: "El tipo debe ser 'nuevo' o 'frecuente'",
    }),
});

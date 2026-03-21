import { z } from "zod";

export const createClientSchema = z.object({
  firstName: z
    .string()
    .min(1, "El nombre es obligatorio"),

  paternalSurname: z
    .string()
    .min(1, "El apellido paterno es obligatorio"),

  maternalSurname: z
    .string()
    .optional(),

  email: z
    .string()
    .email("El correo no tiene un formato válido")
    .optional(),

  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, "El teléfono debe tener entre 10 y 15 dígitos"),

  type: z
    .enum(["nuevo", "frecuente"]),
});

export const updateClientSchema = createClientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
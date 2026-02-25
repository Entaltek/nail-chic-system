import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateBody =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const field =
          issue.path.length > 0
            ? String(issue.path[issue.path.length - 1])
            : "dato";
        let message = issue.message;

        if (issue.code === "invalid_type" && (issue as any).input === undefined) {
          message = `El campo '${field}' es obligatorio`;
        }

        if (issue.code === "invalid_value" && field === "tipo") {
          message = "El tipo debe ser 'nuevo' o 'frecuente'";
        }

        return { field, message };
      });

      res.status(400).json({
        success: false,
        message: "Error de validacion",
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };

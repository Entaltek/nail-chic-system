import express from 'express';
import { NextFunction, Request, Response } from "express";
import categoryRoutes from './modules/categories/category.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import inventoryMovementRoutes from "./modules/movement/InventoryMovement.routes";
import clientRoutes from "./modules/clients/clients.routes";

export const app = express();

app.use(express.json());
app.use('/categories', categoryRoutes);
app.use("/inventory-items", inventoryRoutes);
app.use("/inventory-movements", inventoryMovementRoutes);
app.use("/clients", clientRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Recurso no encontrado",
  });
});

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error", { error, path: req.path, method: req.method });

  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});

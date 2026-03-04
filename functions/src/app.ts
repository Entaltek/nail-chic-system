import express from 'express';
import { NextFunction, Request, Response } from "express";
import categoryRoutes from './modules/categories/category.routes';
import inventoryRoutes from "./modules/inventory/inventoryItem.routes";
import inventoryMovementRoutes from "./modules/movement/InventoryMovement.routes";
import clientRoutes from "./modules/clients/clients.routes";

export const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    system: "Nail Chic Management System",
    api_status: "Operational",
    environment: "Production",
    version: "1.0.0",
  });
});

app.use("/categories", categoryRoutes);
app.use("/inventoryItems", inventoryRoutes);
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

import express from "express";
import categoryRoutes from "./modules/categories/category.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import inventoryMovementRoutes from "./modules/movement/InventoryMovement.routes";

export const app = express();

app.use(express.json());
app.use("/categories", categoryRoutes);
app.use("/inventory-items", inventoryRoutes);
app.use("/inventory-movements", inventoryMovementRoutes);
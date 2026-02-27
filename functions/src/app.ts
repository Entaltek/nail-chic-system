import express from "express";
import categoryRoutes from "./modules/categories/category.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import inventoryMovementRoutes from "./modules/movement/InventoryMovement.routes";

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
app.use("/inventory-items", inventoryRoutes);
app.use("/inventory-movements", inventoryMovementRoutes);

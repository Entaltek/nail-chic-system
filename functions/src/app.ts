import express from "express";
import cors from "cors";

import categoryRoutes from "./modules/categories/category.routes";
import inventoryRoutes from "./modules/inventory/inventoryItem.routes";
import inventoryMovementRoutes from "./modules/movement/InventoryMovement.routes";
import superCategoryRoutes from "./modules/superCategories/superCategory.routes";
import clientRoutes from "./modules/clients/clients.routes";

import serviceRoutes from "./modules/services/service.routes";
import userPermissionRoutes from "./modules/userPermissions/userPermission.routes";
import userRoutes from "./modules/users/user.routes";
import { teamMemberRouter } from "./modules/teamMembers/teamMember.routes";
import { serviceRecordRouter } from "./modules/serviceRecords/serviceRecord.routes";

export const app = express();

/**
 * ✅ CORS
 */
const allowlist = new Set([
  "https://athleek-sys.web.app",
  "https://entaltek-manicura.web.app",
  "https://entaltek-manicura.firebaseapp.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowlist.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.use(corsMiddleware);
app.options("*", corsMiddleware);

/**
 * JSON middleware
 */
app.use(express.json());

/**
 * Rutas
 */
app.use("/categories", categoryRoutes);
app.use("/inventory-items", inventoryRoutes);
app.use("/inventory-movements", inventoryMovementRoutes);
app.use("/super-categories", superCategoryRoutes);

app.use("/clients", clientRoutes);

app.use("/services", serviceRoutes);
app.use("/user-permissions", userPermissionRoutes);
app.use("/users", userRoutes);
app.use("/team-members", teamMemberRouter);
app.use("/service-records", serviceRecordRouter);
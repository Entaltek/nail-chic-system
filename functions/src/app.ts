import express from "express";
import cors from "cors";

import categoryRoutes from "./modules/categories/category.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import inventoryMovementRoutes from "./modules/movement/InventoryMovement.routes";

export const app = express();

/**
 * ✅ CORS (poner ANTES de las rutas)
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
    // Permite requests sin Origin (Postman/curl)
    if (!origin) return callback(null, true);

    if (allowlist.has(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true, // ✅ importante (tu API ya lo está enviando)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.use(corsMiddleware);

// ✅ Responder preflight con LA MISMA config
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
import { Router } from "express";
import { InventoryController } from "./inventory.controller";
import { validateBody } from "../../middlewares/validateBody";
import { InventoryItemSchema } from "./inventory.model";

const router = Router();
const controller = new InventoryController();

router.post("/", validateBody(InventoryItemSchema), (req, res) =>
  controller.create(req, res)
);

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/low-stock", (req, res) => controller.lowStock(req, res));
router.get("/:id", (req, res) => controller.getOne(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;

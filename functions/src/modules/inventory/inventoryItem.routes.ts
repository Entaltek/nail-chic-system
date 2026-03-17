import { Router } from "express";
import { InventoryItemController } from "./inventoryItem.controller";

const router = Router();
const controller = new InventoryItemController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;

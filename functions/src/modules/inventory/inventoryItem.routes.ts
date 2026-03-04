import {Router} from "express";
import {InventoryController} from "./inventory.controller";
import { validateBody } from "../../middlewares/validateBody";
import { createInventoryItemSchema } from "./inventoryItem.schema";

const router = Router();

router.get("/", InventoryController.getAll);
router.get("/:id", InventoryController.getById);
router.post("/", validateBody(createInventoryItemSchema), InventoryController.create);
router.patch("/:id", validateBody(createInventoryItemSchema), InventoryController.update);
router.delete("/:id", InventoryController.delete);

export default router;

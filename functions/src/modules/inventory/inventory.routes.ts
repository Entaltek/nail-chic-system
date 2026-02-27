import {Router} from "express";
import {InventoryController} from "./inventory.controller";

const router = Router();

router.get("/", InventoryController.getAll);
router.get("/:id", InventoryController.getById);
router.post("/", InventoryController.create);
router.patch("/:id", InventoryController.update);
router.delete("/:id", InventoryController.delete);

export default router;

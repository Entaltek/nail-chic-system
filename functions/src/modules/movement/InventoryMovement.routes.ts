import {Router} from "express";
import {InventoryMovementController} from "./InventoryMovement.controller";

const router = Router();

router.post("/", InventoryMovementController.create);
router.get("/item/:itemId", InventoryMovementController.getByItem);

export default router;

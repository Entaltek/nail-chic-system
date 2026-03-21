import { Router } from "express";
import { ClientsController } from "./clients.controller";

const router = Router();

router.get("/", ClientsController.getAll);
router.get("/:id", ClientsController.getById);
router.post("/", ClientsController.create);
router.patch("/:id", ClientsController.update);
router.delete("/:id", ClientsController.delete);

export default router;
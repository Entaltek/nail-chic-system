import { Router } from "express";
import { ServiceRecordController } from "./serviceRecord.controller";
// auth middleware

const router = Router();

// Apply auth middleware if not applied globally
// router.use(requireAuth);

router.post("/", ServiceRecordController.create);
router.get("/", ServiceRecordController.getAll);
router.get("/:id", ServiceRecordController.getById);

export const serviceRecordRouter = router;

import { Router } from "express";
import { TeamMemberController } from "./teamMember.controller";
// Make sure to import your auth middleware here if you have one applied at the route level
// e.g., import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Apply auth middleware if it's not applied globally in app.ts
// router.use(requireAuth);

router.get("/", TeamMemberController.getAll);
router.get("/:id", TeamMemberController.getById);
router.post("/", TeamMemberController.create);
router.put("/:id", TeamMemberController.update);
router.delete("/:id", TeamMemberController.delete);

export const teamMemberRouter = router;

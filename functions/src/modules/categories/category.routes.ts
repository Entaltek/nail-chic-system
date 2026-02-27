import {Router} from "express";
import {CategoryController} from "./category.controller";

const router = Router();

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);
router.post("/", CategoryController.create);
router.patch("/:id", CategoryController.update);

export default router;

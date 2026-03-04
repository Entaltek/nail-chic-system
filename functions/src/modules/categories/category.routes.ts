import {Router} from "express";
import {CategoryController} from "./category.controller";
import { validateBody } from "../../middlewares/validateBody"; 
import { createCategorySchema } from "./category.schemas";
const router = Router();

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);
router.post("/", validateBody(createCategorySchema), CategoryController.create);
router.patch("/:id", validateBody(createCategorySchema), CategoryController.update);
//router.delete("/:id", CategoryController.delete);

export default router;

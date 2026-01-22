import { Router } from 'express';
import { CategoryController } from './category.controller';

const router = Router();

router.get('/', CategoryController.getAll);
router.post('/', CategoryController.create);

export default router;
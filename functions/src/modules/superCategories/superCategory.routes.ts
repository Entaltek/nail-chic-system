import { Router } from 'express';
import { SuperCategoryController } from './superCategory.controller';

const router = Router();

router.get('/', SuperCategoryController.getAll);
router.get('/:id', SuperCategoryController.getById);
router.post('/', SuperCategoryController.create);
router.put('/:id', SuperCategoryController.update);
router.delete('/:id', SuperCategoryController.delete);

export default router;

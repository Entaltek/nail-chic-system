import { Router } from 'express';
import { AdicionalesController } from './adicionales.controller';

const router = Router();

router.get('/', AdicionalesController.getAll);
router.post('/', AdicionalesController.create);
router.put('/:id', AdicionalesController.update);
router.delete('/:id', AdicionalesController.delete);

export default router;

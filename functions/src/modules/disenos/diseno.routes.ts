import { Router } from 'express';
import { DisenoController } from './diseno.controller';

const router = Router();

router.get('/', DisenoController.list);
router.post('/', DisenoController.create);
router.put('/:id', DisenoController.update);
router.delete('/:id', DisenoController.remove);

export default router;

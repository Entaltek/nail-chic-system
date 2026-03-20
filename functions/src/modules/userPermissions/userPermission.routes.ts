import { Router } from 'express';
import * as controller from './userPermission.controller';

const router = Router();

router.get('/', controller.getAll);
router.get('/:userId', controller.getByUser);
router.put('/:userId', controller.update);

export default router;

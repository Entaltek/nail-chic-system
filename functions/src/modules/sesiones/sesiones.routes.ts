import { Router } from 'express';
import { SesionesController } from './sesiones.controller';

const router = Router();

// Endpoint POST /api/sesiones/iniciar
router.post('/iniciar', SesionesController.iniciar);

export default router;

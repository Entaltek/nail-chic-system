import { Router } from 'express';
import { SesionesController } from './sesiones.controller';

const router = Router();

// Endpoint POST /api/sesiones/iniciar
router.post('/iniciar', SesionesController.iniciar);

// Endpoint PUT /api/sesiones/:id/finalizar
router.put('/:id/finalizar', SesionesController.finalizar);

export default router;

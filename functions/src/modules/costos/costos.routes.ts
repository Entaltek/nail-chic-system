import { Router } from 'express';
import { CostosController } from './costos.controller';

const costosRoutes = Router();
costosRoutes.get('/resumen', CostosController.getResumen);
costosRoutes.get('/meta-mensual', CostosController.getMetaMensual);
costosRoutes.put('/meta-mensual', CostosController.updateMetaMensual);

const costosFijosRoutes = Router();
costosFijosRoutes.get('/', CostosController.getCostosFijos);
costosFijosRoutes.post('/', CostosController.createCostoFijo);
costosFijosRoutes.put('/:id', CostosController.updateCostoFijo);
costosFijosRoutes.delete('/:id', CostosController.deleteCostoFijo);

const fondosAhorroRoutes = Router();
fondosAhorroRoutes.get('/', CostosController.getFondosAhorro);
fondosAhorroRoutes.post('/', CostosController.createFondoAhorro);
fondosAhorroRoutes.put('/:id', CostosController.updateFondoAhorro);
fondosAhorroRoutes.delete('/:id', CostosController.deleteFondoAhorro);

export { costosRoutes, costosFijosRoutes, fondosAhorroRoutes };

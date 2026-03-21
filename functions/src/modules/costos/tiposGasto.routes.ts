import { Router } from 'express';
import { TiposGastoController } from './tiposGasto.controller';

const tiposGastoRoutes = Router();

tiposGastoRoutes.get('/', TiposGastoController.getTiposGasto);
tiposGastoRoutes.post('/', TiposGastoController.createTipoGasto);
tiposGastoRoutes.put('/:id', TiposGastoController.updateTipoGasto);
tiposGastoRoutes.delete('/:id', TiposGastoController.deleteTipoGasto);

export { tiposGastoRoutes };

import { Request, Response } from 'express';
import * as service from './userPermission.service';

export const getAll = async (req: Request, res: Response) => {
  try {
    const permissions = await service.getAllPermissions();
    return res.status(200).json({
      status: 'success',
      data: permissions,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const permissions = await service.getPermissionsByUserId(userId);
    return res.status(200).json({
      status: 'success',
      data: permissions,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { email, modules, displayName } = req.body;
    
    if (!email || !modules) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and modules are required',
      });
    }

    const updated = await service.updatePermissions(userId, email, modules, displayName);
    return res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (error: any) {
    return res.status(error.message === 'No se pueden modificar los permisos del super admin' ? 403 : 500).json({
      status: 'error',
      message: error.message,
    });
  }
};

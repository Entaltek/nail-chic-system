import * as admin from 'firebase-admin';
import * as repository from './userPermission.repository';
import { UserPermission } from './userPermission.model';

const SUPER_ADMIN_EMAIL = 'sebastian.cano@entaltek.com';

export const getAllPermissions = async () => {
  return await repository.getAll();
};

export const getPermissionsByUserId = async (userId: string) => {
  return await repository.getByUserId(userId);
};

export const updatePermissions = async (userId: string, email: string, modules: UserPermission['modules'], displayName?: string) => {
  if (email === SUPER_ADMIN_EMAIL) {
    throw new Error('No se pueden modificar los permisos del super admin');
  }

  const data: Partial<UserPermission> = {
    userId,
    email,
    displayName,
    modules,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await repository.upsert(userId, data);
  return { id: userId, ...data };
};

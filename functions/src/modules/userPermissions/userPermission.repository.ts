import * as admin from 'firebase-admin';
import { UserPermission } from './userPermission.model';

const COLLECTION_NAME = 'userPermissions';

export const getAll = async (): Promise<UserPermission[]> => {
  const snapshot = await admin.firestore().collection(COLLECTION_NAME).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserPermission));
};

export const getByUserId = async (userId: string): Promise<UserPermission | null> => {
  const doc = await admin.firestore().collection(COLLECTION_NAME).doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as UserPermission;
};

export const getByEmail = async (email: string): Promise<UserPermission | null> => {
  const snapshot = await admin.firestore()
    .collection(COLLECTION_NAME)
    .where('email', '==', email)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserPermission;
};

export const upsert = async (userId: string, data: Partial<UserPermission>): Promise<void> => {
  await admin.firestore().collection(COLLECTION_NAME).doc(userId).set(data, { merge: true });
};

export const deletePermission = async (userId: string): Promise<void> => {
  await admin.firestore().collection(COLLECTION_NAME).doc(userId).delete();
};

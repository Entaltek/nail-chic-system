import * as admin from 'firebase-admin';
import type { SuperCategoryIcon } from './superCategory.types';

export interface SuperCategory {
  id: string;
  name: string;
  icon: SuperCategoryIcon;
  color: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

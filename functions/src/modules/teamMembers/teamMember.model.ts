import { Timestamp } from "firebase-admin/firestore";

export interface TeamMember {
  id: string;
  ownerId: string;
  name: string;
  role: string;
  commissionPercentage: number | null;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

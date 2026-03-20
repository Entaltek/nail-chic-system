import { db } from "../../config/firebase";
import { TeamMember } from "./teamMember.model";

const collection = db.collection("teamMembers");

export const TeamMemberRepository = {
  async findByOwnerId(ownerId: string): Promise<TeamMember[]> {
    const snap = await collection
      .where("ownerId", "==", ownerId)
      // Only return active members, though we could return all and filter UI side. 
      // The prompt just says "where ownerId == ownerId", let's stick to that and allow UI to filter isActive if needed, 
      // or filter here. We'll return all and the service can filter or just let user see inactive ones.
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember));
  },

  async findById(id: string): Promise<TeamMember | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as TeamMember;
  },

  async create(data: Omit<TeamMember, "id">): Promise<string> {
    const ref = await collection.add(data);
    return ref.id;
  },

  async update(id: string, data: Partial<TeamMember>): Promise<void> {
    await collection.doc(id).update(data);
  },
};

import { TeamMemberRepository } from "./teamMember.repository";
import { TeamMember } from "./teamMember.model";
import { Timestamp } from "firebase-admin/firestore";

export const teamMemberService = {
  async getAll(ownerId: string): Promise<TeamMember[]> {
    return TeamMemberRepository.findByOwnerId(ownerId);
  },

  async getById(id: string, ownerId: string): Promise<TeamMember> {
    const member = await TeamMemberRepository.findById(id);
    if (!member) {
      throw new Error("El miembro del equipo no existe");
    }
    if (member.ownerId !== ownerId) {
      throw new Error("No tienes acceso a este miembro del equipo");
    }
    return member;
  },

  async create(data: Partial<TeamMember>, ownerId: string): Promise<string> {
    if (!data.name || !data.role) {
      throw new Error("Nombre y rol son requeridos");
    }

    if (data.commissionPercentage !== undefined && data.commissionPercentage !== null) {
      if (data.commissionPercentage < 0 || data.commissionPercentage > 100) {
        throw new Error("La comisión debe estar entre 0 y 100");
      }
    }

    if (data.role === "owner") {
      const allMembers = await TeamMemberRepository.findByOwnerId(ownerId);
      if (allMembers.some((m) => m.role === "owner" && m.isActive)) {
        throw new Error("Ya existe una dueña en el equipo");
      }
    }

    const newMember: Omit<TeamMember, "id"> = {
      ownerId,
      name: data.name,
      role: data.role,
      commissionPercentage: data.commissionPercentage ?? 0,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    return TeamMemberRepository.create(newMember);
  },

  async update(id: string, ownerId: string, data: Partial<TeamMember>): Promise<void> {
    // Verificar propiedad
    await this.getById(id, ownerId);

    const updateData: Partial<TeamMember> = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    
    // No permitir cambiar ownerId
    delete updateData.ownerId;
    delete updateData.id;

    return TeamMemberRepository.update(id, updateData);
  },

  async softDelete(id: string, ownerId: string): Promise<void> {
    // Verificar propiedad
    await this.getById(id, ownerId);

    return TeamMemberRepository.update(id, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  },
};

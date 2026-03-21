import { ClientStatus, ClientType } from "./clients.types";

export interface ClientBase {
  firstName: string;
  paternalSurname: string;
  maternalSurname?: string;
  email?: string;
  phone: string;
  type: ClientType;
}

export interface Client extends ClientBase {
  id: string;
  status: ClientStatus;
  appointmentsCount: number;
  servicesCount: number;
  createdAt: string;
  updatedAt: string;
}
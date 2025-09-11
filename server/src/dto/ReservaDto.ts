import { StatusReserva } from '../entity/Reserva';

export interface CreateReservaDto {
  clienteNome: string;
  clienteEmail: string;
  dataReserva: Date;
  horaInicio: string;
  horaFim: string;
  valorTotal: number;
  observacoes?: string;
  salaId: number;
  locatarioId?: number;
}

export interface UpdateReservaDto {
  clienteNome?: string;
  clienteEmail?: string;
  dataReserva?: Date;
  horaInicio?: string;
  horaFim?: string;
  valorTotal?: number;
  status?: StatusReserva;
  observacoes?: string;
  salaId?: number;
  locatarioId?: number;
}

export interface ReservaResponseDto {
  id: number;
  clienteNome: string;
  clienteEmail: string;
  dataReserva: Date;
  horaInicio: string;
  horaFim: string;
  valorTotal?: number;
  status: StatusReserva;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
  sala: {
    id: number;
    nome: string;
  };
  locatario?: {
    id: number;
    nome?: string;
    email?: string;
  };
}

export interface ReservaFilterDto {
  status?: StatusReserva;
  dataInicio?: Date;
  dataFim?: Date;
  salaId?: number;
}
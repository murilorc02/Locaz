import { StatusReserva } from '../entity/Reserva';

export interface CreateReservaDTO {
  dataReserva: string; // formato: YYYY-MM-DD
  horarioInicio: string; // formato: HH:MM
  horarioFim: string; // formato: HH:MM
  observacoes?: string;
  locatarioId: number;
  salaId: string;
}

export interface UpdateReservaStatusDTO {
  id: string;
  status: StatusReserva;
}

export interface UpdateReservaDTO {
  dataReserva?: string;
  horarioInicio?: string;
  horarioFim?: string;
  observacoes?: string;
  status?: StatusReserva;
}

export interface ReservaFilterDTO {
  usuarioId?: number;
  salaId?: string;
  proprietarioId?: number;
  status?: StatusReserva;
  dataInicio?: string;
  dataFim?: string;
}

export interface VerificarConflitoDTO {
  salaId: string;
  dataReserva: string;
  horarioInicio: string;
  horarioFim: string;
  excluirReservaId?: string;
}

export interface ReservaResponseDTO {
  id: string;
  dataReserva: Date;
  horarioInicio: string;
  horarioFim: string;
  status: StatusReserva;
  valorTotal: number;
  observacoes?: string;
  locatario: {
    id: number;
    nome: string;
    email: string;
  };
  sala: {
    id: string;
    nome: string;
    capacidade: number;
    predio: {
      id: string;
      nome: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EstatisticasReservaDTO {
  pendentes: number;
  confirmadas: number;
  canceladas: number;
  recusadas: number;
  total: number;
}
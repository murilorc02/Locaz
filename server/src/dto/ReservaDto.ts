export interface CriarReservaDto {
  salaId: number;
  locatarioId?: number;
  dataReservada: string; // Formato: YYYY-MM-DD
  horarioInicio: string; // Formato: HH:00:00
  horarioFim: string; // Formato: HH:00:00
  valorTotal: number;
  observacoes?: string;
}

export interface AtualizarReservaDto {
  dataReservada?: string;
  horarioInicio?: string;
  horarioFim?: string;
  valorTotal?: number;
  observacoes?: string;
}

export interface AceitarReservaDto {
  idReserva: number;  
  idLocador: number;  
}

export interface RecusarReservaDto {
  idReserva: number;  
  idLocador: number;  
}

export interface CancelarReservaDto {
  idReserva: number;  
  idLocatario: number; 
}
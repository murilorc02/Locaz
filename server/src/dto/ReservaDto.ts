export interface CriarReservaDto {
  salaId: string;
  locatarioId?: string;
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
  idReserva: string;  
  idLocador: string;  
}

export interface RecusarReservaDto {
  idReserva: string;  
  idLocador: string;  
}

export interface CancelarReservaDto {
  idReserva: string;  
  idLocatario: string; 
}
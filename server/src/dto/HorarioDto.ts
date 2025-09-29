export interface CreateHorarioDto {
  inicioPeriodo?: string;
  fimPeriodo?: string;
  disponivel?: boolean;
  salaId?: number;
}

export interface UpdateHorarioDto {
  inicioPeriodo?: string;
  fimPeriodo?: string;
  disponivel?: boolean;
  salaId?: number;
}

export interface HorarioResponseDto {
  id?: number;
  inicioPeriodo?: string;
  fimPeriodo?: string;
  disponivel?: boolean;
  sala?: any;
}

export interface ConsultaHorarioDto {
  salaId: number;
  data: string; // YYYY-MM-DD
}

export interface HorarioDisponivelResponseDto {
  horaInicio: string;
  horaFim: string;
  disponivel: boolean;
}
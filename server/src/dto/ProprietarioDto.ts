export interface CreateProprietarioDto {
  nome: string;
  foto?: string;
  descricao?: string;
}

export interface UpdateProprietarioDto {
  nome?: string;
  foto?: string;
  descricao?: string;
}

export interface ProprietarioResponseDto {
  id?: number;
  nome: string;
  foto?: string;
  descricao?: string;
}
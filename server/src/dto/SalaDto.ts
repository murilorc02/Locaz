export interface CreateSalaDto {
  nome: string;
  descricao?: string;
  capacidade?: number;
  precoHora: number;
  imagens?: string[];
  pontosDestaque?: string[];
  predioId?: number;
  proprietarioId?: number;
  empresaId?: number; // Added missing property
}

export interface UpdateSalaDto {
  nome?: string;
  descricao?: string;
  capacidade?: number;
  precoHora?: number;
  imagens?: string[];
  pontosDestaque?: string[];
  disponivel?: boolean;
  proprietarioId?: number; 
  empresaId?: number; 
  predioId?: number; 
}

export interface SalaSearchDto {
  nome?: string;
  capacidade?: number;
  precoHora?: number;
  predioId?: number;
  pontosDestaque?: string[];
}

export interface SalaResponseDto {
  id: number;
  nome: string;
  descricao?: string;
  capacidade?: number;
  precoHora: number;
  pontosDestaque?: string[];
  ativo?: boolean;
  privado?: boolean;
  createdAt: Date;
  updatedAt: Date;
  predio?: {
    id: number;
    nomePredio: string;
    endereco: string;
  };
  proprietario?: {
    id: number;
    nome: string;
    email: string;
  };
  empresaId?: number; 
  imagem?: string;
}
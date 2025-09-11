export interface CreatePredioDto {
  nomePredio: string; // Alterado de 'nome' para 'nomePredio'
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  descricao?: string;
  capacidade?: number; // Adicionado
  categoria?: string; // Adicionado
  imagens?: string[];
  comodidades?: string[];
  disponivel?: boolean; // Adicionado
  privado?: boolean; // Adicionado
  proprietarioId?: number;
}

export interface UpdatePredioDto {
  nomePredio?: string; // Alterado de 'nome' para 'nomePredio'
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  descricao?: string;
  capacidade?: number; // Adicionado
  categoria?: string; // Adicionado
  imagens?: string[];
  comodidades?: string[];
  disponivel?: boolean; // Adicionado
  privado?: boolean; // Adicionado
}

export interface PredioResponseDto {
  id?: number;
  nomePredio: string; // Alterado de 'nome' para 'nomePredio'
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  descricao?: string;
  capacidade?: number; // Adicionado
  categoria?: string; // Adicionado
  imagens?: string[];
  comodidades?: string[];
  disponivel?: boolean; // Adicionado
  ativo?: boolean;
  privado?: boolean; // Adicionado
  createdAt?: Date;
  updatedAt?: Date;
  proprietario?: any;
  salas?: any[];
  totalSalas?: number;
  totalComodidades?: number;
}
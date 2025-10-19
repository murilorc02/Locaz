import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';

// DTOs para validação (com class-validator)
export class CreateSalaDto {
  @IsString({ message: 'Nome deve ser uma string' })
  nome!: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsNumber({}, { message: 'Capacidade deve ser um número' })
  capacidade!: number;

  @IsString({ message: 'Categoria deve ser uma string' })
  categoria!: string;

  @IsNumber({}, { message: 'Preço por hora deve ser um número' })
  precoHora!: number;

  @IsOptional()
  @IsBoolean({ message: 'Reserva gratuita deve ser verdadeiro ou falso' })
  reservaGratuita?: boolean;

  @IsNumber({}, { message: 'ID do prédio deve ser um número' })
  predioId!: number;

  @IsOptional()
  @IsArray({ message: 'Comodidades deve ser um array' })
  comodidades?: string[];
}

export class AtualizarSalaDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Capacidade deve ser um número' })
  capacidade?: number;

  @IsOptional()
  @IsString({ message: 'Categoria deve ser uma string' })
  categoria?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Preço por hora deve ser um número' })
  precoHora?: number;

  @IsOptional()
  @IsBoolean({ message: 'Reserva gratuita deve ser verdadeiro ou falso' })
  reservaGratuita?: boolean;

  @IsOptional()
  @IsArray({ message: 'Comodidades deve ser um array' })
  comodidades?: string[];
}

export class BuscarSalaDto {
  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  cidade?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Capacidade deve ser um número' })
  capacidade?: number;

  @IsOptional()
  @IsString({ message: 'Categoria deve ser uma string' })
  categoria?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Preço mínimo deve ser um número' })
  precoMinimo?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Preço máximo deve ser um número' })
  precoMaximo?: number;

  @IsOptional()
  @IsArray({ message: 'Comodidades deve ser um array' })
  comodidades?: string[];

  @IsOptional()
  @IsString({ message: 'Data da reserva deve ser uma string' })
  dataReserva?: string;

  @IsOptional()
  @IsString({ message: 'Horário de início deve ser uma string' })
  horarioInicio?: string;

  @IsOptional()
  @IsString({ message: 'Horário de fim deve ser uma string' })
  horarioFim?: string;
}

// Interfaces para uso interno (sem validação)
export interface CreateSalaDTO {
  nome: string;
  descricao?: string;
  capacidade: number;
  categoria: string;
  precoHora: number;
  reservaGratuita?: boolean;
  predioId: number;
  comodidades?: string[];
}

export interface UpdateSalaDTO {
  nome?: string;
  descricao?: string;
  capacidade?: number;
  categoria?: string;
  precoHora?: number;
  reservaGratuita?: boolean;
  comodidades?: string[];
}

export interface SearchSalaDTO {
  nome?: string;
  cidade?: string;
  capacidade?: number;
  categoria?: string;
  precoMinimo?: number;
  precoMaximo?: number;
  comodidades?: string[];
  dataReserva?: string;
  horarioInicio?: string;
  horarioFim?: string;
  ordenarPor?: 'preco' | 'capacidade' | 'nome';
  ordem?: 'ASC' | 'DESC';
  predioId?: number;
}
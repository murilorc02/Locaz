import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsArray, IsNotEmpty, Min, Max } from 'class-validator';
import { CategoriaSala, Comodidade } from '../entity/Sala';

export class CreateSalaDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  nome!: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsNotEmpty({ message: 'Capacidade é obrigatória' })
  @IsNumber({}, { message: 'Capacidade deve ser um número' })
  @Min(1, { message: 'Capacidade deve ser pelo menos 1' })
  @Max(1000, { message: 'Capacidade não pode ser maior que 1000' })
  capacidade!: number;

  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  @IsEnum(CategoriaSala, { message: 'Categoria deve ser uma das opções válidas' })
  categoria!: CategoriaSala;

  @IsNotEmpty({ message: 'Preço por hora é obrigatório' })
  @IsNumber({}, { message: 'Preço por hora deve ser um número' })
  @Min(0, { message: 'Preço por hora deve ser maior ou igual a 0' })
  precoHora!: number;

  @IsOptional()
  @IsBoolean({ message: 'Reserva gratuita deve ser verdadeiro ou falso' })
  reservaGratuita?: boolean;

  @IsNotEmpty({ message: 'ID do prédio é obrigatório' })
  @IsString({ message: 'ID do prédio deve ser uma string' })
  predioId!: string;

  @IsOptional()
  @IsArray({ message: 'Comodidades deve ser um array' })
  @IsEnum(Comodidade, { each: true, message: 'Cada comodidade deve ser uma das opções válidas' })
  comodidades?: Comodidade[];
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
  @Min(1, { message: 'Capacidade deve ser pelo menos 1' })
  @Max(1000, { message: 'Capacidade não pode ser maior que 1000' })
  capacidade?: number;

  @IsOptional()
  @IsEnum(CategoriaSala, { message: 'Categoria deve ser uma das opções válidas' })
  categoria?: CategoriaSala;

  @IsOptional()
  @IsNumber({}, { message: 'Preço por hora deve ser um número' })
  @Min(0, { message: 'Preço por hora deve ser maior ou igual a 0' })
  precoHora?: number;

  @IsOptional()
  @IsBoolean({ message: 'Reserva gratuita deve ser verdadeiro ou falso' })
  reservaGratuita?: boolean;

  @IsOptional()
  @IsArray({ message: 'Comodidades deve ser um array' })
  @IsEnum(Comodidade, { each: true, message: 'Cada comodidade deve ser uma das opções válidas' })
  comodidades?: Comodidade[];
}

export class BuscarSalaDto {
  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  cidade?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Capacidade deve ser um número' })
  @Min(1, { message: 'Capacidade deve ser pelo menos 1' })
  capacidade?: number;

  @IsOptional()
  @IsEnum(CategoriaSala, { message: 'Categoria deve ser uma das opções válidas' })
  categoria?: CategoriaSala;

  @IsOptional()
  @IsNumber({}, { message: 'Preço máximo deve ser um número' })
  @Min(0, { message: 'Preço máximo deve ser maior ou igual a 0' })
  precoMaximo?: number;

  @IsOptional()
  @IsArray({ message: 'Comodidades deve ser um array' })
  @IsEnum(Comodidade, { each: true, message: 'Cada comodidade deve ser uma das opções válidas' })
  comodidades?: Comodidade[];

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
  categoria: CategoriaSala;
  precoHora: number;
  reservaGratuita?: boolean;
  predioId: string;
  comodidades?: Comodidade[];
}

export interface UpdateSalaDTO {
  id: string;
  nome?: string;
  descricao?: string;
  capacidade?: number;
  categoria?: CategoriaSala;
  precoHora?: number;
  reservaGratuita?: boolean;
  comodidades?: Comodidade[];
}

export interface SearchSalaDTO {
  cidade?: string;
  capacidade?: number;
  categoria?: CategoriaSala;
  precoMaximo?: number;
  comodidades?: Comodidade[];
  dataReserva?: string;
  horarioInicio?: string;
  horarioFim?: string;
}
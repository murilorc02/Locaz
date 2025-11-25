import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class HorarioFuncionamentoSalaDto {
    @IsString({ message: 'Dia da semana deve ser uma string' })
    diaSemana!: string;

    @IsString({ message: 'Horário de abertura deve ser uma string' })
    horarioAbertura!: string;

    @IsString({ message: 'Horário de fechamento deve ser uma string' })
    horarioFechamento!: string;

    @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
    ativo!: boolean;
}

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

    @IsOptional()
    @IsArray({ message: 'Horários de funcionamento deve ser um array' })
    @ValidateNested({ each: true })
    @Type(() => HorarioFuncionamentoSalaDto)
    horariosFuncionamento?: HorarioFuncionamentoSalaDto[];
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

    @IsOptional()
    @IsArray({ message: 'Horários de funcionamento deve ser um array' })
    @ValidateNested({ each: true })
    @Type(() => HorarioFuncionamentoSalaDto)
    horariosFuncionamento?: HorarioFuncionamentoSalaDto[];
}

export class AtualizarHorariosFuncionamentoSalaDto {
    @IsArray({ message: 'Horários de funcionamento deve ser um array' })
    @ValidateNested({ each: true })
    @Type(() => HorarioFuncionamentoSalaDto)
    horariosFuncionamento!: HorarioFuncionamentoSalaDto[];
}

// Interfaces para uso interno
export interface CreateSalaDTO {
    nome: string;
    descricao?: string;
    capacidade: number;
    categoria: string;
    precoHora: number;
    reservaGratuita?: boolean;
    predioId: number;
    comodidades?: string[];
    horariosFuncionamento?: Array<{
        diaSemana: string;
        horarioAbertura: string;
        horarioFechamento: string;
        ativo: boolean;
    }>;
}

export interface UpdateSalaDTO {
    nome?: string;
    descricao?: string;
    capacidade?: number;
    categoria?: string;
    precoHora?: number;
    reservaGratuita?: boolean;
    comodidades?: string[];
    horariosFuncionamento?: Array<{
        diaSemana: string;
        horarioAbertura: string;
        horarioFechamento: string;
        ativo: boolean;
    }>;
    predioId: number;
}
import { IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export enum DiaSemana {
    SEGUNDA = 'segunda',
    TERCA = 'terca',
    QUARTA = 'quarta',
    QUINTA = 'quinta',
    SEXTA = 'sexta',
    SABADO = 'sabado',
    DOMINGO = 'domingo'
}

export class HorarioFuncionamentoDto {
    @IsEnum(DiaSemana, { message: 'Dia da semana deve ser um valor válido' })
    diaSemana!: DiaSemana;

    @IsString({ message: 'Horário de abertura deve ser uma string' })
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Horário de abertura deve estar no formato HH:MM' })
    horarioAbertura!: string;

    @IsString({ message: 'Horário de fechamento deve ser uma string' })
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Horário de fechamento deve estar no formato HH:MM' })
    horarioFechamento!: string;

    @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
    ativo!: boolean;
}

export class PatchPredioDto {
    @IsOptional()
    @IsString({ message: 'Nome deve ser uma string' })
    nome?: string;

    @IsOptional()
    @IsString({ message: 'Endereço deve ser uma string' })
    endereco?: string;

    @IsOptional()
    @IsString({ message: 'Cidade deve ser uma string' })
    cidade?: string;

    @IsOptional()
    @IsString({ message: 'Estado deve ser uma string' })
    estado?: string;

    @IsOptional()
    @IsString({ message: 'CEP deve ser uma string' })
    @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP deve estar no formato 00000-000 ou 00000000' })
    cep?: string;

    @IsOptional()
    @IsString({ message: 'Descrição deve ser uma string' })
    descricao?: string;

    @IsOptional()
    @IsArray({ message: 'Horários de funcionamento deve ser um array' })
    @ValidateNested({ each: true })
    @Type(() => HorarioFuncionamentoDto)
    horariosFuncionamento?: HorarioFuncionamentoDto[];
}

export class CriarPredioDto {
    @IsString({ message: 'Nome é obrigatório e deve ser uma string' })
    @IsNotEmpty({ message: 'Nome não pode estar vazio' })
    nome!: string;

    @IsString({ message: 'Endereço é obrigatório e deve ser uma string' })
    @IsNotEmpty({ message: 'Endereço não pode estar vazio' })
    endereco!: string;

    @IsString({ message: 'Cidade é obrigatória e deve ser uma string' })
    @IsNotEmpty({ message: 'Cidade não pode estar vazia' })
    cidade!: string;

    @IsString({ message: 'Estado é obrigatório e deve ser uma string' })
    @IsNotEmpty({ message: 'Estado não pode estar vazio' })
    estado!: string;

    @IsString({ message: 'CEP é obrigatório e deve ser uma string' })
    @IsNotEmpty({ message: 'CEP não pode estar vazio' })
    @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP deve estar no formato 00000-000 ou 00000000' })
    cep!: string;

    @IsOptional()
    @IsString({ message: 'Descrição deve ser uma string' })
    descricao?: string;

    @IsArray({ message: 'Horários de funcionamento deve ser um array' })
    @ValidateNested({ each: true })
    @Type(() => HorarioFuncionamentoDto)
    horariosFuncionamento!: HorarioFuncionamentoDto[];
}


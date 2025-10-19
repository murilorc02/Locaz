import { IsEnum, IsString, IsBoolean, IsOptional, Matches, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { DiaSemana } from '../entity/horarioPredio';

export class CriarHorarioPredioDto {
  @IsEnum(DiaSemana, { message: 'Dia da semana inválido' })
  diaSemana!: DiaSemana;

  @IsString({ message: 'Horário de abertura deve ser uma string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário de abertura inválido. Use formato HH:MM'
  })
  horarioAbertura!: string;

  @IsString({ message: 'Horário de fechamento deve ser uma string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário de fechamento inválido. Use formato HH:MM'
  })
  horarioFechamento!: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;
}

export class CriarMultiplosHorariosPredioDto {
  @IsArray({ message: 'Horários deve ser um array' })
  @ArrayMinSize(1, { message: 'É necessário informar pelo menos um horário' })
  @ValidateNested({ each: true })
  @Type(() => CriarHorarioPredioDto)
  horarios!: CriarHorarioPredioDto[];
}

export class AtualizarHorarioPredioDto {
  @IsOptional()
  @IsEnum(DiaSemana, { message: 'Dia da semana inválido' })
  diaSemana?: DiaSemana;

  @IsOptional()
  @IsString({ message: 'Horário de abertura deve ser uma string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário de abertura inválido. Use formato HH:MM'
  })
  horarioAbertura?: string;

  @IsOptional()
  @IsString({ message: 'Horário de fechamento deve ser uma string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário de fechamento inválido. Use formato HH:MM'
  })
  horarioFechamento?: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;
}
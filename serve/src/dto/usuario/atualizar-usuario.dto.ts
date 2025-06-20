import { IsString, IsEmail, IsOptional } from 'class-validator';

export class AtualizarUsuarioDto {
    @IsOptional()
    @IsString({ message: 'O nome deve ser um texto.' })
    nome?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Por favor, insira um email válido.' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'O telefone deve ser um texto.' })
    telefone?: string;
}
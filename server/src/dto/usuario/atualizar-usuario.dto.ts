import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';

export class AtualizarUsuarioDto {
    @IsOptional()
    @IsString({ message: 'Nome deve ser uma string' })
    nome?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email inválido' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'CPF/CNPJ deve ser uma string' })
    cpfcnpj?: string;

    @IsOptional()
    @IsString({ message: 'Telefone deve ser uma string' })
    telefone?: string;
}
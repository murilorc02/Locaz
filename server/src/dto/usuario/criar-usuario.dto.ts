import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { TipoUsuario } from '../../entity/Usuario';

export class CriarUsuarioDto {
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    @IsString({ message: 'Nome deve ser uma string' })
    nome!: string;

    @IsNotEmpty({ message: 'Email é obrigatório' })
    @IsEmail({}, { message: 'Email inválido' })
    email!: string;

    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @IsString({ message: 'Senha deve ser uma string' })
    @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
    senha!: string;

    @IsNotEmpty({ message: 'CPF/CNPJ é obrigatório' })
    @IsString({ message: 'CPF/CNPJ deve ser uma string' })
    cpfcnpj!: string;

    @IsNotEmpty({ message: 'Telefone é obrigatório' })
    @IsString({ message: 'Telefone deve ser uma string' })
    telefone!: string;

    @IsNotEmpty({ message: 'Tipo é obrigatório' })
    @IsEnum(TipoUsuario, { message: 'Tipo deve ser "locador" ou "locatario"' })
    tipo!: TipoUsuario;
}
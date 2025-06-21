import { IsString, IsEmail, MinLength, IsEnum, IsNotEmpty } from 'class-validator';
import { TipoUsuario } from '../../entity/Usuario';

export class CriarUsuarioDto {
    @IsNotEmpty({ message: 'O nome é obrigatório.'})
    @IsString()
    nome!: string;

    @IsNotEmpty({ message: 'O email é obrigatório.'})
    @IsEmail()
    email!: string;

    @IsNotEmpty({ message: 'A senha é obrigatória.'})
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.'})
    senha!: string;
    
    @IsNotEmpty({ message: 'O CPF é obrigatório.'})
    @IsString() 
    cpf!: string;

    @IsNotEmpty({ message: 'O telefone é obrigatório.'})
    @IsString()
    telefone!: string;

    @IsNotEmpty({ message: 'O tipo de conta é obrigatório.'})
    @IsEnum(TipoUsuario, { message: 'O tipo de conta deve ser "locador" ou "locatario".'})
    tipo!: TipoUsuario;
}
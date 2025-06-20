import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Por favor, insira um email válido.'})
    email!: string;

    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.'})
    senha!: string;
}
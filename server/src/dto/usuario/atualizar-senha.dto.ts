import { IsString, MinLength } from 'class-validator';

export class AtualizarSenhaDto {
    @IsString()
    senhaAtual!: string; 

    @IsString()
    @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
    novaSenha!: string;

    @IsString()
    confirmarNovaSenha!: string; 
}
import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UsuarioService } from '../services/usuarioService';
import { authMiddleware } from '../middleware/authMiddleware';
import { CriarUsuarioDto } from '../dto/usuario/criar-usuario.dto';
import { LoginDto } from '../dto/usuario/login.dto';
import { AtualizarUsuarioDto } from '../dto/usuario/atualizar-usuario.dto';
import { AtualizarSenhaDto } from '../dto/usuario/atualizar-senha.dto';

const usuarioController = Router();
const usuarioService = new UsuarioService();

// --- ROTAS DE AUTENTICAÇÃO PÚBLICAS ---

usuarioController.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dadosDto = plainToInstance(CriarUsuarioDto, req.body);
        const erros = await validate(dadosDto);
        if (erros.length > 0) {
            res.status(400).json(erros);
            return;
        }
        const novoUsuario = await usuarioService.criar(dadosDto);
        res.status(201).json(novoUsuario);
    } catch (error) {
        next(error);
    }
});

usuarioController.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dadosDto = plainToInstance(LoginDto, req.body);
        const erros = await validate(dadosDto);
        if (erros.length > 0) {
            res.status(400).json(erros);
            return;
        }

        const usuario = await usuarioService.validarUsuario(dadosDto.email, dadosDto.senha);
        if (!usuario) {
            res.status(401).json({ message: 'Email ou senha inválidos.' });
            return;
        }
        const token = usuarioService.login(usuario);
        res.json(token);
    } catch (error) {
        next(error);
    }
});


usuarioController.get('/perfil', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const perfil = await usuarioService.buscarPorId(req.user.id);
        res.json(perfil);
    } catch (error) {
        next(error);
    }
});

usuarioController.put('/perfil', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dadosDto = plainToInstance(AtualizarUsuarioDto, req.body);
        const erros = await validate(dadosDto);
        if (erros.length > 0) {
            res.status(400).json(erros);
            return;
        }
        const perfilAtualizado = await usuarioService.atualizar(req.user.id, dadosDto);
        res.json(perfilAtualizado);
    } catch (error) {
        next(error);
    }
});

usuarioController.put('/perfil/alterar-senha', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dadosDto = plainToInstance(AtualizarSenhaDto, req.body);
        const erros = await validate(dadosDto);
        if (erros.length > 0) {
            res.status(400).json(erros);
            return;
        }
        if (dadosDto.novaSenha !== dadosDto.confirmarNovaSenha) {
            res.status(400).json({ message: 'A nova senha e a confirmação de senha não correspondem.' });
            return;
        }
        await usuarioService.atualizarSenha(req.user.id, dadosDto.senhaAtual, dadosDto.novaSenha);
        res.json({ message: 'Senha atualizada com sucesso.' });
    } catch (error) {
        next(error);
    }
});

export default usuarioController;
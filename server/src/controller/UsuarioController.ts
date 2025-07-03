import { Router } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { authMiddleware } from '../middleware/authMiddleware';
import { CriarUsuarioDto } from '../dto/usuario/criar-usuario.dto';
import { LoginDto } from '../dto/usuario/login.dto';
import { AtualizarUsuarioDto } from '../dto/usuario/atualizar-usuario.dto';
import { AtualizarSenhaDto } from '../dto/usuario/atualizar-senha.dto';
import { validationMiddleware } from '../middleware/validationMiddleware';

const usuarioController = Router();
const usuarioService = new UsuarioService();

usuarioController.post('/auth/register', validationMiddleware(CriarUsuarioDto), async (req, res, next) => {
    try {
        const novoUsuario = await usuarioService.criar(req.body);
        res.status(201).json(novoUsuario);
    } catch (error) {
        next(error);
    }
});

usuarioController.post('/auth/login', validationMiddleware(LoginDto), async (req, res, next) => {
    try {
        const usuario = await usuarioService.validarUsuario(req.body.email, req.body.senha);
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

usuarioController.get('/perfil', authMiddleware, async (req, res, next) => {
    try {
        const usuarioId = parseInt(req.query.id as string);

        if (isNaN(usuarioId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }
        // verificação de autorização
        if (req.user.sub !== usuarioId) {
            return res.status(403).json({ message: 'Você não tem permissão para acessar este perfil.' });
        }

        const perfil = await usuarioService.buscarPorId(usuarioId);
        res.json(perfil);
    } catch (error) {
        next(error);
    }
});

usuarioController.put('/perfil', authMiddleware, validationMiddleware(AtualizarUsuarioDto), async (req, res, next) => {
    try {
        const usuarioId = parseInt(req.query.id as string);
        if (isNaN(usuarioId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }
        // verificação de autorização
        if (req.user.sub !== usuarioId) {
            return res.status(403).json({ message: 'Você não tem permissão para atualizar este perfil.' });
        }

        const perfilAtualizado = await usuarioService.atualizar(usuarioId, req.body);
        res.json(perfilAtualizado);
    } catch (error) {
        next(error);
    }
});

usuarioController.put('/perfil/alterar-senha', authMiddleware, validationMiddleware(AtualizarSenhaDto), async (req, res, next) => {
    try {
        const usuarioId = parseInt(req.query.id as string);
        if (isNaN(usuarioId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }
        // verificação de autorização
        if (req.user.sub !== usuarioId) {
             return res.status(403).json({ message: 'Você não tem permissão para alterar a senha deste usuário.' });
        }
        
        if (req.body.novaSenha !== req.body.confirmarNovaSenha) {
            res.status(400).json({ message: 'A nova senha e a confirmação de senha não correspondem.' });
            return;
        }
        await usuarioService.atualizarSenha(usuarioId, req.body.senhaAtual, req.body.novaSenha);
        res.json({ message: 'Senha atualizada com sucesso.' });
    } catch (error) {
        next(error);
    }
});

export default usuarioController;
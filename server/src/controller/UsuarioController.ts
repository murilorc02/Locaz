import { Router, Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { authMiddleware } from '../middleware/authMiddleware';
import { CriarUsuarioDto } from '../dto/usuario/criar-usuario.dto';
import { LoginDto } from '../dto/usuario/login.dto';
import { AtualizarUsuarioDto } from '../dto/usuario/atualizar-usuario.dto';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { TipoUsuario } from '../entity/Usuario';

interface AuthenticatedRequest extends Request {
    user?: {
        sub: number;
        email: string;
        tipo: TipoUsuario;
        iat: number;
        exp: number;
    };
}

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

usuarioController.post('/auth/login', validationMiddleware(LoginDto), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                message: 'Email e senha são obrigatórios',
                statusCode: 400,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }

        const usuario = await usuarioService.validarUsuario(email, senha);


        if (!usuario) {
            return res.status(401).json({
                message: 'Credenciais inválidas',
                statusCode: 401,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }

        const result = usuarioService.login(usuario);

        res.json({
            message: 'Login realizado com sucesso',
            data: {
                access_token: result.token,
                user: result.user
            },
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro no login:', error);
        next(error);
    }
}
);

usuarioController.post('/alterarSenha', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { novaSenha } = req.body;
        const userId = req.user?.sub; // ID do usuário vem do token JWT

        // Validações
        if (!novaSenha) {
            return res.status(400).json({ error: 'Nova senha é obrigatória' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Validação adicional da senha (opcional)
        if (novaSenha.length < 6) {
            return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
        }

        // Chama o serviço passando o ID do usuário ao invés do email
        await usuarioService.recriarHashUsuarioPorId(userId, novaSenha);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

usuarioController.get('/perfil', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const usuarioId = parseInt(req.query.id as string);

        if (isNaN(usuarioId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }

        // Verificação se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
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

usuarioController.put('/perfil', authMiddleware, validationMiddleware(AtualizarUsuarioDto), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const usuarioId = parseInt(req.query.id as string);
        if (isNaN(usuarioId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }

        // Verificação se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
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

usuarioController.post('/recreate-password', async (req: Request, res: Response) => {
    try {
        const { email, novaSenha } = req.body;

        if (!email || !novaSenha) {
            return res.status(400).json({ error: 'Email e nova Senha obrigatórios' });
        }

        await usuarioService.recriarHashUsuarioPorId(email, novaSenha);

        res.json({ message: 'Hash recriado com sucesso' });
    } catch (error) {
        console.error('Erro ao recriar hash:', error);
        res.status(500).json({ error: 'Erro ao recriar hash' });
    }
});

export default usuarioController
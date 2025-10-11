import { Router, Request, Response, NextFunction } from 'express';
import { PredioService } from '../services/PredioService';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { CriarPredioDto, PatchPredioDto } from '../dto/PredioDto';
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

const predioController = Router();
const predioService = new PredioService();

// POST /api/predio/create
predioController.post('/predio/create',
    authMiddleware,
    validationMiddleware(CriarPredioDto),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            // Verificar se é proprietário
            if (req.user?.tipo !== TipoUsuario.LOCADOR) {
                return res.status(403).json({
                    message: 'Apenas proprietários podem criar prédios',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            const { horariosFuncionamento, ...dadosPredio } = req.body;

            const dadosCompletos = {
                ...dadosPredio,
                usuarioId: req.user.sub,
                horariosFuncionamento
            };

            const predio = await predioService.criarPredio(dadosCompletos);

            res.status(201).json({
                message: 'Prédio criado com sucesso',
                data: predio,
                statusCode: 201,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

// PATCH /api/predio/editar
predioController.patch('/predio/:id',
    authMiddleware,
    validationMiddleware(PatchPredioDto),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;

            if (!id) {
                return res.status(400).json({
                    message: 'ID do prédio é obrigatório',
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Verificar se o prédio existe
            const predioExistente = await predioService.buscarPorId(id);
            if (!predioExistente) {
                return res.status(404).json({
                    message: 'Prédio não encontrado',
                    statusCode: 404,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Verificar se o prédio pertence ao usuário logado
            if (predioExistente.usuario.id !== req.user?.sub) {
                return res.status(403).json({
                    message: 'Você não tem permissão para editar este prédio',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Separar horários de funcionamento dos demais dados
            const { horariosFuncionamento, ...dadosBasicos } = dadosAtualizacao;

            // Verificar se o nome não está sendo usado por outro prédio (apenas se o nome foi alterado)
            if (dadosBasicos.nome && dadosBasicos.nome !== predioExistente.nome) {
                const predioComMesmoNome = await predioService.buscarPorNome(dadosBasicos.nome);

                if (predioComMesmoNome && predioComMesmoNome.id !== id) {
                    return res.status(409).json({
                        message: 'Já existe um prédio com este nome',
                        statusCode: 409,
                        timestamp: new Date().toISOString(),
                        path: req.path
                    });
                }
            }

            // Atualizar apenas os campos fornecidos
            const predioAtualizado = await predioService.editarPredio(id, {
                ...dadosBasicos,
                horariosFuncionamento
            });

            if (!predioAtualizado) {
                return res.status(404).json({
                    message: 'Prédio não encontrado após atualização',
                    statusCode: 404,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Formatar a resposta com apenas os campos necessários
            const responseData = {
                id: predioAtualizado.id,
                nome: predioAtualizado.nome,
                endereco: predioAtualizado.endereco,
                cidade: predioAtualizado.cidade,
                estado: predioAtualizado.estado,
                cep: predioAtualizado.cep,
                descricao: predioAtualizado.descricao,
                usuario: {
                    id: predioAtualizado.usuario.id,
                    nome: predioAtualizado.usuario.nome
                },
                createdAt: predioAtualizado.createdAt,
                updatedAt: predioAtualizado.updatedAt
            };

            res.json({
                message: 'Prédio atualizado com sucesso',
                data: responseData,
                statusCode: 200,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/predio/getByAll
predioController.get('/predio/getByAll', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const predios = await predioService.buscarTodos();

        const prediosResponse = predios.map(predio => ({
            ...predio,
            usuario: {
                id: predio.usuario.id,
                nome: predio.usuario.nome
            }
        }));

        res.json({
            message: 'Prédios encontrados com sucesso',
            data: prediosResponse,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/predio/:id
predioController.get('/predio/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const predio = await predioService.buscarPorId(id);

        if (!predio) {
            return res.status(404).json({
                message: 'Prédio não encontrado',
                statusCode: 404,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }

        const predioResponse = {
            ...predio,
            usuario: {
                id: predio.usuario.id,
                nome: predio.usuario.nome
            }
        };

        res.json({
            message: 'Prédio encontrado com sucesso',
            data: predioResponse,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/predio/:id/horarios
predioController.get('/predio/:id/horarios', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const horarios = await predioService.buscarHorariosPorPredio(id);

        res.json({
            message: 'Horários encontrados com sucesso',
            data: horarios,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/predio/delete
predioController.delete('/predio/delete/:id',
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    message: 'ID do prédio é obrigatório',
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Verificar se o prédio pertence ao usuário
            const predioExistente = await predioService.buscarPorId(id);
            if (!predioExistente) {
                return res.status(404).json({
                    message: 'Prédio não encontrado',
                    statusCode: 404,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            if (predioExistente.usuario.id !== req.user?.sub) {
                return res.status(403).json({
                    message: 'Você não tem permissão para excluir este prédio',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            await predioService.excluirPredio(id);

            res.json({
                message: 'Prédio excluído com sucesso',
                statusCode: 200,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

export default predioController;
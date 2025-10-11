import { Router, Request, Response, NextFunction } from 'express';
import { SalaService } from '../services/SalaService';
import { PredioService } from '../services/PredioService';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { CreateSalaDto, AtualizarSalaDto } from '../dto/SalaDto';
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

const salaController = Router();
const salaService = new SalaService();
const predioService = new PredioService();

// POST /api/sala/create
salaController.post('/sala/create',
    authMiddleware,
    validationMiddleware(CreateSalaDto),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            // Verificar se é proprietário
            if (req.user?.tipo !== TipoUsuario.LOCADOR) {
                return res.status(403).json({
                    message: 'Apenas proprietários podem criar salas',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Verificar se o prédio existe e pertence ao usuário
            const predio = await predioService.buscarPorId(req.body.predioId);
            if (!predio) {
                return res.status(404).json({
                    message: 'Prédio não encontrado. É necessário ter um prédio cadastrado para criar uma sala',
                    statusCode: 404,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            if (predio.usuario.id !== req.user.sub) {
                return res.status(403).json({
                    message: 'Você não tem permissão para criar salas neste prédio',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            const sala = await salaService.criarSala(req.body);

            const responseData = {
                ...sala,
                predio: {
                    ...sala.predio,
                    usuario: {
                        id: sala.predio.usuario.id,
                        nome: sala.predio.usuario.nome
                    }
                }
            };

            res.status(201).json({
                message: 'Sala criada com sucesso',
                data: responseData,
                statusCode: 201,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/sala/editar
salaController.patch('/sala/editar/:id',
    authMiddleware,
    validationMiddleware(AtualizarSalaDto),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    message: 'ID da sala é obrigatório',
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Verificar se a sala existe e pertence ao usuário
            const salaExistente = await salaService.buscarPorId(id);
            if (!salaExistente) {
                return res.status(404).json({
                    message: 'Sala não encontrada',
                    statusCode: 404,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            if (salaExistente.predio.usuario.id !== req.user?.sub) {
                return res.status(403).json({
                    message: 'Você não tem permissão para editar esta sala',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            const salaAtualizada = await salaService.editarSala(id, req.body);

            res.json({
                message: 'Sala atualizada com sucesso',
                data: salaAtualizada,
                statusCode: 200,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/sala/getByAll
salaController.get('/sala/getByAll', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const salas = await salaService.buscarTodas();

        const salasFormatadas = salas.map((sala: any) => {
            return {
                ...sala,
                predio: {
                    ...sala.predio,
                    usuario: {
                        id: sala.predio.usuario.id,
                        nome: sala.predio.usuario.nome
                    }
                }
            };
        });

        res.json({
            message: 'Salas encontradas com sucesso',
            data: salasFormatadas,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sala/search - Rota principal para busca com filtros avançados
salaController.get('/sala/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            nome,
            cidade,
            capacidade,
            categoria,
            precoMinimo,
            precoMaximo,
            comodidades,
            dataReserva,
            horarioInicio,
            horarioFim,
            ordenarPor,
            ordem
        } = req.query;

        const filtros = {
            nome: nome as string,
            cidade: cidade as string,
            capacidade: capacidade ? parseInt(capacidade as string) : undefined,
            categoria: categoria as string,
            precoMinimo: precoMinimo ? parseFloat(precoMinimo as string) : undefined,
            precoMaximo: precoMaximo ? parseFloat(precoMaximo as string) : undefined,
            comodidades: comodidades 
                ? (Array.isArray(comodidades) ? comodidades as string[] : (comodidades as string).split(','))
                : undefined,
            dataReserva: dataReserva as string,
            horarioInicio: horarioInicio as string,
            horarioFim: horarioFim as string,
            ordenarPor: ordenarPor as 'preco' | 'capacidade' | 'nome',
            ordem: (ordem as 'ASC' | 'DESC') || 'ASC'
        };

        const salas = await salaService.buscarPorFiltros(filtros);

        const salasFormatadas = salas.map((sala: any) => ({
            id: sala.id,
            nome: sala.nome,
            descricao: sala.descricao,
            capacidade: sala.capacidade,
            categoria: sala.categoria,
            precoHora: sala.precoHora,
            reservaGratuita: sala.reservaGratuita,
            comodidades: sala.comodidades,
            predio: {
                id: sala.predio.id,
                nome: sala.predio.nome,
                cidade: sala.predio.cidade,
                estado: sala.predio.estado,
                endereco: sala.predio.endereco,
                usuario: {
                    id: sala.predio.usuario.id,
                    nome: sala.predio.usuario.nome
                }
            }
        }));

        res.json({
            message: 'Salas encontradas com sucesso',
            total: salasFormatadas.length,
            data: salasFormatadas,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sala/comodidades - Obter todas as comodidades disponíveis
salaController.get('/sala/comodidades', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const comodidades = await salaService.obterComodidadesDisponiveis();

        res.json({
            message: 'Comodidades encontradas com sucesso',
            data: comodidades,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sala/categorias - Obter todas as categorias disponíveis
salaController.get('/sala/categorias', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categorias = await salaService.obterCategoriasDisponiveis();

        res.json({
            message: 'Categorias encontradas com sucesso',
            data: categorias,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sala/estatisticas - Obter estatísticas gerais
salaController.get('/sala/estatisticas', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const estatisticas = await salaService.obterEstatisticas();

        res.json({
            message: 'Estatísticas obtidas com sucesso',
            data: estatisticas,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/sala/verificar-disponibilidade - Verificar disponibilidade de uma sala
salaController.post('/sala/verificar-disponibilidade', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { salaId, dataReserva, horarioInicio, horarioFim } = req.body;

        if (!salaId || !dataReserva || !horarioInicio || !horarioFim) {
            return res.status(400).json({
                message: 'Campos obrigatórios: salaId, dataReserva, horarioInicio, horarioFim',
                statusCode: 400,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }

        const disponivel = await salaService.verificarDisponibilidade(
            salaId,
            new Date(dataReserva),
            horarioInicio,
            horarioFim
        );

        res.json({
            message: disponivel ? 'Sala disponível' : 'Sala não disponível',
            disponivel,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sala/:id
salaController.get('/sala/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sala = await salaService.buscarPorId(id);

        if (!sala) {
            return res.status(404).json({
                message: 'Sala não encontrada',
                statusCode: 404,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
        const salaResponse = {
            ...sala,
            predio: {
                ...sala.predio,
                usuario: {
                    id: sala.predio.usuario.id,
                    nome: sala.predio.usuario.nome
                }
            }
        };

        res.json({
            message: 'Sala encontrada com sucesso',
            data: salaResponse,
            statusCode: 200,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/sala/delete
salaController.delete('/sala/delete/:id',
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    message: 'ID da sala é obrigatório',
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            // Verificar se a sala existe e pertence ao usuário
            const salaExistente = await salaService.buscarPorId(id);
            if (!salaExistente) {
                return res.status(404).json({
                    message: 'Sala não encontrada',
                    statusCode: 404,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            if (salaExistente.predio.usuario.id !== req.user?.sub) {
                return res.status(403).json({
                    message: 'Você não tem permissão para excluir esta sala',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }

            await salaService.excluirSala(id);

            res.json({
                message: 'Sala excluída com sucesso',
                statusCode: 200,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

export default salaController;
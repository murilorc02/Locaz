import { Router, Request, Response, NextFunction } from 'express';
import { PredioService } from '../services/PredioService';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { AtualizarHorariosFuncionamentoPredioDto, CriarPredioDto, PatchPredioDto } from '../dto/PredioDto';
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

predioController.post('/predio/create',
  authMiddleware,
  validationMiddleware(CriarPredioDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.tipo !== TipoUsuario.LOCADOR) {
        return res.status(403).json({
          message: 'Apenas proprietários podem criar prédios',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const { horariosFuncionamento, ...dadosPredio } = req.body;

      const predio = await predioService.criarPredio({
        ...dadosPredio,
        usuarioId: req.user.sub,
        horariosFuncionamento
      });

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

predioController.patch('/predio/:id',
  authMiddleware,
  validationMiddleware(PatchPredioDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

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
          message: 'Você não tem permissão para editar este prédio',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const predioAtualizado = await predioService.editarPredio(id, req.body);

      if (!predioAtualizado) {
        return res.status(404).json({
          message: 'Prédio não encontrado após atualização',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

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

predioController.patch('/predio/:id/horarios-funcionamento',
  authMiddleware,
  validationMiddleware(AtualizarHorariosFuncionamentoPredioDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

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
          message: 'Você não tem permissão para editar horários deste prédio',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const predioAtualizado = await predioService.atualizarHorariosFuncionamento(
        id,
        req.body.horariosFuncionamento
      );

      if (!predioAtualizado) {
        return res.status(404).json({
          message: 'Prédio não encontrado após atualização',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const responseData = {
        id: predioAtualizado.id,
        nome: predioAtualizado.nome,
        endereco: predioAtualizado.endereco,
        cidade: predioAtualizado.cidade,
        estado: predioAtualizado.estado,
        cep: predioAtualizado.cep,
        descricao: predioAtualizado.descricao,
        horariosFuncionamento: predioAtualizado.horariosFuncionamento,
        usuario: {
          id: predioAtualizado.usuario.id,
          nome: predioAtualizado.usuario.nome
        },
        createdAt: predioAtualizado.createdAt,
        updatedAt: predioAtualizado.updatedAt
      };

      res.json({
        message: 'Horários de funcionamento atualizados com sucesso',
        data: responseData,
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/predio/:id/horarios-funcionamento - Obter horários de funcionamento
predioController.get('/predio/:id/horarios-funcionamento',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const predio = await predioService.buscarPorId(id);

      if (!predio) {
        return res.status(404).json({
          message: 'Prédio não encontrado',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.json({
        message: 'Horários de funcionamento obtidos com sucesso',
        data: {
          predioId: predio.id,
          nomePredio: predio.nome,
          horariosFuncionamento: predio.horariosFuncionamento || []
        },
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

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

predioController.get('/predio/meus-predios',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.tipo !== TipoUsuario.LOCADOR) {
        return res.status(403).json({
          message: 'Apenas proprietários podem acessar esta funcionalidade',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const predios = await predioService.buscarPorUsuario(req.user.sub);

      const prediosResponse = predios.map(predio => ({
        id: predio.id,
        nome: predio.nome,
        endereco: predio.endereco,
        cidade: predio.cidade,
        estado: predio.estado,
        cep: predio.cep,
        descricao: predio.descricao,
        horariosFuncionamento: predio.horariosFuncionamento,
        salas: predio.salas?.map(sala => ({
          id: sala.id,
          nome: sala.nome,
          capacidade: sala.capacidade,
          categoria: sala.categoria
        })),
        createdAt: predio.createdAt,
        updatedAt: predio.updatedAt
      }));

      res.json({
        message: 'Prédios encontrados com sucesso',
        total: prediosResponse.length,
        data: prediosResponse,
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

predioController.get('/predio/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'ID do prédio inválido',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

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

predioController.get('/predio/:id/horarios', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'ID do prédio inválido',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

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

predioController.delete('/predio/delete/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

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
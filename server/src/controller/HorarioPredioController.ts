import { Router, Request, Response, NextFunction } from 'express';
import { HorarioPredioService } from '../services/HorarioPredioService';
import { HorarioPredioRepository } from '../repository/HorarioPredioRepository';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { 
  CriarHorarioPredioDto, 
  CriarMultiplosHorariosPredioDto,
  AtualizarHorarioPredioDto 
} from '../dto/HorarioPredioDto';
import { PredioService } from '../services/PredioService';
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

const horarioPredioController = Router();
const horarioPredioService = new HorarioPredioService();
const horarioPredioRepository = new HorarioPredioRepository();
const predioService = new PredioService();

// POST /api/horario-predio/:predioId - Criar horário único
horarioPredioController.post('/:predioId',
  authMiddleware,
  validationMiddleware(CriarHorarioPredioDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const predioId = Number(req.params.predioId);

      if (isNaN(predioId)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar se o prédio existe e pertence ao usuário
      const predio = await predioService.buscarPorId(predioId);
      if (!predio) {
        return res.status(404).json({
          message: 'Prédio não encontrado',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (predio.usuario.id !== req.user?.sub) {
        return res.status(403).json({
          message: 'Você não tem permissão para adicionar horários a este prédio',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horario = await horarioPredioService.criarHorario(predioId, req.body);

      res.status(201).json({
        message: 'Horário criado com sucesso',
        data: horario,
        statusCode: 201,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/horario-predio/:predioId/multiplos - Criar múltiplos horários
horarioPredioController.post('/:predioId/multiplos',
  authMiddleware,
  validationMiddleware(CriarMultiplosHorariosPredioDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const predioId = Number(req.params.predioId);

      if (isNaN(predioId)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar se o prédio existe e pertence ao usuário
      const predio = await predioService.buscarPorId(predioId);
      if (!predio) {
        return res.status(404).json({
          message: 'Prédio não encontrado',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (predio.usuario.id !== req.user?.sub) {
        return res.status(403).json({
          message: 'Você não tem permissão para adicionar horários a este prédio',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horarios = await horarioPredioService.criarMultiplos(
        predioId,
        req.body.horarios
      );

      res.status(201).json({
        message: 'Horários criados com sucesso',
        data: horarios,
        statusCode: 201,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/horario-predio/predio/:predioId/ativos - Buscar horários ativos
horarioPredioController.get('/predio/:predioId/ativos',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const predioId = Number(req.params.predioId);

      if (isNaN(predioId)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horarios = await horarioPredioRepository.buscarAtivos(predioId);

      res.json({
        message: 'Horários ativos encontrados com sucesso',
        data: horarios,
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/horario-predio/predio/:predioId - Buscar todos horários do prédio
horarioPredioController.get('/predio/:predioId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const predioId = Number(req.params.predioId);

      if (isNaN(predioId)) {
        return res.status(400).json({
          message: 'ID do prédio inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horarios = await horarioPredioRepository.buscarPorPredio(predioId);

      res.json({
        message: 'Horários encontrados com sucesso',
        data: horarios,
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/horario-predio/:id - Buscar horário por ID
horarioPredioController.get('/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'ID do horário inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horario = await horarioPredioRepository.buscarPorId(id);

      if (!horario) {
        return res.status(404).json({
          message: 'Horário não encontrado',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.json({
        message: 'Horário encontrado com sucesso',
        data: horario,
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/horario-predio/:id - Atualizar horário
horarioPredioController.patch('/:id',
  authMiddleware,
  validationMiddleware(AtualizarHorarioPredioDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'ID do horário inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horarioExistente = await horarioPredioRepository.buscarPorId(id);

      if (!horarioExistente) {
        return res.status(404).json({
          message: 'Horário não encontrado',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar permissão
      if (horarioExistente.predio.usuario.id !== req.user?.sub) {
        return res.status(403).json({
          message: 'Você não tem permissão para editar este horário',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horarioAtualizado = await horarioPredioService.atualizarHorario(
        horarioExistente,
        req.body
      );

      res.json({
        message: 'Horário atualizado com sucesso',
        data: horarioAtualizado,
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/horario-predio/:id - Deletar horário
horarioPredioController.delete('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'ID do horário inválido',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const horarioExistente = await horarioPredioRepository.buscarPorId(id);

      if (!horarioExistente) {
        return res.status(404).json({
          message: 'Horário não encontrado',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar permissão
      if (horarioExistente.predio.usuario.id !== req.user?.sub) {
        return res.status(403).json({
          message: 'Você não tem permissão para deletar este horário',
          statusCode: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      await horarioPredioService.deletar(horarioExistente);

      res.json({
        message: 'Horário deletado com sucesso',
        statusCode: 200,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

export default horarioPredioController;
import { Router, Request, Response, NextFunction } from 'express';
import reservaService from '../services/ReservaService';
import { locatarioMiddleware, proprietarioMiddleware } from '../middleware/authMiddleware';

const reservaController = Router();

// ==================== LOCATÁRIO ====================

reservaController.post('/locatario/create', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.sub;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reserva = await reservaService.criar({
      ...req.body,
      locatarioId: idLocatario,
    });

    res.status(201).json({
      success: true,
      message: 'Reserva criada com sucesso. Aguardando aprovação do locador.',
      data: reserva,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/all', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.sub;

    const reservas = await reservaService.listarTodasLocatario(idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/ordenarData', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.sub;
    const ordem = req.query.ordem as string;

    if (!ordem || !['asc', 'desc'].includes(ordem)) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro ordem inválido. Use "asc" ou "desc"',
      });
    }

    const reservas = await reservaService.listarOrdenadoPorDataLocatario(idLocatario, ordem);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/ordenaValor', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.sub;

    const reservas = await reservaService.listarOrdenadoPorValorLocatario(idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/detalhes/:id', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const idLocatario = (req as any).user?.sub;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const reserva = await reservaService.buscarPorIdLocatario(id, idLocatario);

    res.status(200).json({
      success: true,
      data: reserva,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/predio/:idPredio', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idPredio = parseInt(req.params.idPredio);
    const idLocatario = (req as any).user?.sub;

    if (isNaN(idPredio)) {
      return res.status(400).json({
        success: false,
        message: 'ID do prédio inválido',
      });
    }

    const reservas = await reservaService.buscarPorPredioLocatario(idPredio, idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/sala/:idSala', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = parseInt(req.params.idSala);
    const idLocatario = (req as any).user?.sub;

    if (isNaN(idSala)) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    const reservas = await reservaService.buscarPorSalaLocatario(idSala, idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/sala/:idSala/horarios-reserva', 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idSala = parseInt(req.params.idSala);

      if (isNaN(idSala)) {
        return res.status(400).json({
          success: false,
          message: 'ID da sala inválido',
        });
      }

      const horarios = await reservaService.buscarHorarios(idSala);

      res.status(200).json({
        success: true,
        message: 'Horários dos próximos 30 dias obtidos com sucesso',
        data: horarios,
      });
    } catch (error: any) {
      next(error);
    }
  }
);

reservaController.patch('/locatario/:id/cancelar', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReserva = parseInt(req.params.id);
    const idLocatario = (req as any).user?.sub;

    if (isNaN(idReserva)) {
      return res.status(400).json({
        success: false,
        message: 'ID da reserva inválido',
      });
    }

    const reserva = await reservaService.cancelarPorLocatario({
      idReserva,
      idLocatario,
    });

    res.status(200).json({
      success: true,
      message: 'Reserva cancelada com sucesso',
      data: reserva,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locatario/:status', locatarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.params.status;
    const idLocatario = (req as any).user?.sub;

    const reservas = await reservaService.listarPorStatusLocatario(idLocatario, status as any);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// ==================== LOCADOR ====================

reservaController.get('/locador/all', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.sub;

    const reservas = await reservaService.listarTodasLocador(idLocador);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locador/ordenarData', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.sub;
    const ordem = req.query.ordem as string;

    if (!ordem || !['asc', 'desc'].includes(ordem)) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro ordem inválido. Use "asc" ou "desc"',
      });
    }

    const reservas = await reservaService.listarOrdenadoPorDataLocador(idLocador, ordem);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locador/ordenarValor', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.sub;

    const reservas = await reservaService.listarOrdenadoPorValorLocador(idLocador);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locador/predio/:idPredio', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idPredio = parseInt(req.params.idPredio);
    const idLocador = (req as any).user?.sub;

    if (isNaN(idPredio)) {
      return res.status(400).json({
        success: false,
        message: 'ID do prédio inválido',
      });
    }

    const reservas = await reservaService.buscarPorPredioLocador(idPredio, idLocador);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locador/sala/:idSala', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = parseInt(req.params.idSala);
    const idLocador = (req as any).user?.sub;

    if (isNaN(idSala)) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    const reservas = await reservaService.buscarPorSalaLocador(idSala, idLocador);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.patch('/locador/:id/aceitar', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReserva = parseInt(req.params.id);
    const idLocador = (req as any).user?.sub;

    if (isNaN(idReserva)) {
      return res.status(400).json({
        success: false,
        message: 'ID da reserva inválido',
      });
    }

    const reserva = await reservaService.aceitar({
      idReserva,
      idLocador,
    });

    res.status(200).json({
      success: true,
      message: 'Reserva aceita com sucesso',
      data: reserva,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.patch('/locador/:id/recusar', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReserva = parseInt(req.params.id);
    const idLocador = (req as any).user?.sub;

    if (isNaN(idReserva)) {
      return res.status(400).json({
        success: false,
        message: 'ID da reserva inválido',
      });
    }

    const reserva = await reservaService.recusar({
      idReserva,
      idLocador,
    });

    res.status(200).json({
      success: true,
      message: 'Reserva recusada',
      data: reserva,
    });
  } catch (error: any) {
    next(error);
  }
});

reservaController.get('/locador/:status', proprietarioMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.params.status;
    const idLocador = (req as any).user?.sub;

    const reservas = await reservaService.listarPorStatusLocador(idLocador, status as any);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

export default reservaController;
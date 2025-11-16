import { Router, Request, Response, NextFunction } from 'express';
import reservaService from '../services/ReservaService';
import { authMiddleware, locatarioMiddleware, proprietarioMiddleware } from '../middleware/authMiddleware';

const reservaController = Router();

/**
 * GET /api/reservas/horarios/:idSala
 * Retorna os horários disponíveis e ocupados de uma sala
 */
reservaController.get('/horarios/:idSala', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = Number(req.params.idSala);
    
    if (!idSala || isNaN(idSala)) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    const horarios = await reservaService.buscarHorarios(idSala);
    return res.json({
      success: true,
      data: horarios,
    });
  } catch (error) {
    next(error);
  }
});
reservaController.use(authMiddleware);

// ==================== LOCATÁRIO ====================

/**
 * 1. POST /api/reservas/locatario/create
 * Criar nova reserva com status PENDENTE
 */
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

/**
 * 7. GET /api/reservas/locatario/all
 * Buscar todas as reservas do locatário
 */
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

/**
 * 9. GET /api/reservas/locatario/ordenarData?ordem=asc|desc
 * Ordenar reservas por data
 */
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

/**
 * 10. GET /api/reservas/locatario/ordenaValor
 * Ordenar reservas por valor total
 */
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

/**
 * 2. GET /api/reservas/locatario/detalhes/:id
 * Buscar reserva por ID
 */
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

/**
 * 3. GET /api/reservas/locatario/predio/:idPredio
 * Buscar reservas por ID de prédio
 */
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

/**
 * 5. GET /api/reservas/locatario/sala/:idSala
 * Buscar reservas por ID de sala
 */
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

/**
 * GET /api/reservas/locatario/sala/:idSala/horarios-reserva
 * Buscar horários disponíveis para uma sala
 */
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

/**
 * 11. PATCH /api/reservas/locatario/:id/cancelar
 * Cancelar reserva
 */
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

/**
 * 8. GET /api/reservas/locatario/:status
 * Buscar reservas por status (pendente, aceita, recusada, cancelada)
 * DEVE VIR POR ÚLTIMO entre as rotas do locatário
 */
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

// ==================== ENDPOINTS DO LOCADOR ====================
// Mesma lógica: rotas específicas ANTES de rotas com parâmetros

// ==================== ENDPOINTS DO LOCADOR ====================
// Mesma lógica: rotas específicas ANTES de rotas com parâmetros

/**
 * 18. GET /api/reservas/locador/all
 * Buscar todas as reservas do locador
 */
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

/**
 * 20. GET /api/reservas/locador/ordenarData?ordem=asc|desc
 */
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

/**
 * 21. GET /api/reservas/locador/ordenarValor
 */
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

/**
 * 14. GET /api/reservas/locador/predio/:idPredio
 */
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

/**
 * 16. GET /api/reservas/locador/sala/:idSala
 */
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

/**
 * 12. PATCH /api/reservas/locador/:id/aceitar
 */
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

/**
 * 13. PATCH /api/reservas/locador/:id/recusar
 */
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

/**
 * 19. GET /api/reservas/locador/:status
 * DEVE VIR POR ÚLTIMO entre as rotas do locador
 */
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
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import reservaService from '../services/ReservaService';

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

// ==================== ENDPOINTS DO LOCATÁRIO ====================

/**
 * 1. POST /api/reservas/locatario/create
 * Criar nova reserva com status PENDENTE
 */
reservaController.post('/locatario/create',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;

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
 * 2. GET /api/reservas/locatario/detalhes/:id
 * Buscar reserva por ID (apenas reservas do próprio locatário)
 */
reservaController.get('/locatario/detalhes/:id',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const idLocatario = (req as any).user?.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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
reservaController.get('/locatario/predio/:idPredio',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idPredio = parseInt(req.params.idPredio);
    const idLocatario = (req as any).user?.id;

    if (isNaN(idPredio)) {
      return res.status(400).json({
        success: false,
        message: 'ID do prédio inválido',
      });
    }

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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
 * 4. GET /api/reservas/locatario/predio/:nomePredio
 * Buscar reservas por nome de prédio (busca com LIKE)
 */
reservaController.get('/locatario/predio/:nomePredio',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nomePredio = req.params.nomePredio;
    const idLocatario = (req as any).user?.id;

    if (!nomePredio) {
      return res.status(400).json({
        success: false,
        message: 'Nome do prédio inválido',
      });
    }

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.buscarPorNomePredioLocatario(nomePredio, idLocatario);

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
reservaController.get('/locatario/sala/:idSala',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = parseInt(req.params.idSala);
    const idLocatario = (req as any).user?.id;

    if (isNaN(idSala)) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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

// 6. Buscar reservas por nome de sala 
reservaController.get('/locatario/sala/:nomeSala',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nomeSala = req.params.nomeSala;
    const idLocatario = (req as any).user?.id;

    if (!nomeSala) {
      return res.status(400).json({
        success: false,
        message: 'Nome da sala inválido',
      });
    }

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.buscarPorNomeSalaLocatario(nomeSala, idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});


// 7. Buscar todas as reservas do locatário
reservaController.get('/locatario/all',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

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


// 8. Buscar reservas por status (pendente, aceita, recusada, cancelada)
reservaController.get('/locatario/:status',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.params.status;
    const idLocatario = (req as any).user?.id;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

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

/**
 * 9. GET /api/reservas/locatario/ordenar/data?ordem=asc|desc
 * Ordenar reservas por data (mais recente ao mais antigo ou vice-versa)
 */
reservaController.get('/locatario/ordenarData',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;
    const ordem = req.query.ordem as string;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!ordem || !['asc', 'desc'].includes(ordem)) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro ordem inválido. Use "asc" (mais antigo ao mais recente) ou "desc" (mais recente ao mais antigo)',
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
 * 10. GET /api/reservas/locatario/ordenar/valor
 * Ordenar reservas por valor total (do menor para o maior)
 */
reservaController.get('/locatario/ordenaValor',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

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
 * 11. PATCH /api/reservas/locatario/:id/cancelar
 * Cancelar reserva (atualiza status para CANCELADA)
 */
reservaController.patch('/locatario/:id/cancelar',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReserva = parseInt(req.params.id);
    const idLocatario = (req as any).user?.id;

    if (isNaN(idReserva)) {
      return res.status(400).json({
        success: false,
        message: 'ID da reserva inválido',
      });
    }

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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

// ==================== ENDPOINTS DO LOCADOR ====================

/**
 * 12. PATCH /api/reservas/locador/:id/aceitar
 * Aceitar solicitação de reserva (muda status de PENDENTE para ACEITA)
 */
reservaController.patch('/locador/:id/aceitar',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReserva = parseInt(req.params.id);
    const idLocador = (req as any).user?.id;

    if (isNaN(idReserva)) {
      return res.status(400).json({
        success: false,
        message: 'ID da reserva inválido',
      });
    }

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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
 * Recusar solicitação de reserva (muda status de PENDENTE para RECUSADA)
 */
reservaController.patch('/locador/:id/recusar',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReserva = parseInt(req.params.id);
    const idLocador = (req as any).user?.id;

    if (isNaN(idReserva)) {
      return res.status(400).json({
        success: false,
        message: 'ID da reserva inválido',
      });
    }

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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
 * 14. GET /api/reservas/locador/predio/:idPredio
 * Buscar reservas por ID de prédio (apenas prédios do locador)
 */
reservaController.get('/locador/predio/:idPredio',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idPredio = parseInt(req.params.idPredio);
    const idLocador = (req as any).user?.id;

    if (isNaN(idPredio)) {
      return res.status(400).json({
        success: false,
        message: 'ID do prédio inválido',
      });
    }

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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
 * 15. GET /api/reservas/locador/predio/nome/:nomePredio
 * Buscar reservas por nome de prédio (apenas prédios do locador)
 */
reservaController.get('/locador/predio/:nomePredio',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nomePredio = req.params.nomePredio;
    const idLocador = (req as any).user?.id;

    if (!nomePredio) {
      return res.status(400).json({
        success: false,
        message: 'Nome do prédio inválido',
      });
    }

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.buscarPorNomePredioLocador(nomePredio, idLocador);

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
 * Buscar reservas por ID de sala (apenas salas do locador)
 */
reservaController.get('/locador/sala/:idSala',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = parseInt(req.params.idSala);
    const idLocador = (req as any).user?.id;

    if (isNaN(idSala)) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
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
 * 17. GET /api/reservas/locador/sala/nome/:nomeSala
 * Buscar reservas por nome de sala (apenas salas do locador)
 */
reservaController.get('/locador/sala/:nomeSala',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nomeSala = req.params.nomeSala;
    const idLocador = (req as any).user?.id;

    if (!nomeSala) {
      return res.status(400).json({
        success: false,
        message: 'Nome da sala inválido',
      });
    }

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.buscarPorNomeSalaLocador(nomeSala, idLocador);

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
 * 18. GET /api/reservas/locador/all
 * Buscar todas as reservas de todos os prédios/salas do locador
 */
reservaController.get('/locador/all',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.id;

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

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
 * 19. GET /api/reservas/locador/status/:status
 * Buscar reservas por status (apenas das salas do locador)
 */
reservaController.get('/locador/:status',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.params.status;
    const idLocador = (req as any).user?.id;

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

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

/**
 * 20. GET /api/reservas/locador/ordenar/data?ordem=asc|desc
 * Ordenar reservas por data (mais recente ao mais antigo ou vice-versa)
 */
reservaController.get('/locador/ordenarData',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.id;
    const ordem = req.query.ordem as string;

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!ordem || !['asc', 'desc'].includes(ordem)) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro ordem inválido. Use "asc" (mais antigo ao mais recente) ou "desc" (mais recente ao mais antigo)',
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
 * 21. GET /api/reservas/locador/ordenar/valor
 * Ordenar reservas por valor total (do menor para o maior)
 */
reservaController.get('/locador/ordenarValor',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.id;

    if (!idLocador) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

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

export default reservaController;
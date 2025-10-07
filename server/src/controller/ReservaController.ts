import { Router, Request, Response, NextFunction } from 'express';
import reservaService from '../services/ReservaService';

const reservaController = Router();

// 1. POST /api/reservas - Criar nova reserva
reservaController.post('/', async (req: Request, res: Response, next: NextFunction) => {
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
      idLocatario,
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

// 2. GET /api/reservas - Listar todas as reservas
reservaController.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reservas = await reservaService.listarTodas();

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// 3. GET /api/reservas/:id - Buscar reserva por ID
reservaController.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const reserva = await reservaService.buscarPorId(id);

    res.status(200).json({
      success: true,
      data: reserva,
    });
  } catch (error: any) {
    next(error);
  }
});

// 4. DELETE /api/reservas/:id - Deletar reserva
reservaController.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const idLocatario = (req as any).user?.id;

    if (!id) {
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

    await reservaService.deletar(id, idLocatario);

    res.status(200).json({
      success: true,
      message: 'Reserva deletada com sucesso',
    });
  } catch (error: any) {
    next(error);
  }
});

// ==================== AÇÕES DO LOCADOR (2 endpoints) ====================

// 5. PATCH /api/reservas/:id/aceitar - Locador aceita a reserva
reservaController.patch('/:id/aceitar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.id;
    const idReserva = req.params.id;

    if (!idReserva) {
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

// 6. PATCH /api/reservas/:id/recusar - Locador recusa a reserva
reservaController.patch('/:id/recusar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocador = (req as any).user?.id;
    const idReserva = req.params.id;

    if (!idReserva) {
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

// ==================== AÇÕES DO LOCATÁRIO (5 endpoints) ====================

// 7. PATCH /api/reservas/:id/cancelar - Locatário cancela a reserva
reservaController.patch('/:id/cancelar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;
    const idReserva = req.params.id;

    if (!idReserva) {
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

// 8. GET /api/reservas/locatario/minhas - Listar todas as reservas do locatário
reservaController.get('/locatario/minhas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.listarPorLocatario(idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// 9. GET /api/reservas/locatario/futuras - Listar reservas futuras do locatário
reservaController.get('/locatario/futuras', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.listarReservasFuturas(idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// 10. GET /api/reservas/locatario/historico - Listar histórico de reservas do locatário
reservaController.get('/locatario/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.listarHistorico(idLocatario);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// 11. GET /api/reservas/locatario/status/:status - Listar reservas do locatário por status
reservaController.get('/locatario/status/:status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idLocatario = (req as any).user?.id;
    const status = req.params.status;

    if (!idLocatario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const reservas = await reservaService.listarPorLocatarioEStatus(
      idLocatario,
      status as any,
    );

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// ==================== CONSULTAS POR SALA (4 endpoints) ====================

// 12. GET /api/reservas/sala/:idSala/pendentes - Listar reservas pendentes de uma sala
reservaController.get('/sala/:idSala/pendentes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = req.params.idSala;

    if (!idSala) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    const reservas = await reservaService.listarPendentesPorSala(idSala);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// 13. GET /api/reservas/sala/:idSala/status/:status - Listar reservas de uma sala por status
reservaController.get('/sala/:idSala/status/:status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = req.params.idSala;
    const status = req.params.status;

    if (!idSala) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    const reservas = await reservaService.listarPorSalaEStatus(idSala, status as any);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// 14. GET /api/reservas/sala/:idSala/data/:data - Listar reservas de uma sala em uma data específica
reservaController.get('/sala/:idSala/data/:data', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = req.params.idSala;
    const data = req.params.data;

    if (!idSala) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    const reservas = await reservaService.listarPorSalaEData(idSala, data);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// 15. GET /api/reservas/sala/:idSala/periodo - Listar reservas de uma sala em um período
reservaController.get('/sala/:idSala/periodo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSala = req.params.idSala;
    const { dataInicio, dataFim } = req.query;

    if (!idSala) {
      return res.status(400).json({
        success: false,
        message: 'ID da sala inválido',
      });
    }

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        success: false,
        message: 'Os parâmetros dataInicio e dataFim são obrigatórios',
      });
    }

    const reservas = await reservaService.listarPorSalaEPeriodo(
      idSala,
      dataInicio as string,
      dataFim as string,
    );

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// ==================== VERIFICAÇÕES (1 endpoint) ====================

// 16. GET /api/reservas/verificar/disponibilidade - Verificar disponibilidade de horário
reservaController.get('/verificar/disponibilidade', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idSala, data, horarioInicio, horarioFim } = req.query;

    if (!idSala || !data || !horarioInicio || !horarioFim) {
      return res.status(400).json({
        success: false,
        message: 'Todos os parâmetros são obrigatórios: idSala, data, horarioInicio, horarioFim',
      });
    }

    const disponivel = await reservaService.verificarDisponibilidade(
      idSala as string,
      data as string,
      horarioInicio as string,
      horarioFim as string,
    );

    res.status(200).json({
      success: true,
      disponivel,
      message: disponivel ? 'Horário disponível' : 'Horário indisponível',
    });
  } catch (error: any) {
    next(error);
  }
});

// ==================== FILTROS GERAIS (1 endpoint) ====================

// 17. GET /api/reservas/filtro/status/:status - Listar todas as reservas por status
reservaController.get('/filtro/status/:status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.params.status;

    const reservas = await reservaService.listarPorStatus(status as any);

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error: any) {
    next(error);
  }
});

// ==================== JOB AUTOMÁTICO (1 endpoint) ====================

// 18. POST /api/reservas/job/cancelar-expiradas - Job para cancelar reservas expiradas
reservaController.post('/job/cancelar-expiradas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reservaService.cancelarExpiradas();

    res.status(200).json({
      success: true,
      message: 'Reservas expiradas canceladas com sucesso',
    });
  } catch (error: any) {
    next(error);
  }
});

export default reservaController;
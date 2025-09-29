import { Request, Response } from 'express';
import { ReservaService } from '../services/ReservaService';
import { ReservaRepository } from '../repository/ReservaRepository';
import { CreateReservaDTO, UpdateReservaStatusDTO } from '../dto/ReservaDto';
import { StatusReserva } from '../entity/Reserva';

export class ReservaController {
  private reservaService: ReservaService;
  private reservaRepository: ReservaRepository;

  constructor() {
    this.reservaService = new ReservaService();
    this.reservaRepository = new ReservaRepository();
  }

  // POST /api/reservas
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const dadosReserva: CreateReservaDTO = req.body;

      // Validar dados obrigatórios
      if (!dadosReserva.dataReserva || !dadosReserva.horarioInicio || 
          !dadosReserva.horarioFim || !dadosReserva.locatarioId || !dadosReserva.salaId) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios: dataReserva, horarioInicio, horarioFim, locatarioId, salaId'
        });
      }

      // Converter string de data para Date
      const dataReserva = new Date(dadosReserva.dataReserva);
      
      const reserva = await this.reservaService.criarReserva({
        ...dadosReserva,
        dataReserva
      });

      return res.status(201).json({
        success: true,
        data: reserva,
        message: 'Reserva criada com sucesso'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar reserva'
      });
    }
  }

  // GET /api/reservas/:id
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da reserva é obrigatório'
        });
      }

      const reserva = await this.reservaRepository.buscarPorId(id);
      
      if (!reserva) {
        return res.status(404).json({
          success: false,
          message: 'Reserva não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: reserva
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // GET /api/reservas
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const reservas = await this.reservaRepository.buscarTodas();
      
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar reservas'
      });
    }
  }

  // GET /api/reservas/usuario/:usuarioId
  async getByUser(req: Request, res: Response): Promise<Response> {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId || isNaN(Number(usuarioId))) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário deve ser um número válido'
        });
      }

      const reservas = await this.reservaRepository.buscarPorUsuario(parseInt(usuarioId));
      
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar reservas do usuário'
      });
    }
  }

  // GET /api/reservas/sala/:salaId
  async getBySala(req: Request, res: Response): Promise<Response> {
    try {
      const { salaId } = req.params;
      
      if (!salaId) {
        return res.status(400).json({
          success: false,
          message: 'ID da sala é obrigatório'
        });
      }

      const reservas = await this.reservaRepository.buscarPorSala(salaId);
      
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar reservas da sala'
      });
    }
  }

  // GET /api/reservas/proprietario/:proprietarioId
  async getByProprietario(req: Request, res: Response): Promise<Response> {
    try {
      const { proprietarioId } = req.params;
      
      if (!proprietarioId || isNaN(Number(proprietarioId))) {
        return res.status(400).json({
          success: false,
          message: 'ID do proprietário deve ser um número válido'
        });
      }

      const reservas = await this.reservaRepository.buscarPorProprietario(parseInt(proprietarioId));
      
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar reservas do proprietário'
      });
    }
  }

  // GET /api/reservas/status/:status
  async getByStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { status } = req.params;
      
      if (!Object.values(StatusReserva).includes(status as StatusReserva)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Valores aceitos: pendente, confirmada, cancelada, recusada'
        });
      }

      const reservas = await this.reservaRepository.buscarPorStatus(status as StatusReserva);
      
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar reservas por status'
      });
    }
  }

  // GET /api/reservas/periodo
  async getByPeriodo(req: Request, res: Response): Promise<Response> {
    try {
      const { dataInicio, dataFim } = req.query;
      
      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          success: false,
          message: 'dataInicio e dataFim são obrigatórios'
        });
      }

      const reservas = await this.reservaRepository.buscarPorPeriodo(
        new Date(dataInicio as string),
        new Date(dataFim as string)
      );
      
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar reservas por período'
      });
    }
  }

  // PATCH /api/reservas/:id/status
  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status }: { status: StatusReserva } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: 'ID da reserva e status são obrigatórios'
        });
      }

      if (!Object.values(StatusReserva).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Valores aceitos: pendente, confirmada, cancelada, recusada'
        });
      }

      const reserva = await this.reservaRepository.atualizar(id, { status });
      
      if (!reserva) {
        return res.status(404).json({
          success: false,
          message: 'Reserva não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: reserva,
        message: 'Status da reserva atualizado com sucesso'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar status da reserva'
      });
    }
  }

  // DELETE /api/reservas/:id
  async cancel(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da reserva é obrigatório'
        });
      }

      await this.reservaService.cancelarReserva(id);
      
      return res.status(200).json({
        success: true,
        message: 'Reserva cancelada com sucesso'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erro ao cancelar reserva'
      });
    }
  }

  // GET /api/reservas/estatisticas
  async getEstatisticas(req: Request, res: Response): Promise<Response> {
    try {
      const pendentes = await this.reservaRepository.contarPorStatus(StatusReserva.PENDENTE);
      const confirmadas = await this.reservaRepository.contarPorStatus(StatusReserva.CONFIRMADA);
      const canceladas = await this.reservaRepository.contarPorStatus(StatusReserva.CANCELADA);
      const recusadas = await this.reservaRepository.contarPorStatus(StatusReserva.RECUSADA);

      return res.status(200).json({
        success: true,
        data: {
          pendentes,
          confirmadas,
          canceladas,
          recusadas,
          total: pendentes + confirmadas + canceladas + recusadas
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar estatísticas'
      });
    }
  }

  // GET /api/reservas/ativas
  async getReservasAtivas(req: Request, res: Response): Promise<Response> {
    try {
      const reservas = await this.reservaRepository.buscarReservasAtivas();
      
      return res.status(200).json({
        success: true,
        data: reservas
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar reservas ativas'
      });
    }
  }

  // POST /api/reservas/verificar-conflito
  async verificarConflito(req: Request, res: Response): Promise<Response> {
    try {
      const { salaId, dataReserva, horarioInicio, horarioFim, excluirReservaId } = req.body;
      
      if (!salaId || !dataReserva || !horarioInicio || !horarioFim) {
        return res.status(400).json({
          success: false,
          message: 'salaId, dataReserva, horarioInicio e horarioFim são obrigatórios'
        });
      }

      const conflito = await this.reservaRepository.verificarConflito(
        salaId,
        new Date(dataReserva),
        horarioInicio,
        horarioFim,
        excluirReservaId
      );

      return res.status(200).json({
        success: true,
        data: {
          temConflito: conflito,
          message: conflito ? 'Existe conflito de horário' : 'Horário disponível'
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao verificar conflito'
      });
    }
  }
}
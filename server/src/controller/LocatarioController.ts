import { Request, Response } from 'express';
import { LocatarioService } from '../services/LocatarioService';
import { StatusReserva } from '../entity/Reserva';

export class LocatarioController {
  private locatarioService = new LocatarioService();

  // Busca de Salas
  async buscarSalas(req: Request, res: Response): Promise<void> {
    try {
      const filtros = req.query;
      const salas = await this.locatarioService.buscarSalas(filtros);
      res.json(salas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async buscarSalaPorId(req: Request, res: Response): Promise<void> {
    try {
      const salaId = parseInt(req.params.salaId);
      const sala = await this.locatarioService.buscarSalaPorId(salaId);
      res.json(sala);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async buscarSalasPorPontosDestaque(req: Request, res: Response): Promise<void> {
    try {
      const { pontosDestaque } = req.body;
      const salas = await this.locatarioService.buscarSalasPorPontosDestaque(pontosDestaque);
      res.json(salas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Horários
  async consultarHorariosDisponiveis(req: Request, res: Response): Promise<void> {
    try {
      const { salaId, data } = req.query;
      const horarios = await this.locatarioService.consultarHorariosDisponiveis({
        salaId: parseInt(salaId as string),
        data: data as string
      });
      res.json(horarios);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Reservas
  async criarReserva(req: Request, res: Response): Promise<void> {
    try {
      const locatarioId = parseInt(req.params.locatarioId);
      const reserva = await this.locatarioService.criarReserva(locatarioId, req.body);
      res.status(201).json(reserva);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async buscarMinhasReservas(req: Request, res: Response): Promise<void> {
    try {
      const locatarioId = parseInt(req.params.locatarioId);
      const filtros = req.query;
      const reservas = await this.locatarioService.buscarMinhasReservas(locatarioId, filtros);
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async buscarReservasPorStatus(req: Request, res: Response): Promise<void> {
    try {
      const locatarioId = parseInt(req.params.locatarioId);
      const status = req.params.status as StatusReserva;
      const reservas = await this.locatarioService.buscarReservasPorStatus(locatarioId, status);
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async cancelarReserva(req: Request, res: Response): Promise<void> {
    try {
      const locatarioId = parseInt(req.params.locatarioId);
      const reservaId = parseInt(req.params.reservaId);
      const reserva = await this.locatarioService.cancelarReserva(locatarioId, reservaId);
      res.json(reserva);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
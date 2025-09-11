import { Request, Response } from 'express';
import { ReservaService } from '../services/ReservaService';

export class ReservaController {
  private reservaService = new ReservaService();

  async create(req: Request, res: Response) {
    try {
      // Garantir que dataReserva seja um objeto Date
      if (req.body.dataReserva) {
        if (typeof req.body.dataReserva === 'string') {
          req.body.dataReserva = new Date(req.body.dataReserva);
        }
      }
      
      const reserva = await this.reservaService.create(req.body);
      res.status(201).json(reserva);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      // Garantir que dataReserva seja um objeto Date se fornecido
      if (req.body.dataReserva && typeof req.body.dataReserva === 'string') {
        req.body.dataReserva = new Date(req.body.dataReserva);
      }
      
      const reserva = await this.reservaService.update(id, req.body);
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const reservas = await this.reservaService.findAll();
      res.json(reservas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const reserva = await this.reservaService.findOne(id);
      res.json(reserva);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.reservaService.remove(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async confirmar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const reserva = await this.reservaService.confirmarReserva(id);
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const reserva = await this.reservaService.cancelarReserva(id);
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
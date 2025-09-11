import { Router, Request, Response, NextFunction } from 'express';
import { ProprietarioService } from '../services/ProprietarioService';

export class ProprietarioController {
  private proprietarioService = new ProprietarioService();

  // Prédios
  async criarPredio(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const predio = await this.proprietarioService.criarPredio(proprietarioId, req.body);
      res.status(201).json(predio);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async buscarMeusPredios(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const predios = await this.proprietarioService.buscarMeusPredios(proprietarioId);
      res.json(predios);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async buscarPredioPorId(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const predioId = parseInt(req.params.predioId);
      const predio = await this.proprietarioService.buscarPredioPorId(proprietarioId, predioId);
      res.json(predio);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async buscarPredioPorNome(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const { nome } = req.query;
      const predios = await this.proprietarioService.buscarPredioPorNome(proprietarioId, nome as string);
      res.json(predios);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async editarPredio(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const predioId = parseInt(req.params.predioId);
      const predio = await this.proprietarioService.editarPredio(proprietarioId, predioId, req.body);
      res.json(predio);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async removerPredio(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const predioId = parseInt(req.params.predioId);
      await this.proprietarioService.removerPredio(proprietarioId, predioId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Salas
  async criarSala(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const sala = await this.proprietarioService.criarSala(proprietarioId, req.body);
      res.status(201).json(sala);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async buscarMinhasSalas(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const salas = await this.proprietarioService.buscarMinhasSalas(proprietarioId);
      res.json(salas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async buscarSalasPorPredio(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const predioId = parseInt(req.params.predioId);
      const salas = await this.proprietarioService.buscarSalasPorPredio(proprietarioId, predioId);
      res.json(salas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async editarSala(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const salaId = parseInt(req.params.salaId);
      const sala = await this.proprietarioService.editarSala(proprietarioId, salaId, req.body);
      res.json(sala);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async removerSala(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const salaId = parseInt(req.params.salaId);
      await this.proprietarioService.removerSala(proprietarioId, salaId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Reservas
  async buscarMinhasReservas(req: Request, res: Response): Promise<void> {
    try {
      const proprietarioId = parseInt(req.params.proprietarioId);
      const filtros = req.query;
      const reservas = await this.proprietarioService.buscarMinhasReservas(proprietarioId, filtros);
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
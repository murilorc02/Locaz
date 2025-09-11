import { Request, Response } from 'express';
import { EmpresaService } from '../services/EmpresaService';

export class EmpresaController {
  private empresaService = new EmpresaService();

  async create(req: Request, res: Response): Promise<void> {
    try {
      const empresa = await this.empresaService.create(req.body);
      res.status(201).json(empresa);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const empresas = await this.empresaService.findAll();
      res.json(empresas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async findOne(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const empresa = await this.empresaService.findOne(id);
      res.json(empresa);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const empresa = await this.empresaService.update(id, req.body);
      res.json(empresa);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.empresaService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }
}
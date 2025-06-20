import { Router, Request, Response, NextFunction } from 'express';
import { LocatarioService } from '../services/locatarioService';
import { authMiddleware } from '../middleware/authMiddleware';

const locatarioController = Router();
const locatarioService = new LocatarioService();

locatarioController.use(authMiddleware);

locatarioController.get('/espacos/pesquisa', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const espacos = await locatarioService.buscarEspacos(req.query);
        res.json(espacos);
    } catch (error) {
        next(error);
    }
});

// Rota para ver meus horários
locatarioController.get('/meus-horarios', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuarioId = req.user.id;
        const horarios = await locatarioService.obterMeusHorarios(usuarioId);
        res.json(horarios);
    } catch (error) {
        next(error);
    }
});

// Rota para cancelar um horário
locatarioController.delete('/horarios/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const horarioId = parseInt(req.params.id);
        const usuarioId = req.user.id;
        await locatarioService.cancelarHorario(horarioId, usuarioId);
        res.status(204).send(); // Sucesso sem conteúdo
    } catch (error) {
        next(error);
    }
});

export default locatarioController;
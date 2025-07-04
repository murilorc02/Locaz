import { Router, Request, Response, NextFunction } from 'express';
import { LocadorService } from '../services/locadorService';
import { authMiddleware } from '../middleware/authMiddleware';
import { CreatePredioDto } from '../dto/usuario/criar-predio.dto';

const locadorController = Router();
const locadorService = new LocadorService();

locadorController.use(authMiddleware);

locadorController.post('/predios', async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("DADOS DA REQUISIÇÃO:", req.body);
        const proprietarioId = req.user.sub;
        const predio = await locadorService.criarPredio(req.body as CreatePredioDto, proprietarioId);
        res.status(201).json(predio);
    } catch (error) {
        next(error);
    }
});

// Rota para ver os pedidos de reserva
locadorController.get('/pedidos-de-reserva', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const locadorId = req.user.sub;
        const pedidos = await locadorService.obterPedidosDeReserva(locadorId);
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
});

// Rota para ver a agenda de um espaço específico
locadorController.get('/espacos/:id/agenda', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const espacoId = parseInt(req.params.id);
        const dataDesejada = req.query.data as string | undefined;
        const agenda = await locadorService.obterAgendaPorEspaco(espacoId, dataDesejada);
        res.json(agenda);
    } catch (error) {
        next(error);
    }
});

locadorController.get('/predios', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const proprietarioId = req.user.sub;
        
        if (!proprietarioId) {
            res.status(401).json({ message: 'ID do proprietário não encontrado no token.' });
            return;
        }
        
        const predios = await locadorService.obterPrediosPorProprietario(proprietarioId);
        res.status(200).json(predios);
    } catch (error) {
        next(error);
    }
});


export default locadorController;
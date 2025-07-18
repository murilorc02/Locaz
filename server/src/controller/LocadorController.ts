import { Router, Request, Response, NextFunction } from 'express';
import { LocadorService } from '../services/locadorService';
import { authMiddleware } from '../middleware/authMiddleware';
import { CreatePredioDto } from '../dto/predio/criar-predio.dto';

const locadorController = Router();
const locadorService = new LocadorService();

locadorController.use(authMiddleware);

locadorController.post('/predios', async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("DADOS DA REQUISIÇÃO:", req.body);
        const usuarioId = req.user.sub;
        const predio = await locadorService.criarPredio(req.body as CreatePredioDto, usuarioId);
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
        const usuarioId = req.user.sub;
        
        if (!usuarioId) {
            res.status(401).json({ message: 'ID do proprietário não encontrado no token.' });
            return;
        }
        
        const predios = await locadorService.obterPrediosPorUsuario(usuarioId);
        res.status(200).json(predios);
    } catch (error) {
        next(error);
    }
});

// Criar sala
locadorController.post('/sala', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuarioId = req.user.sub;
        const dados = req.body;
        const sala = await locadorService.criarSala(dados, usuarioId);
        res.status(201).json(sala)
    } catch (error) {
        next(error)
    }
})


export default locadorController;
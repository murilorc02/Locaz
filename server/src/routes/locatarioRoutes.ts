import { Router } from 'express';
import { LocatarioController } from '../controller/LocatarioController';

const router = Router();
const locatarioController = new LocatarioController();

// Rotas de Busca de Salas
router.get('/salas', locatarioController.buscarSalas.bind(locatarioController));
router.get('/salas/:salaId', locatarioController.buscarSalaPorId.bind(locatarioController));
router.post('/salas/buscar-pontos-destaque',
    locatarioController.buscarSalasPorPontosDestaque.bind(locatarioController));

// Rotas de Horários
router.get('/salas/horarios-disponiveis',
    locatarioController.consultarHorariosDisponiveis.bind(locatarioController));

// Rotas de Reservas
router.post('/locatarios/:locatarioId/reservas',
    locatarioController.criarReserva.bind(locatarioController));
router.get('/locatarios/:locatarioId/reservas',
    locatarioController.buscarMinhasReservas.bind(locatarioController));
router.get('/locatarios/:locatarioId/reservas/status/:status',
    locatarioController.buscarReservasPorStatus.bind(locatarioController));
router.patch('/locatarios/:locatarioId/reservas/:reservaId/cancelar',
    locatarioController.cancelarReserva.bind(locatarioController));

export { router as locatarioRoutes };
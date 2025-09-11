import { Router } from 'express';
import { ProprietarioController } from '../controller/ProprietarioController';

const router = Router();
const proprietarioController = new ProprietarioController();

// Rotas de Prédios
router.post('/proprietarios/:proprietarioId/predios', 
  proprietarioController.criarPredio.bind(proprietarioController));
router.get('/proprietarios/:proprietarioId/predios', 
  proprietarioController.buscarMeusPredios.bind(proprietarioController));
router.get('/proprietarios/:proprietarioId/predios/buscar', 
  proprietarioController.buscarPredioPorNome.bind(proprietarioController));
router.get('/proprietarios/:proprietarioId/predios/:predioId', 
  proprietarioController.buscarPredioPorId.bind(proprietarioController));
router.put('/proprietarios/:proprietarioId/predios/:predioId', 
  proprietarioController.editarPredio.bind(proprietarioController));
router.delete('/proprietarios/:proprietarioId/predios/:predioId', 
  proprietarioController.removerPredio.bind(proprietarioController));

// Rotas de Salas
router.post('/proprietarios/:proprietarioId/salas', 
  proprietarioController.criarSala.bind(proprietarioController));
router.get('/proprietarios/:proprietarioId/salas', 
  proprietarioController.buscarMinhasSalas.bind(proprietarioController));
router.get('/proprietarios/:proprietarioId/predios/:predioId/salas', 
  proprietarioController.buscarSalasPorPredio.bind(proprietarioController));
router.put('/proprietarios/:proprietarioId/salas/:salaId', 
  proprietarioController.editarSala.bind(proprietarioController));
router.delete('/proprietarios/:proprietarioId/salas/:salaId', 
  proprietarioController.removerSala.bind(proprietarioController));

// Rotas de Reservas
router.get('/proprietarios/:proprietarioId/reservas', 
  proprietarioController.buscarMinhasReservas.bind(proprietarioController));

export { router as proprietarioRoutes };
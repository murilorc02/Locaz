
import { Router } from 'express';
import { proprietarioRoutes } from './proprietarioRoutes';
import { locatarioRoutes } from './locatarioRoutes';
import usuarioController from '../controller/UsuarioController';

const router = Router();

// ===== ROTAS DE USUÁRIO (AUTH) =====
// Usando o controller que já está funcionando corretamente
router.use('/', usuarioController);

// ===== ROTAS DE PROPRIETÁRIO =====
router.use('/', proprietarioRoutes);

// ===== ROTAS DE LOCATÁRIO =====
router.use('/', locatarioRoutes);

// ===== ROTAS DE DASHBOARD =====
// router.use('/', dashboardRoutes);

export default router;
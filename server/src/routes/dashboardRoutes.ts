// import { Router } from 'express';
// // import { DashboardController } from '../controller/DashboardController';
// import { authMiddleware } from '../middleware/authMiddleware';
// import { proprietarioMiddleware, locatarioMiddleware } from '../middleware/authMiddleware';

// const router = Router();
// const dashboardController = new DashboardController();

// router.get('/proprietarios/dashboard', 
//   authMiddleware,
//   proprietarioMiddleware,
//   dashboardController.getDashboardProprietario.bind(dashboardController)
// );

// router.get('/locatarios/dashboard', 
//   authMiddleware,
//   locatarioMiddleware,
//   dashboardController.getDashboardLocatario.bind(dashboardController)
// );

// export { router as dashboardRoutes };
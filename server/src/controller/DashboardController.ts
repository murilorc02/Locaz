// import { Request, Response } from 'express';
// import { DashboardService } from '../services/DashboardService';

// const dashboardService = new DashboardService();

// export class DashboardController {
//   async getDashboardProprietario(req: Request, res: Response): Promise<void> {
//     try {
//       // Verificação de autenticação
//       if (!req.user?.sub) {
//         res.status(401).json({ error: 'Usuário não autenticado.' });
//         return;
//       }

//       // Garantir que temos um ID válido
//       const proprietarioId = req.user.sub;
      
//       if (!proprietarioId || typeof proprietarioId !== 'number') {
//         res.status(400).json({ error: 'ID do proprietário não encontrado ou inválido.' });
//         return;
//       }

//       const dashboard = await dashboardService.getDashboardProprietario(proprietarioId);
//       res.json(dashboard);
//     } catch (error) {
//       console.error('Erro ao buscar dashboard do proprietário:', error);
//       res.status(500).json({ 
//         error: 'Erro interno do servidor',
//         message: (error as Error).message 
//       });
//     }
//   }

//   async getDashboardLocatario(req: Request, res: Response): Promise<void> {
//     try {
//       // Verificação de autenticação
//       if (!req.user?.sub) {
//         res.status(401).json({ error: 'Usuário não autenticado.' });
//         return;
//       }

//       // Garantir que temos um ID válido
//       const locatarioId = req.user.sub;
      
//       if (!locatarioId || typeof locatarioId !== 'number') {
//         res.status(400).json({ error: 'ID do locatário não encontrado ou inválido.' });
//         return;
//       }

//       const dashboard = await dashboardService.getDashboardLocatario(locatarioId);
//       res.json(dashboard);
//     } catch (error) {
//       console.error('Erro ao buscar dashboard do locatário:', error);
//       res.status(500).json({ 
//         error: 'Erro interno do servidor',
//         message: (error as Error).message 
//       });
//     }
//   }
// }

// // Exportar instância única para uso nas rotas
// export const dashboardController = new DashboardController();
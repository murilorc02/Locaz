
import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import { HttpError } from './services/usuarioService';
import { config } from './config';

export function createServer(): Application {
  const app = express();

  console.log(`[DEBUG] process.env.CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
  console.log(`[DEBUG] config.corsOrigin: ${config.corsOrigin}`);

  app.use(cors({
    origin: config.corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204
  }));

  app.use(express.json());

  // Importar e usar rotas - Corrigido para ES6 import
  try {
    const routes = require('./routes');
    app.use('/api', routes.default || routes);
  } catch (error) {
    console.warn('Rotas não encontradas ou erro ao importar:', error);
    // Rota de teste se não houver rotas configuradas
    app.get('/api/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', message: 'API funcionando' });
    });
  }

  // Middleware de tratamento de erro
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    
    console.error("Erro não tratado:", err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  });

  return app;
}

import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import { HttpError } from './services/usuarioService';
import { config } from './config';
import usuarioController from './controller/UsuarioController';
import predioController from './controller/PredioController';
import salaController from './controller/SalaController';
import reservaController from './controller/ReservaController';

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

  app.use('/api', usuarioController)
  app.use('/api', predioController)
  app.use('/api', salaController)
  app.use('/api', reservaController)
  
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
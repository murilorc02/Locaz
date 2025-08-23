import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import { HttpError } from './services/usuarioService';
import { config } from './config';

export async function createServer(): Promise<Application> {
    const app = express();
    
    app.use(cors({
        origin: config.corsOrigin, 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        optionsSuccessStatus: 204
    }));

    app.use(express.json());
    
    const usuarioController = (await import('./controller/UsuarioController')).default;
    const locadorController = (await import('./controller/LocadorController')).default;
    const locatarioController = (await import('./controller/LocatarioController')).default;

    app.use('/api', usuarioController);
    app.use('/api/locador', locadorController);
    app.use('/api/locatario', locatarioController);
    
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof HttpError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        console.error("Erro não tratado:", err); 
        res.status(500).json({ message: 'Erro interno do servidor.' });
    });

    return app;
}
import 'dotenv/config'; 
import 'reflect-metadata';

import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from './data-source';
import { HttpError } from './services/usuarioService';

async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log("Fonte de dados inicializada com sucesso!");

        const app = express();
        app.use(express.json());

        const usuarioController = (await import('./controller/UsuarioController')).default;
        const locadorController = (await import('./controller/LocadorController')).default;
        const locatarioController = (await import('./controller/LocatarioController')).default; 
        
        app.use('/api', usuarioController);
        app.use('/api/locador', locadorController);
        app.use('/api/locatario', locatarioController);

        // Middleware de tratamento de erros
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof HttpError) {
                res.status(err.statusCode).json({ message: err.message });
                return;
            }
            
            console.error(err); 
            
            res.status(500).json({ message: 'Erro interno do servidor.' });
        });

        // Inicia o servidor
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
        });

    } catch (error) {
        console.error("Erro fatal durante a inicialização da aplicação:", error);
    }
}

bootstrap();
import 'reflect-metadata';
import 'express-async-errors';
import { AppDataSource } from './data-source';
import { createServer } from './server';
import { errorHandler } from './middleware/errorHandlerMiddleware';

async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log("Fonte de dados inicializada com sucesso!");

        const app = await createServer();
        app.use(errorHandler)

        app.use('*', (req, res) => {
            res.status(404).json({
                message: 'Rota não encontrada',
                statusCode: 404,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        });

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Servidor a ser executado na porta ${PORT}`);
        });

    } catch (error) {
        console.error("Erro fatal durante a inicialização da aplicação:", error);
        process.exit(1);
    }
}

bootstrap();

import 'reflect-metadata';
import 'express-async-errors';
import { AppDataSource } from './data-source';
import { createServer } from './server';
import { config } from './config';

async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log("Fonte de dados inicializada com sucesso!");

        const app = await createServer();

        app.listen(3000, () => {
            console.log(`Servidor a ser executado na porta 3000`);
        });

    } catch (error) {
        console.error("Erro fatal durante a inicialização da aplicação:", error);
    }
}

bootstrap();

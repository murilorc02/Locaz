import 'dotenv/config'; 
import 'reflect-metadata';
import 'express-async-errors'; 
import { AppDataSource } from './data-source';
import { createServer } from './server'; 

async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log("Fonte de dados inicializada com sucesso!");

        const app = await createServer();

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Servidor a ser executado na porta ${port}`);
        });

    } catch (error) {
        console.error("Erro fatal durante a inicialização da aplicação:", error);
    }
}

bootstrap();

import 'dotenv/config';

export const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
    }
};

if (!config.jwtSecret || !config.db.host || !config.db.user || !config.db.pass || !config.db.database) {
    throw new Error("Variáveis de ambiente não definidas.");
}
import 'reflect-metadata'
import { DataSource } from "typeorm"
import { Usuario } from "./entity/Usuario"
import { Empresa } from "./entity/Empresa"
import { Horario } from "./entity/Horario"
import { Predio } from "./entity/Predio"
import { Proprietario } from "./entity/Proprietario"
import { Sala } from "./entity/Sala"
import { Reserva } from "./entity/Reserva"
import { Locatario } from "./entity/Locatario"
import { config } from './config'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.pass,
    database: config.db.name,
    synchronize: false,
    logging: true,
    migrations: ["src/**/migrations/*.{js,ts}"],  // "dist/migration/**/*.js" // npx typeorm-ts-node-commonjs migration:create ./src/migrations/AtualizarTabelaUsuarios -d ./src/data-source.ts
    entities: [
        Empresa,
        Horario,
        Predio,
        Proprietario,
        Sala,
        Usuario,
        Reserva,
        Locatario
    ],
    subscribers: [],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
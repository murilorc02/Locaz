import 'reflect-metadata'
import { DataSource } from "typeorm"
import { Usuario } from "./entity/Usuario"
import { HorarioSala } from "./entity/horarioSala"
import { Predio } from "./entity/Predio"
import { Sala } from "./entity/Sala"
import { Reserva } from "./entity/Reserva"
import { config } from './config'
import { HorarioPredio } from './entity/horarioPredio'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.pass,
    database: config.db.name,
    synchronize: false,
    logging: true,
    migrations: ["src/migrations/*.{js,ts}"],  // "dist/migration/**/*.js" // npx typeorm-ts-node-commonjs migration:create ./src/migrations/AtualizarTabelaUsuarios -d ./src/data-source.ts
    entities: [
        HorarioPredio,
        HorarioSala,
        Predio,
        Sala,
        Usuario,
        Reserva
    ],
    subscribers: [],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
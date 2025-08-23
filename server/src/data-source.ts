import 'reflect-metadata'
import { DataSource } from "typeorm"
import { Usuario } from "./entity/Usuario"
import { Empresa } from "./entity/Empresa"
import { Horario } from "./entity/Horario"
import { Predio } from "./entity/Predio"
import { Proprietario } from "./entity/Proprietario"
import { Sala } from "./entity/Sala"
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
    migrations: ['src/migration/**/*.ts'],
    entities: [Empresa, Horario, Predio, Proprietario, Sala, Usuario],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false
    }
})
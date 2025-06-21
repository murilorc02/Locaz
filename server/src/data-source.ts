import 'reflect-metadata'
import { DataSource } from "typeorm"
import { Usuario } from "./entity/Usuario"
import { Empresa } from "./entity/Empresa"
import { Horario } from "./entity/Horario"
import { Predio } from "./entity/Predio"
import { Proprietario } from "./entity/Proprietario"
import { Sala } from "./entity/Sala"


export const AppDataSource = new DataSource({
    type: "postgres",
    host: 'localhost',
    port:  5432,
    username: 'postgres',
    password: '1234',
    database: 'locaz',
    synchronize: true,
    logging: false,
    entities: [Empresa, Horario, Predio, Proprietario, Sala, Usuario],
    subscribers: [],
    migrations: [],
})
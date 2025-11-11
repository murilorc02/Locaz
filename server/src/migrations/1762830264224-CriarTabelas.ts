import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CriarTabelas1762830264224 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Tabela Usuario
        await queryRunner.createTable(new Table({
            name: "usuario",
            columns: [
                {
                    name: "id",
                    type: "serial",
                    isPrimary: true
                },
                {
                    name: "nome",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "email",
                    type: "varchar",
                    length: "255",
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: "senha",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "cpfcnpj",
                    type: "varchar",
                    length: "20",
                    isNullable: true  // ✅ Mudado para nullable OU garanta que sempre passa valor
                },
                {
                    name: "telefone",
                    type: "varchar",
                    length: "20",
                    isNullable: true  // ✅ Mudado para nullable
                },
                {
                    name: "tipo",
                    type: "enum",
                    enum: ["locador", "locatario"],
                    default: "'locatario'"  // ✅ Mantém as aspas simples
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Tabela Predio (nome em minúsculo para consistência)
        await queryRunner.createTable(new Table({
            name: "predio",  // ✅ Mudado para minúsculo
            columns: [
                {
                    name: "id",
                    type: "serial",
                    isPrimary: true
                },
                {
                    name: "nome",
                    type: "varchar",
                    length: "255",
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: "endereco",
                    type: "varchar",
                    length: "500",
                    isNullable: false
                },
                {
                    name: "cidade",
                    type: "varchar",
                    length: "100",
                    isNullable: false
                },
                {
                    name: "estado",
                    type: "varchar",
                    length: "50",
                    isNullable: false
                },
                {
                    name: "cep",
                    type: "varchar",
                    length: "10",
                    isNullable: false
                },
                {
                    name: "descricao",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "horariosFuncionamento",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "usuarioId",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Tabela Sala
        await queryRunner.createTable(new Table({
            name: "sala",
            columns: [
                {
                    name: "id",
                    type: "serial",
                    isPrimary: true
                },
                {
                    name: "nome",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "descricao",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "capacidade",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "categoria",
                    type: "enum",
                    enum: ["workstation", "meeting-room", "training-room", "auditorium"],
                    isNullable: false
                },
                {
                    name: "precoHora",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    isNullable: false
                },
                {
                    name: "reservaGratuita",
                    type: "boolean",
                    default: false
                },
                {
                    name: "predio_id",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "comodidades",
                    type: "text",
                    isArray: true,
                    isNullable: true, 
                    default: "ARRAY[]::text[]"  
                },
                {
                    name: "horariosFuncionamento",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Tabela Reserva
        await queryRunner.createTable(new Table({
            name: "reserva",
            columns: [
                {
                    name: "id",
                    type: "serial",
                    isPrimary: true
                },
                {
                    name: "data_reserva",
                    type: "date",
                    isNullable: false
                },
                {
                    name: "horario_inicio",
                    type: "time",
                    isNullable: false
                },
                {
                    name: "horario_fim",
                    type: "time",
                    isNullable: false
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pendente", "aceita", "recusada", "cancelada"],
                    default: "'pendente'" 
                },
                {
                    name: "valorTotal",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    isNullable: false
                },
                {
                    name: "observacoes",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "locatarioId",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "salaId",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Foreign Keys
        await queryRunner.createForeignKey("predio", new TableForeignKey({  
            columnNames: ["usuarioId"],
            referencedColumnNames: ["id"],
            referencedTableName: "usuario",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("sala", new TableForeignKey({
            columnNames: ["predio_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "predio",  
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("reserva", new TableForeignKey({
            columnNames: ["locatarioId"],
            referencedColumnNames: ["id"],
            referencedTableName: "usuario",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("reserva", new TableForeignKey({
            columnNames: ["salaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "sala",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign keys primeiro
        const reservaTable = await queryRunner.getTable("reserva");
        const salaTable = await queryRunner.getTable("sala");
        const predioTable = await queryRunner.getTable("predio");  

        if (reservaTable) {
            const foreignKeys = reservaTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("reserva", foreignKey);
            }
        }

        if (salaTable) {
            const foreignKeys = salaTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("sala", foreignKey);
            }
        }

        if (predioTable) {
            const foreignKeys = predioTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("predio", foreignKey);  
            }
        }

        // Dropar tabelas
        await queryRunner.dropTable("reserva");
        await queryRunner.dropTable("sala");
        await queryRunner.dropTable("predio");  
        await queryRunner.dropTable("usuario");
    }
}
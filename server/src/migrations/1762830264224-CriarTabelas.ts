import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CriarTabelas1762830264224 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Tabela Usuario
        await queryRunner.createTable(new Table({
            name: "Usuario",
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
            name: "Predio",  // ✅ Mudado para minúsculo
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
            name: "Sala",
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
                    name: "predioId",
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
            name: "Reserva",
            columns: [
                {
                    name: "id",
                    type: "serial",
                    isPrimary: true
                },
                {
                    name: "dataReserva",
                    type: "date",
                    isNullable: false
                },
                {
                    name: "horarioInicio",
                    type: "time",
                    isNullable: false
                },
                {
                    name: "horarioFim",
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
        await queryRunner.createForeignKey("Predio", new TableForeignKey({  
            columnNames: ["usuarioId"],
            referencedColumnNames: ["id"],
            referencedTableName: "Usuario",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("Sala", new TableForeignKey({
            columnNames: ["predioId"],
            referencedColumnNames: ["id"],
            referencedTableName: "Predio",  
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("Reserva", new TableForeignKey({
            columnNames: ["locatarioId"],
            referencedColumnNames: ["id"],
            referencedTableName: "Usuario",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("Reserva", new TableForeignKey({
            columnNames: ["salaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "Sala",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign keys primeiro
        const reservaTable = await queryRunner.getTable("Reserva");
        const salaTable = await queryRunner.getTable("Sala");
        const predioTable = await queryRunner.getTable("Predio");  

        if (reservaTable) {
            const foreignKeys = reservaTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("Reserva", foreignKey);
            }
        }

        if (salaTable) {
            const foreignKeys = salaTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("Sala", foreignKey);
            }
        }

        if (predioTable) {
            const foreignKeys = predioTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("Predio", foreignKey);  
            }
        }

        // Dropar tabelas
        await queryRunner.dropTable("Reserva");
        await queryRunner.dropTable("Sala");
        await queryRunner.dropTable("Predio");  
        await queryRunner.dropTable("Usuario");
    }
}
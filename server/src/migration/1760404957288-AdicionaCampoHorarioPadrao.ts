import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AdicionaCampoHorarioPadrao1760404957288 implements MigrationInterface {
    name = 'AdicionaCampoHorarioPadrao1760404957288'

     public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar se a tabela já existe
        const tableExists = await queryRunner.hasTable("horario_sala");
        
        if (!tableExists) {
            // Criar o tipo enum se não existir
            await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE horario_sala_dia_semana AS ENUM ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Criar a tabela horario_sala
            await queryRunner.createTable(
                new Table({
                    name: "horario_sala",
                    columns: [
                        {
                            name: "id",
                            type: "integer",
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: "increment",
                        },
                        {
                            name: "dia_semana",
                            type: "horario_sala_dia_semana",
                            isNullable: false,
                        },
                        {
                            name: "horario_inicio",
                            type: "time without time zone",
                            default: "'08:00'",
                            isNullable: false,
                        },
                        {
                            name: "horario_fim",
                            type: "time without time zone",
                            default: "'18:00'",
                            isNullable: false,
                        },
                        {
                            name: "horarioPadrao",
                            type: "boolean",
                            default: false,
                            isNullable: false,
                        },
                        {
                            name: "disponivel",
                            type: "boolean",
                            default: true,
                            isNullable: false,
                        },
                        {
                            name: "ativo",
                            type: "boolean",
                            default: true,
                            isNullable: false,
                        },
                        {
                            name: "salaId",
                            type: "integer",
                            isNullable: true,
                        },
                    ],
                }),
                true
            );

            // Criar a foreign key para a tabela sala
            await queryRunner.createForeignKey(
                "horario_sala",
                new TableForeignKey({
                    name: "FK_ac2798667df2d6d6ff225df5df",
                    columnNames: ["salaId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "sala",
                    onDelete: "CASCADE",
                })
            );
        } else {
            console.log("Tabela horario_sala já existe, pulando criação...");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("horario_sala");
        
        if (table) {
            // Remover a foreign key específica
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.name === "FK_ac2798667df2d6d6ff225df5df"
            );
            
            if (foreignKey) {
                await queryRunner.dropForeignKey("horario_sala", foreignKey);
            }

            // Remover a tabela
            await queryRunner.dropTable("horario_sala");

            // Remover o tipo enum
            await queryRunner.query(`DROP TYPE IF EXISTS horario_sala_dia_semana`);
        }
    }
}
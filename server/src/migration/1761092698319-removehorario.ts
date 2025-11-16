import { MigrationInterface, QueryRunner } from "typeorm";

export class removehorario1761092698319 implements MigrationInterface {
    name = 'removehorario1761092698319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remover tabelas antigas de horários se existirem
        await queryRunner.query(`DROP TABLE IF EXISTS "horario_predio" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "horario_sala" CASCADE`);

        // Verificar se a coluna 'tipo' existe na tabela usuario, se não, adicionar
        const usuarioTable = await queryRunner.getTable("usuario");
        const tipoColumn = usuarioTable?.columns.find(column => column.name === "tipo");
        
        if (!tipoColumn) {
            await queryRunner.query(`
                ALTER TABLE "usuario" 
                ADD COLUMN "tipo" character varying DEFAULT 'locatario' 
                CHECK ("tipo" IN ('locador', 'locatario'))
            `);
        }

        // Adicionar coluna horariosFuncionamento na tabela Predio se não existir
        const predioTable = await queryRunner.getTable("predio");
        const horariosPredioColumn = predioTable?.columns.find(column => column.name === "horariosFuncionamento");
        
        if (!horariosPredioColumn) {
            await queryRunner.query(`
                ALTER TABLE "predio" 
                ADD COLUMN "horariosFuncionamento" jsonb
            `);
        }

        // Verificar se a tabela sala existe e adicionar/modificar colunas necessárias
        const salaTable = await queryRunner.getTable("sala");
        
        if (salaTable) {
            // Adicionar coluna categoria se não existir
            const categoriaColumn = salaTable.columns.find(column => column.name === "categoria");
            if (!categoriaColumn) {
                await queryRunner.query(`
                    ALTER TABLE "sala" 
                    ADD COLUMN "categoria" character varying NOT NULL DEFAULT 'meeting-room'
                    CHECK ("categoria" IN ('workstation', 'meeting-room', 'training-room', 'auditorium'))
                `);
            }

            // Adicionar coluna comodidades se não existir
            const comodidadesColumn = salaTable.columns.find(column => column.name === "comodidades");
            if (!comodidadesColumn) {
                await queryRunner.query(`
                    ALTER TABLE "sala" 
                    ADD COLUMN "comodidades" text array NOT NULL DEFAULT '{}'
                `);
            }

            // Adicionar coluna horariosFuncionamento se não existir
            const horariosSalaColumn = salaTable.columns.find(column => column.name === "horariosFuncionamento");
            if (!horariosSalaColumn) {
                await queryRunner.query(`
                    ALTER TABLE "sala" 
                    ADD COLUMN "horariosFuncionamento" jsonb
                `);
            }

            // Renomear precolhora para precoHora se necessário
            const precoHoraColumn = salaTable.columns.find(column => column.name === "precoHora");
            const precolhoraColumn = salaTable.columns.find(column => column.name === "precolhora");
            
            if (precolhoraColumn && !precoHoraColumn) {
                await queryRunner.query(`
                    ALTER TABLE "sala" 
                    RENAME COLUMN "precolhora" TO "precoHora"
                `);
            }
        }

        // Verificar se a tabela reserva existe, se não, criar
        const reservaTable = await queryRunner.getTable("reserva");
        
        if (!reservaTable) {
            await queryRunner.query(`
                CREATE TABLE "reserva" (
                    "id" SERIAL PRIMARY KEY,
                    "data_reserva" date NOT NULL,
                    "horario_inicio" time NOT NULL,
                    "horario_fim" time NOT NULL,
                    "status" character varying DEFAULT 'pendente' CHECK ("status" IN ('pendente', 'aceita', 'recusada', 'cancelada')),
                    "valorTotal" decimal(10,2) NOT NULL,
                    "observacoes" text,
                    "locatarioId" integer NOT NULL,
                    "salaId" integer NOT NULL,
                    "createdAt" TIMESTAMP DEFAULT NOW(),
                    "updatedAt" TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT "FK_Reserva_Usuario" FOREIGN KEY ("locatarioId") REFERENCES "usuario"("id") ON DELETE CASCADE,
                    CONSTRAINT "FK_Reserva_Sala" FOREIGN KEY ("salaId") REFERENCES "sala"("id") ON DELETE CASCADE
                )
            `);

            // Criar índices para a tabela reserva
            await queryRunner.query(`CREATE INDEX "IDX_Reserva_locatarioId" ON "reserva" ("locatarioId")`);
            await queryRunner.query(`CREATE INDEX "IDX_Reserva_salaId" ON "reserva" ("salaId")`);
            await queryRunner.query(`CREATE INDEX "IDX_Reserva_data_status" ON "reserva" ("data_reserva", "status")`);
        }

        // Verificar se a foreign key entre Predio e Usuario existe
        const predioFkExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_Predio_Usuario' 
            AND table_name = 'predio'
        `);

        if (predioFkExists.length === 0) {
            // Adicionar coluna usuarioId se não existir
            const usuarioIdColumn = predioTable?.columns.find(column => column.name === "usuarioId");
            if (!usuarioIdColumn) {
                await queryRunner.query(`
                    ALTER TABLE "predio" 
                    ADD COLUMN "usuarioId" integer
                `);
            }

            // Criar a foreign key
            await queryRunner.query(`
                ALTER TABLE "predio" 
                ADD CONSTRAINT "FK_Predio_Usuario" 
                FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE
            `);
        }

        // Verificar se a foreign key entre Sala e Predio existe
        const salaFkExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_Sala_Predio' 
            AND table_name = 'sala'
        `);

        if (salaFkExists.length === 0 && salaTable) {
            await queryRunner.query(`
                ALTER TABLE "sala" 
                ADD CONSTRAINT "FK_Sala_Predio" 
                FOREIGN KEY ("predio_id") REFERENCES "predio"("id") ON DELETE CASCADE
            `);
        }

        // Criar índices se não existirem
        const indices = [
            { name: 'IDX_Predio_usuarioId', query: `CREATE INDEX IF NOT EXISTS "IDX_Predio_usuarioId" ON "predio" ("usuarioId")` },
            { name: 'IDX_Sala_predio_id', query: `CREATE INDEX IF NOT EXISTS "IDX_Sala_predio_id" ON "sala" ("predio_id")` }
        ];

        for (const index of indices) {
            try {
                await queryRunner.query(index.query);
            } catch (error) {
                console.log(`Índice ${index.name} já existe ou não pôde ser criado`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter as alterações - cuidado ao reverter pois pode afetar dados existentes
        
        // Remover índices
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Reserva_data_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Reserva_salaId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Reserva_locatarioId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Sala_predio_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Predio_usuarioId"`);

        // Remover constraints
        await queryRunner.query(`ALTER TABLE "sala" DROP CONSTRAINT IF EXISTS "FK_Sala_Predio"`);
        await queryRunner.query(`ALTER TABLE "predio" DROP CONSTRAINT IF EXISTS "FK_Predio_Usuario"`);
        await queryRunner.query(`ALTER TABLE "reserva" DROP CONSTRAINT IF EXISTS "FK_Reserva_Sala"`);
        await queryRunner.query(`ALTER TABLE "reserva" DROP CONSTRAINT IF EXISTS "FK_Reserva_Usuario"`);

        // Remover tabela reserva se existir
        await queryRunner.query(`DROP TABLE IF EXISTS "reserva"`);

        // Remover colunas adicionadas (opcional - cuidado com dados)
        // await queryRunner.query(`ALTER TABLE "sala" DROP COLUMN IF EXISTS "horariosFuncionamento"`);
        // await queryRunner.query(`ALTER TABLE "sala" DROP COLUMN IF EXISTS "comodidades"`);
        // await queryRunner.query(`ALTER TABLE "sala" DROP COLUMN IF EXISTS "categoria"`);
        // await queryRunner.query(`ALTER TABLE "predio" DROP COLUMN IF EXISTS "horariosFuncionamento"`);
        // await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN IF EXISTS "tipo"`);
    }

}

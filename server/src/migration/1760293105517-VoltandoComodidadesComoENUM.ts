import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterarTabelaSala1760293105518 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar se a coluna categoria já existe
        const categoriaExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'sala' 
            AND column_name = 'categoria'
        `);

        if (categoriaExists.length === 0) {
            // 1. Criar o ENUM CategoriaSala se não existir
            await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."sala_categoria_enum" AS ENUM ('workstation', 'meeting-room', 'training-room', 'auditorium');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // 2. Adicionar a coluna 'categoria' do tipo ENUM
            await queryRunner.query(`
                ALTER TABLE "sala" ADD "categoria" "public"."sala_categoria_enum"
            `);
            
            // 3. Atualiza registros existentes com um valor padrão
            await queryRunner.query(`
                UPDATE "sala" SET "categoria" = 'workstation' WHERE "categoria" IS NULL
            `);
            
            // 4. Agora torna a coluna NOT NULL
            await queryRunner.query(`
                ALTER TABLE "sala" ALTER COLUMN "categoria" SET NOT NULL
            `);
        }

        // 5. Verificar se precisa alterar a coluna 'descricao' para nullable
        const descricaoInfo = await queryRunner.query(`
            SELECT is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'sala' 
            AND column_name = 'descricao'
        `);

        if (descricaoInfo.length > 0 && descricaoInfo[0].is_nullable === 'NO') {
            await queryRunner.query(`
                ALTER TABLE "sala" ALTER COLUMN "descricao" DROP NOT NULL
            `);
        }

        // 6. Alterar 'precoHora' de numeric para decimal(10,2)
        await queryRunner.query(`
            ALTER TABLE "sala" ALTER COLUMN "precoHora" TYPE decimal(10,2)
        `);

        // 7. Verificar e alterar 'reservaGratuita' para ter default false
        const reservaInfo = await queryRunner.query(`
            SELECT column_default 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'sala' 
            AND column_name = 'reservaGratuita'
        `);

        if (!reservaInfo[0]?.column_default || !reservaInfo[0].column_default.includes('false')) {
            await queryRunner.query(`
                ALTER TABLE "sala" ALTER COLUMN "reservaGratuita" SET DEFAULT false
            `);
        }

        // 8. Alterar 'comodidades' para text array
        // Verificar o tipo atual da coluna comodidades
        const comodidadesInfo = await queryRunner.query(`
            SELECT data_type, udt_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'sala' 
            AND column_name = 'comodidades'
        `);

        if (comodidadesInfo.length > 0) {
            const dataType = comodidadesInfo[0].data_type;
            const udtName = comodidadesInfo[0].udt_name;

            // Se for ARRAY e o tipo base for enum, precisamos converter
            if (dataType === 'ARRAY' && udtName === '_sala_comodidades_enum') {
                // Criar coluna temporária
                await queryRunner.query(`
                    ALTER TABLE "sala" ADD "comodidades_temp" text[]
                `);
                
                // Copiar dados convertendo enum para text
                await queryRunner.query(`
                    UPDATE "sala" SET "comodidades_temp" = 
                        ARRAY(SELECT unnest("comodidades")::text)
                `);
                
                // Remover a coluna antiga
                await queryRunner.query(`
                    ALTER TABLE "sala" DROP COLUMN "comodidades"
                `);
                
                // Renomear a coluna temporária
                await queryRunner.query(`
                    ALTER TABLE "sala" RENAME COLUMN "comodidades_temp" TO "comodidades"
                `);
                
                // Definir como NOT NULL com default de array vazio
                await queryRunner.query(`
                    ALTER TABLE "sala" ALTER COLUMN "comodidades" SET DEFAULT ARRAY[]::text[]
                `);
                
                await queryRunner.query(`
                    UPDATE "sala" SET "comodidades" = ARRAY[]::text[] WHERE "comodidades" IS NULL
                `);
                
                await queryRunner.query(`
                    ALTER TABLE "sala" ALTER COLUMN "comodidades" SET NOT NULL
                `);

                // Dropar o enum antigo se existir
                await queryRunner.query(`
                    DROP TYPE IF EXISTS "public"."sala_comodidades_enum"
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter as alterações na ordem inversa

        // 1. Reverter comodidades para o tipo enum anterior
        await queryRunner.query(`
            CREATE TYPE "public"."sala_comodidades_enum" AS ENUM(
                'wifiGratis', 'cafeGratis', 'cadeirasErgonomicas', 'projetor', 
                'espacoDescompressao', 'espacoKids', 'arCondicionado', 
                'quadroBranco', 'estacionamento', 'copaCozinha'
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "sala" ADD "comodidades_temp" "public"."sala_comodidades_enum"[]
        `);

        await queryRunner.query(`
            ALTER TABLE "sala" DROP COLUMN "comodidades"
        `);

        await queryRunner.query(`
            ALTER TABLE "sala" RENAME COLUMN "comodidades_temp" TO "comodidades"
        `);

        await queryRunner.query(`
            ALTER TABLE "sala" ALTER COLUMN "comodidades" SET DEFAULT '{}'
        `);

        // 2. Reverter reservaGratuita
        await queryRunner.query(`
            ALTER TABLE "sala" ALTER COLUMN "reservaGratuita" DROP DEFAULT
        `);

        // 3. Reverter precoHora
        await queryRunner.query(`
            ALTER TABLE "sala" ALTER COLUMN "precoHora" TYPE numeric
        `);

        // 4. Reverter descricao
        await queryRunner.query(`
            ALTER TABLE "sala" ALTER COLUMN "descricao" SET NOT NULL
        `);

        // 5. Remover coluna categoria
        await queryRunner.query(`
            ALTER TABLE "sala" DROP COLUMN "categoria"
        `);

        // 6. Remover o tipo ENUM
        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."sala_categoria_enum"
        `);
    }
}
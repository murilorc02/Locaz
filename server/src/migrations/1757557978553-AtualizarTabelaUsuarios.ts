import { MigrationInterface, QueryRunner } from "typeorm";

export class AtualizarTabelaUsuarios1675557978553 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar se as colunas já existem antes de adicionar
        const table = await queryRunner.getTable("usuario");
        
        // Adicionar coluna ativo se não existir
        if (!table?.findColumnByName("ativo")) {
            await queryRunner.query(`ALTER TABLE "usuario" ADD "ativo" boolean NOT NULL DEFAULT true`);
        }
        
        // Adicionar colunas de timestamp se não existirem
        if (!table?.findColumnByName("createdAt")) {
            await queryRunner.query(`ALTER TABLE "usuario" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        }
        if (!table?.findColumnByName("updatedAt")) {
            await queryRunner.query(`ALTER TABLE "usuario" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        }
        
        // Verificar se o tipo enum já existe
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'usuario_tipo_enum'
            )
        `);
        
        // Criar o tipo enum apenas se não existir
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "usuario_tipo_enum" AS ENUM('proprietario', 'locatario')`);
        }
        
        // Alterar a coluna tipo para usar o enum
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "tipo" TYPE "usuario_tipo_enum" USING "tipo"::text::"usuario_tipo_enum"`);
        
        // Definir valor padrão
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "tipo" SET DEFAULT 'locatario'`);
        
        // Verificar se a constraint unique já existe
        const constraintExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'UQ_usuario_email' 
                AND table_name = 'usuario'
            )
        `);
        
        // Adicionar constraint apenas se não existir
        if (!constraintExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "UQ_usuario_email" UNIQUE ("email")`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Implementação do down (mantida igual)
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT IF EXISTS "UQ_usuario_email"`);
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "tipo" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "tipo" TYPE varchar USING "tipo"::varchar`);
        await queryRunner.query(`DROP TYPE IF EXISTS "usuario_tipo_enum"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN IF EXISTS "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN IF EXISTS "createdAt"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN IF EXISTS "ativo"`);
    }
}
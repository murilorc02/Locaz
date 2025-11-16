import { MigrationInterface, QueryRunner } from "typeorm";

export class AtualizarCampoCpfCnpj1759806560053 implements MigrationInterface {
    name = 'AtualizarCampoCpfCnpj1759806560053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renomear CPF para CPFCNPJ
        await queryRunner.query(`ALTER TABLE "usuario" RENAME COLUMN "cpf" TO "cpfcnpj"`);
        
        // Atualizar enum de status da reserva
        await queryRunner.query(`ALTER TYPE "public"."reserva_status_enum" RENAME TO "reserva_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."reserva_status_enum" AS ENUM('pendente', 'aceita', 'recusada', 'cancelada')`);
        await queryRunner.query(`ALTER TABLE "reserva" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reserva" ALTER COLUMN "status" TYPE "public"."reserva_status_enum" USING "status"::"text"::"public"."reserva_status_enum"`);
        await queryRunner.query(`ALTER TABLE "reserva" ALTER COLUMN "status" SET DEFAULT 'pendente'`);
        await queryRunner.query(`DROP TYPE "public"."reserva_status_enum_old"`);
        
        // Atualizar horários padrão
        await queryRunner.query(`ALTER TABLE "horario_sala" ALTER COLUMN "horario_inicio" SET DEFAULT '08:00'`);
        await queryRunner.query(`ALTER TABLE "horario_sala" ALTER COLUMN "horario_fim" SET DEFAULT '18:00'`);
        
        // Remover coluna categoria antiga (enum)
        await queryRunner.query(`ALTER TABLE "sala" DROP COLUMN "categoria"`);
        await queryRunner.query(`DROP TYPE "public"."sala_categoria_enum"`);
        
        // Adicionar nova coluna categoria como text (permitindo NULL temporariamente)
        await queryRunner.query(`ALTER TABLE "sala" ADD "categoria" text`);
        
        // Atualizar valores nulos com um valor padrão
        await queryRunner.query(`UPDATE "sala" SET "categoria" = 'sem_categoria' WHERE "categoria" IS NULL`);
        
        // Agora tornar a coluna NOT NULL
        await queryRunner.query(`ALTER TABLE "sala" ALTER COLUMN "categoria" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter categoria para enum
        await queryRunner.query(`ALTER TABLE "sala" DROP COLUMN "categoria"`);
        await queryRunner.query(`CREATE TYPE "public"."sala_categoria_enum" AS ENUM('escritorio', 'reuniao', 'coworking', 'auditorio')`);
        await queryRunner.query(`ALTER TABLE "sala" ADD "categoria" "public"."sala_categoria_enum" NOT NULL`);
        
        // Reverter horários
        await queryRunner.query(`ALTER TABLE "horario_sala" ALTER COLUMN "horario_fim" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "horario_sala" ALTER COLUMN "horario_inicio" DROP DEFAULT`);
        
        // Reverter enum de status
        await queryRunner.query(`CREATE TYPE "public"."reserva_status_enum_old" AS ENUM('pendente', 'aceita', 'recusada')`);
        await queryRunner.query(`ALTER TABLE "reserva" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reserva" ALTER COLUMN "status" TYPE "public"."reserva_status_enum_old" USING "status"::"text"::"public"."reserva_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "reserva" ALTER COLUMN "status" SET DEFAULT 'pendente'`);
        await queryRunner.query(`DROP TYPE "public"."reserva_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."reserva_status_enum_old" RENAME TO "reserva_status_enum"`);
        
        // Reverter renomeação do CPF
        await queryRunner.query(`ALTER TABLE "usuario" RENAME COLUMN "cpfcnpj" TO "cpf"`);
    }
}
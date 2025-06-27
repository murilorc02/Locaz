import { MigrationInterface, QueryRunner } from "typeorm";

export class AtualizaPredioComodidades1751046951034 implements MigrationInterface {
    name = 'AtualizaPredioComodidades1751046951034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predio" ADD "descricao" text`);
        await queryRunner.query(`ALTER TABLE "predio" DROP COLUMN "pontosDeDestaque"`);
        await queryRunner.query(`ALTER TABLE "predio" ADD "pontosDeDestaque" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predio" DROP COLUMN "pontosDeDestaque"`);
        await queryRunner.query(`ALTER TABLE "predio" ADD "pontosDeDestaque" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "predio" DROP COLUMN "descricao"`);
    }

}

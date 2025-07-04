import { MigrationInterface, QueryRunner } from "typeorm";

export class RelacionaPredioComUsuario1751643480320 implements MigrationInterface {
    name = 'RelacionaPredioComUsuario1751643480320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predio" DROP CONSTRAINT "FK_f69f1aec63ec0e661f7a481ad2b"`);
        await queryRunner.query(`ALTER TABLE "predio" RENAME COLUMN "proprietarioId" TO "usuarioId"`);
        await queryRunner.query(`ALTER TABLE "predio" ADD CONSTRAINT "FK_5b06c176fb9b3ecac236da0b440" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predio" DROP CONSTRAINT "FK_5b06c176fb9b3ecac236da0b440"`);
        await queryRunner.query(`ALTER TABLE "predio" RENAME COLUMN "usuarioId" TO "proprietarioId"`);
        await queryRunner.query(`ALTER TABLE "predio" ADD CONSTRAINT "FK_f69f1aec63ec0e661f7a481ad2b" FOREIGN KEY ("proprietarioId") REFERENCES "proprietario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

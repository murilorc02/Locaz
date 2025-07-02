import { MigrationInterface, QueryRunner } from "typeorm";

export class CriaTabelasIniciais1751416126167 implements MigrationInterface {
    name = 'CriaTabelasIniciais1751416126167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "proprietario" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "foto" bytea, CONSTRAINT "PK_1b9692e43fb9184501f75222bcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "predio" ("id" SERIAL NOT NULL, "nomePredio" character varying NOT NULL, "endereco" character varying NOT NULL, "pontosDeDestaque" text array NOT NULL DEFAULT '{}', "descricao" text, "proprietarioId" integer, CONSTRAINT "PK_824632da2afaeea07672ee3e59f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sala" ("id" SERIAL NOT NULL, "nomeSala" character varying NOT NULL, "capacidade" character varying NOT NULL, "categoria" character varying NOT NULL, "disponibilidade" boolean NOT NULL, "quantCadeiras" integer NOT NULL, "destaques" boolean NOT NULL, "predioId" integer, CONSTRAINT "PK_4e5fe0d3e30b64508d2a59daa40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."horario_status_enum" AS ENUM('pendente', 'confirmado', 'cancelado')`);
        await queryRunner.query(`CREATE TABLE "horario" ("id" SERIAL NOT NULL, "dataHoraInicio" TIMESTAMP NOT NULL, "dataHoraFim" TIMESTAMP NOT NULL, "status" "public"."horario_status_enum" NOT NULL DEFAULT 'pendente', "usuarioId" integer, "salaId" integer, CONSTRAINT "PK_3c89ff4250bf835ce1f861313c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_tipo_enum" AS ENUM('locador', 'locatario')`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "email" character varying NOT NULL, "senha" character varying NOT NULL, "cpf" character varying NOT NULL, "telefone" character varying NOT NULL, "tipo" "public"."usuario_tipo_enum" NOT NULL, CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "empresa" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "localizacao" character varying NOT NULL, CONSTRAINT "PK_bee78e8f1760ccf9cff402118a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "predio" ADD CONSTRAINT "FK_f69f1aec63ec0e661f7a481ad2b" FOREIGN KEY ("proprietarioId") REFERENCES "proprietario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sala" ADD CONSTRAINT "FK_6545935e86b88e9a04f29e3e6c9" FOREIGN KEY ("predioId") REFERENCES "predio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "horario" ADD CONSTRAINT "FK_1e05ca9f98eb532838cbda49efe" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "horario" ADD CONSTRAINT "FK_afc490924d6939f905db83d6639" FOREIGN KEY ("salaId") REFERENCES "sala"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "horario" DROP CONSTRAINT "FK_afc490924d6939f905db83d6639"`);
        await queryRunner.query(`ALTER TABLE "horario" DROP CONSTRAINT "FK_1e05ca9f98eb532838cbda49efe"`);
        await queryRunner.query(`ALTER TABLE "sala" DROP CONSTRAINT "FK_6545935e86b88e9a04f29e3e6c9"`);
        await queryRunner.query(`ALTER TABLE "predio" DROP CONSTRAINT "FK_f69f1aec63ec0e661f7a481ad2b"`);
        await queryRunner.query(`DROP TABLE "empresa"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "horario"`);
        await queryRunner.query(`DROP TYPE "public"."horario_status_enum"`);
        await queryRunner.query(`DROP TABLE "sala"`);
        await queryRunner.query(`DROP TABLE "predio"`);
        await queryRunner.query(`DROP TABLE "proprietario"`);
    }

}

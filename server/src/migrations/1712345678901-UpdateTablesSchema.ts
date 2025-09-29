import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTablesSchema1712345678901 implements MigrationInterface {
    name = 'UpdateTablesSchema1712345678901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reserva_status_enum" AS ENUM('pendente', 'confirmada', 'cancelada', 'recusada')`);
        await queryRunner.query(`CREATE TABLE "reserva" ("id" SERIAL NOT NULL, "data_reserva" date NOT NULL, "horario_inicio" TIME NOT NULL, "horario_fim" TIME NOT NULL, "status" "public"."reserva_status_enum" NOT NULL DEFAULT 'pendente', "valorTotal" numeric(10,2) NOT NULL, "observacoes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "locatarioId" integer, "salaId" integer, CONSTRAINT "PK_37909c9a3ea6a72ee6f21b16129" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."horario_sala_dia_semana_enum" AS ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')`);
        await queryRunner.query(`CREATE TABLE "horario_sala" ("id" SERIAL NOT NULL, "dia_semana" "public"."horario_sala_dia_semana_enum" NOT NULL, "horario_inicio" TIME NOT NULL DEFAULT '08:00', "horario_fim" TIME NOT NULL DEFAULT '18:00', "disponivel" boolean NOT NULL DEFAULT true, "ativo" boolean NOT NULL DEFAULT true, "salaId" integer, CONSTRAINT "PK_8abdc6c38faeea8fb17632c7bb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sala_categoria_enum" AS ENUM('reuniao', 'estacao', 'auditorio', 'treinamento')`);
        await queryRunner.query(`CREATE TYPE "public"."sala_comodidades_enum" AS ENUM('wifiGratis', 'cafeGratis', 'cadeirasErgonomicas', 'projetor', 'espacoDescompressao', 'espacoKids', 'arCondicionado', 'quadroBranco', 'estacionamento', 'copaCozinha')`);
        await queryRunner.query(`CREATE TABLE "sala" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "descricao" text, "capacidade" integer NOT NULL, "categoria" "public"."sala_categoria_enum" NOT NULL, "precoHora" numeric(10,2) NOT NULL, "reservaGratuita" boolean NOT NULL DEFAULT false, "comodidades" "public"."sala_comodidades_enum" array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "predio_id" integer, CONSTRAINT "PK_4e5fe0d3e30b64508d2a59daa40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."horario_predio_diasemana_enum" AS ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')`);
        await queryRunner.query(`CREATE TABLE "horario_predio" ("id" SERIAL NOT NULL, "diaSemana" "public"."horario_predio_diasemana_enum" NOT NULL, "horarioAbertura" TIME NOT NULL DEFAULT '08:00', "horarioFechamento" TIME NOT NULL DEFAULT '18:00', "ativo" boolean NOT NULL DEFAULT true, "predioId" integer, CONSTRAINT "PK_a6e3adc89e276050207504b7194" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Predio" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "endereco" character varying NOT NULL, "cidade" character varying NOT NULL, "estado" character varying NOT NULL, "cep" character varying NOT NULL, "descricao" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "usuarioId" integer, CONSTRAINT "UQ_c8b49c2dc1654a85630d912293f" UNIQUE ("nome"), CONSTRAINT "PK_7678670bd16eb5d2f7d48317c4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_tipo_enum" AS ENUM('locador', 'locatario')`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "email" character varying NOT NULL, "senha" character varying NOT NULL, "cpf" character varying NOT NULL, "telefone" character varying NOT NULL, "tipo" "public"."usuario_tipo_enum" NOT NULL DEFAULT 'locatario', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reserva" ADD CONSTRAINT "FK_770b2c197b9ae61919bdcf6fc8a" FOREIGN KEY ("locatarioId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reserva" ADD CONSTRAINT "FK_a3ec8916a8c0b1ed65d401470bf" FOREIGN KEY ("salaId") REFERENCES "sala"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "horario_sala" ADD CONSTRAINT "FK_ac279866776f29bd6ff2258f5d7" FOREIGN KEY ("salaId") REFERENCES "sala"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sala" ADD CONSTRAINT "FK_4b811878a7d5177b7b74e381cb7" FOREIGN KEY ("predio_id") REFERENCES "Predio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "horario_predio" ADD CONSTRAINT "FK_4ab0ca1175d410e21878c588926" FOREIGN KEY ("predioId") REFERENCES "Predio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Predio" ADD CONSTRAINT "FK_af4e39140856ee2c6579f3e3ee7" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Predio" DROP CONSTRAINT "FK_af4e39140856ee2c6579f3e3ee7"`);
        await queryRunner.query(`ALTER TABLE "horario_predio" DROP CONSTRAINT "FK_4ab0ca1175d410e21878c588926"`);
        await queryRunner.query(`ALTER TABLE "sala" DROP CONSTRAINT "FK_4b811878a7d5177b7b74e381cb7"`);
        await queryRunner.query(`ALTER TABLE "horario_sala" DROP CONSTRAINT "FK_ac279866776f29bd6ff2258f5d7"`);
        await queryRunner.query(`ALTER TABLE "reserva" DROP CONSTRAINT "FK_a3ec8916a8c0b1ed65d401470bf"`);
        await queryRunner.query(`ALTER TABLE "reserva" DROP CONSTRAINT "FK_770b2c197b9ae61919bdcf6fc8a"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "Predio"`);
        await queryRunner.query(`DROP TABLE "horario_predio"`);
        await queryRunner.query(`DROP TYPE "public"."horario_predio_diasemana_enum"`);
        await queryRunner.query(`DROP TABLE "sala"`);
        await queryRunner.query(`DROP TYPE "public"."sala_comodidades_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sala_categoria_enum"`);
        await queryRunner.query(`DROP TABLE "horario_sala"`);
        await queryRunner.query(`DROP TYPE "public"."horario_sala_dia_semana_enum"`);
        await queryRunner.query(`DROP TABLE "reserva"`);
        await queryRunner.query(`DROP TYPE "public"."reserva_status_enum"`);
    }
}
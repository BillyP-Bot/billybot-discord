import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1626659022624 implements MigrationInterface {
    name = 'Init1626659022624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "userId" character varying NOT NULL, "serverId" character varying NOT NULL, "billyBucks" integer NOT NULL, "lastAllowance" TIMESTAMP NOT NULL, CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_29a05908a0fa0728526d283365" ON "User" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_45f0625bd8172eb9c821c948a0" ON "User" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_88da68627b347230d5fd0b8013" ON "User" ("serverId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_88da68627b347230d5fd0b8013"`);
        await queryRunner.query(`DROP INDEX "IDX_45f0625bd8172eb9c821c948a0"`);
        await queryRunner.query(`DROP INDEX "IDX_29a05908a0fa0728526d283365"`);
        await queryRunner.query(`DROP TABLE "User"`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class lending1633312248137 implements MigrationInterface {
    name = 'lending1633312248137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "userId" character varying NOT NULL, "serverId" character varying NOT NULL, "billyBucks" integer NOT NULL, "lastAllowance" TIMESTAMP NOT NULL, "creditScore" integer NOT NULL, "hasActiveLoan" boolean NOT NULL, CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_29a05908a0fa0728526d283365" ON "User" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_45f0625bd8172eb9c821c948a0" ON "User" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_88da68627b347230d5fd0b8013" ON "User" ("serverId") `);
        await queryRunner.query(`CREATE TABLE "Loan" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "serverId" character varying NOT NULL, "originalBalanceAmt" integer NOT NULL, "outstandingBalanceAmt" integer NOT NULL, "interestAccruedAmt" integer NOT NULL, "penaltyAmt" integer NOT NULL, "interestRate" numeric NOT NULL, "nextInterestAccrualDate" TIMESTAMP NOT NULL, "paymentsMadeAmt" integer NOT NULL, "minPaymentAmt" integer NOT NULL, "nextPaymentDueDate" TIMESTAMP NOT NULL, "closedDate" TIMESTAMP, "closedInd" boolean NOT NULL, "userId" integer, CONSTRAINT "PK_7e6795da11ac125df693d5fab66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dd534091fe92088d4d21b095cb" ON "Loan" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b4c5994aaa44fe07a648fcd128" ON "Loan" ("serverId") `);
        await queryRunner.query(`ALTER TABLE "Loan" ADD CONSTRAINT "FK_dd534091fe92088d4d21b095cb0" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Loan" DROP CONSTRAINT "FK_dd534091fe92088d4d21b095cb0"`);
        await queryRunner.query(`DROP INDEX "IDX_b4c5994aaa44fe07a648fcd128"`);
        await queryRunner.query(`DROP INDEX "IDX_dd534091fe92088d4d21b095cb"`);
        await queryRunner.query(`DROP TABLE "Loan"`);
        await queryRunner.query(`DROP INDEX "IDX_88da68627b347230d5fd0b8013"`);
        await queryRunner.query(`DROP INDEX "IDX_45f0625bd8172eb9c821c948a0"`);
        await queryRunner.query(`DROP INDEX "IDX_29a05908a0fa0728526d283365"`);
        await queryRunner.query(`DROP TABLE "User"`);
    }

}

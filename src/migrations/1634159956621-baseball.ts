import {MigrationInterface, QueryRunner} from "typeorm";

export class baseball1634159956621 implements MigrationInterface {
    name = 'baseball1634159956621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."Baseball" ADD "wager" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."Baseball" DROP COLUMN "wager"`);
    }

}

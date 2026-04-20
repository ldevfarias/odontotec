import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCnpjToClinic1776711694455 implements MigrationInterface {
  name = 'AddCnpjToClinic1776711694455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "cnpj" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clinics" DROP COLUMN IF EXISTS "cnpj"`,
    );
  }
}

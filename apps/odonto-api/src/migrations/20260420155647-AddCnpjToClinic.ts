import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCnpjToClinic20260420155647 implements MigrationInterface {
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

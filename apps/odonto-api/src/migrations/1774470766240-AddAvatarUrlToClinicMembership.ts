import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToClinicMembership1774470766240 implements MigrationInterface {
  name = 'AddAvatarUrlToClinicMembership1774470766240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clinic_memberships" ADD COLUMN IF NOT EXISTS "avatar_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clinic_memberships" DROP COLUMN "avatar_url"`,
    );
  }
}

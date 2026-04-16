import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddToothObservations1775309762671 implements MigrationInterface {
  name = 'AddToothObservations1775309762671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('tooth_observations');
    if (tableExists) return;

    await queryRunner.query(
      `CREATE TABLE "tooth_observations" ("id" SERIAL NOT NULL, "tooth_number" character varying NOT NULL, "tooth_faces" character varying, "description" text NOT NULL, "date" TIMESTAMP NOT NULL, "patient_id" integer NOT NULL, "clinic_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ec419187c443c05b9a0c52284f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tooth_observations" ADD CONSTRAINT "FK_04ccdb251345ba9271fdc5ced29" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tooth_observations" ADD CONSTRAINT "FK_daf2a960fb328e6cc6f76f5abab" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tooth_observations" DROP CONSTRAINT "FK_daf2a960fb328e6cc6f76f5abab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tooth_observations" DROP CONSTRAINT "FK_04ccdb251345ba9271fdc5ced29"`,
    );
    await queryRunner.query(`DROP TABLE "tooth_observations"`);
  }
}

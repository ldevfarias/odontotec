import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase3SecurityHardening1774471000000 implements MigrationInterface {
  name = 'Phase3SecurityHardening1774471000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create processed_stripe_events table for idempotency
    await queryRunner.query(`
            CREATE TABLE "processed_stripe_events" (
                "id" varchar NOT NULL, 
                "processed_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_processed_stripe_events" PRIMARY KEY ("id")
            )
        `);

    // Add unique constraint to appointments to prevent double-booking at DB level
    // Use COALESCE or exact matches for columns (clinic_id, dentist_id, date)
    await queryRunner.query(`
            ALTER TABLE "appointments" 
            ADD CONSTRAINT "UQ_appointments_clinic_id_dentist_id_date" 
            UNIQUE ("clinic_id", "dentist_id", "date")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "UQ_appointments_clinic_id_dentist_id_date"`,
    );
    await queryRunner.query(`DROP TABLE "processed_stripe_events"`);
  }
}

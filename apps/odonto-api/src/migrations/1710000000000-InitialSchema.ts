import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Initial Schema Migration
 *
 * Creates all tables and relationships for the OdontoTec multi-tenant dental clinic management system.
 * Tables are created in dependency order to ensure foreign key constraints are valid.
 */
export class InitialSchema1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. USERS (no dependencies)
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'email', type: 'varchar', isNullable: false, isUnique: true },
          { name: 'password', type: 'varchar', isNullable: false },
          { name: 'currentHashedRefreshToken', type: 'varchar', isNullable: true },
          { name: 'resetPasswordToken', type: 'varchar', isNullable: true },
          { name: 'resetPasswordExpires', type: 'timestamp', isNullable: true },
          { name: 'role', type: 'enum', enum: ['ADMIN', 'SIMPLE', 'DENTIST'], default: "'SIMPLE'" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'terms_accepted_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // 2. CLINICS (depends on users)
    await queryRunner.createTable(
      new Table({
        name: 'clinics',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'address', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'logo_url', type: 'varchar', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'plan', type: 'varchar', default: "'FREE'" },
          { name: 'subscriptionStatus', type: 'varchar', default: "'TRIAL'" },
          { name: 'trialEndsAt', type: 'timestamp', isNullable: true },
          { name: 'current_period_end', type: 'timestamp', isNullable: true },
          { name: 'cancel_at_period_end', type: 'boolean', default: false },
          { name: 'stripe_customer_id', type: 'varchar', isNullable: true },
          { name: 'stripe_subscription_id', type: 'varchar', isNullable: true },
          { name: 'owner_id', type: 'integer', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['owner_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 3. CLINIC_MEMBERSHIPS (depends on users and clinics)
    await queryRunner.createTable(
      new Table({
        name: 'clinic_memberships',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'integer', isNullable: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'role', type: 'enum', enum: ['OWNER', 'ADMIN', 'DENTIST', 'RECEPTIONIST'], default: "'RECEPTIONIST'" },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
        uniques: [{ columnNames: ['user_id', 'clinic_id'] }],
      }),
      true,
    );

    // 4. PATIENTS (depends on clinics)
    await queryRunner.createTable(
      new Table({
        name: 'patients',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'birth_date', type: 'date', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'address', type: 'varchar', isNullable: true },
          { name: 'document', type: 'varchar', isNullable: true },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 5. CLINIC_PROCEDURES (depends on clinics)
    await queryRunner.createTable(
      new Table({
        name: 'clinic_procedures',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'category', type: 'varchar', isNullable: true },
          { name: 'baseValue', type: 'numeric', precision: 10, scale: 2, default: '0' },
          { name: 'selection_mode', type: 'varchar', default: "'FACE'" },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 6. PROCEDURES (depends on patients and clinics)
    await queryRunner.createTable(
      new Table({
        name: 'procedures',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'type', type: 'varchar', isNullable: true },
          { name: 'date', type: 'timestamp', isNullable: false },
          { name: 'cost', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'tooth_number', type: 'varchar', isNullable: true },
          { name: 'tooth_faces', type: 'varchar', isNullable: true },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 7. ANAMNESIS (depends on patients and clinics)
    await queryRunner.createTable(
      new Table({
        name: 'anamnesis',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'complaint', type: 'text', isNullable: false },
          { name: 'data', type: 'jsonb', isNullable: true },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 8. EXAMS (depends on patients and clinics)
    await queryRunner.createTable(
      new Table({
        name: 'exams',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', isNullable: false },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'fileUrl', type: 'varchar', isNullable: false },
          { name: 'fileType', type: 'varchar', isNullable: false },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 9. TREATMENT_PLANS (depends on patients, users, clinics)
    await queryRunner.createTable(
      new Table({
        name: 'treatment_plans',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
            default: "'DRAFT'",
          },
          { name: 'totalAmount', type: 'numeric', precision: 10, scale: 2, default: '0' },
          { name: 'discount', type: 'numeric', precision: 10, scale: 2, default: '0' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'notes', type: 'varchar', isNullable: true },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'dentist_id', type: 'integer', isNullable: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['dentist_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 10. TREATMENT_PLAN_ITEMS (depends on treatment_plans)
    await queryRunner.createTable(
      new Table({
        name: 'treatment_plan_items',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'description', type: 'varchar', isNullable: false },
          { name: 'value', type: 'numeric', precision: 10, scale: 2, isNullable: false },
          { name: 'toothNumber', type: 'integer', isNullable: true },
          { name: 'surface', type: 'varchar', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'CANCELLED'],
            default: "'PLANNED'",
          },
          { name: 'treatment_plan_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['treatment_plan_id'],
            referencedTableName: 'treatment_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // 11. PAYMENTS (depends on patients, clinics, treatment_plans)
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'amount', type: 'numeric', precision: 10, scale: 2, isNullable: false },
          {
            name: 'method',
            type: 'enum',
            enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'INSURANCE'],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'COMPLETED', 'CANCELED', 'CANCELLED'],
            default: "'PENDING'",
          },
          { name: 'date', type: 'timestamp', isNullable: false },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'treatment_plan_id', type: 'integer', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['treatment_plan_id'],
            referencedTableName: 'treatment_plans',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 12. APPOINTMENTS (depends on clinics, users, patients)
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'date', type: 'timestamp with time zone', isNullable: false },
          { name: 'duration', type: 'integer', default: 30 },
          {
            name: 'status',
            type: 'enum',
            enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'ABSENT'],
            default: "'SCHEDULED'",
          },
          { name: 'cancelled_by', type: 'enum', enum: ['PATIENT', 'CLINIC'], isNullable: true },
          { name: 'cancellation_reason', type: 'varchar', isNullable: true },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'dentist_id', type: 'integer', isNullable: false },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['dentist_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 13. BUDGETS (depends on clinics and patients)
    await queryRunner.createTable(
      new Table({
        name: 'budgets',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'status', type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED'], default: "'PENDING'" },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'total', type: 'numeric', precision: 10, scale: 2, default: '0' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 14. BUDGET_ITEMS (depends on budgets and clinic_procedures)
    await queryRunner.createTable(
      new Table({
        name: 'budget_items',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'budget_id', type: 'integer', isNullable: false },
          { name: 'clinic_procedure_id', type: 'integer', isNullable: false },
          { name: 'quantity', type: 'integer', default: 1 },
          { name: 'unit_price', type: 'numeric', precision: 10, scale: 2, isNullable: false },
          { name: 'subtotal', type: 'numeric', precision: 10, scale: 2, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['budget_id'],
            referencedTableName: 'budgets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['clinic_procedure_id'],
            referencedTableName: 'clinic_procedures',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 15. PATIENT_DOCUMENTS (depends on patients, users, clinics)
    await queryRunner.createTable(
      new Table({
        name: 'patient_documents',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'type', type: 'enum', enum: ['ATESTADO', 'RECEITA', 'OUTRO'], isNullable: false },
          { name: 'title', type: 'text', isNullable: false },
          { name: 'content', type: 'text', isNullable: false },
          { name: 'patient_id', type: 'integer', isNullable: false },
          { name: 'dentist_id', type: 'integer', isNullable: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'date', type: 'timestamp', default: 'now()' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['dentist_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 16. NOTIFICATIONS (depends on clinics)
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'message', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', default: "'INFO'" },
          { name: 'read', type: 'boolean', default: false },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'user_id', type: 'integer', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 17. USER_INVITATIONS (depends on clinics)
    await queryRunner.createTable(
      new Table({
        name: 'user_invitations',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'cpf', type: 'varchar', isNullable: false },
          { name: 'role', type: 'enum', enum: ['ADMIN', 'SIMPLE', 'DENTIST'], isNullable: false },
          { name: 'token', type: 'varchar', isNullable: false, isUnique: true },
          { name: 'clinic_id', type: 'integer', isNullable: false },
          { name: 'expires_at', type: 'timestamp', isNullable: false },
          { name: 'accepted_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['clinic_id'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 18. PENDING_REGISTRATIONS (no dependencies)
    await queryRunner.createTable(
      new Table({
        name: 'pending_registrations',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'email', type: 'varchar', isNullable: false, isUnique: true },
          { name: 'verificationToken', type: 'varchar', isNullable: false },
          { name: 'expires_at', type: 'timestamp', isNullable: false },
          { name: 'terms_accepted_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_email', columnNames: ['email'], isUnique: true }),
    );
    await queryRunner.createIndex(
      'clinic_memberships',
      new TableIndex({ name: 'IDX_clinic_memberships_user_clinic', columnNames: ['user_id', 'clinic_id'], isUnique: true }),
    );
    await queryRunner.createIndex(
      'patients',
      new TableIndex({ name: 'IDX_patients_clinic_id', columnNames: ['clinic_id'] }),
    );
    await queryRunner.createIndex(
      'appointments',
      new TableIndex({ name: 'IDX_appointments_clinic_id', columnNames: ['clinic_id'] }),
    );
    await queryRunner.createIndex(
      'appointments',
      new TableIndex({ name: 'IDX_appointments_patient_id', columnNames: ['patient_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'pending_registrations',
      'user_invitations',
      'notifications',
      'patient_documents',
      'budget_items',
      'budgets',
      'appointments',
      'payments',
      'treatment_plan_items',
      'treatment_plans',
      'exams',
      'anamnesis',
      'procedures',
      'clinic_procedures',
      'patients',
      'clinic_memberships',
      'clinics',
      'users',
    ];

    for (const tableName of tables) {
      await queryRunner.dropTable(tableName, true);
    }
  }
}

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Initial Schema Migration
 *
 * Creates all tables and relationships for the OdontoTec multi-tenant dental clinic management system.
 * Tables are created in dependency order to ensure foreign key constraints are valid.
 */
export class InitialSchema1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create USERS table (no dependencies)
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'currentHashedRefreshToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'resetPasswordToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'resetPasswordExpires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['ADMIN', 'DENTIST', 'SIMPLE'],
            default: "'SIMPLE'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'terms_accepted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create index for email on users
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_97672ac88f789774dd47f7c75d',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // 2. Create CLINICS table (depends on users)
    await queryRunner.createTable(
      new Table({
        name: 'clinics',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'plan',
            type: 'varchar',
            default: "'FREE'",
          },
          {
            name: 'subscriptionStatus',
            type: 'varchar',
            default: "'TRIAL'",
          },
          {
            name: 'trialEndsAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'current_period_end',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancel_at_period_end',
            type: 'boolean',
            default: false,
          },
          {
            name: 'stripe_customer_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripe_subscription_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'owner_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
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

    // 3. Create CLINIC_MEMBERSHIPS table (depends on users and clinics)
    await queryRunner.createTable(
      new Table({
        name: 'clinic_memberships',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'clinic_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['OWNER', 'MANAGER', 'DENTIST', 'RECEPTIONIST'],
            default: "'RECEPTIONIST'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
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
        uniques: [
          {
            columnNames: ['user_id', 'clinic_id'],
          },
        ],
      }),
      true,
    );

    // 4. Create PATIENTS table (depends on clinics)
    await queryRunner.createTable(
      new Table({
        name: 'patients',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'birth_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'document',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'clinic_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
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

    // 5. Create CLINIC_PROCEDURES table (depends on clinics)
    await queryRunner.createTable(
      new Table({
        name: 'clinic_procedures',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'clinic_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
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

    // 6. Create PROCEDURES table (depends on patients)
    await queryRunner.createTable(
      new Table({
        name: 'procedures',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
            default: "'PENDING'",
          },
          {
            name: 'tooth_position',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 7. Create ANAMNESIS table (depends on patients)
    await queryRunner.createTable(
      new Table({
        name: 'anamnesis',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'medical_history',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'medications',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'allergies',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 8. Create EXAMS table (depends on patients)
    await queryRunner.createTable(
      new Table({
        name: 'exams',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'exam_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'findings',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'recommendations',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 9. Create PAYMENTS table (depends on patients)
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'amount',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELED'],
            default: "'PENDING'",
          },
          {
            name: 'payment_method',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 10. Create APPOINTMENTS table (depends on patients and clinics)
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED'],
            default: "'PENDING'",
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'clinic_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
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

    // 11. Create TREATMENT_PLANS table (depends on patients)
    await queryRunner.createTable(
      new Table({
        name: 'treatment_plans',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELED'],
            default: "'DRAFT'",
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 12. Create TREATMENT_PLAN_ITEMS table (depends on treatment_plans and clinic_procedures)
    await queryRunner.createTable(
      new Table({
        name: 'treatment_plan_items',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'treatment_plan_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'clinic_procedure_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'procedure_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'integer',
            default: 1,
          },
          {
            name: 'unit_price',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
            default: "'PENDING'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['treatment_plan_id'],
            referencedTableName: 'treatment_plans',
            referencedColumnNames: ['id'],
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

    // 13. Create BUDGETS table (depends on patients)
    await queryRunner.createTable(
      new Table({
        name: 'budgets',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'total_amount',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'],
            default: "'DRAFT'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 14. Create BUDGET_ITEMS table (depends on budgets and clinic_procedures)
    await queryRunner.createTable(
      new Table({
        name: 'budget_items',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'budget_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'clinic_procedure_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'procedure_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'integer',
            default: 1,
          },
          {
            name: 'unit_price',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['budget_id'],
            referencedTableName: 'budgets',
            referencedColumnNames: ['id'],
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

    // 15. Create PATIENT_DOCUMENTS table (depends on patients)
    await queryRunner.createTable(
      new Table({
        name: 'patient_documents',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'patient_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['patient_id'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // 16. Create NOTIFICATIONS table (depends on clinics and users)
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'clinic_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
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

    // 17. Create USER_INVITATIONS table (depends on clinics)
    await queryRunner.createTable(
      new Table({
        name: 'user_invitations',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'clinic_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['OWNER', 'MANAGER', 'DENTIST', 'RECEPTIONIST'],
            default: "'RECEPTIONIST'",
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
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

    // 18. Create PENDING_REGISTRATIONS table (no dependencies)
    await queryRunner.createTable(
      new Table({
        name: 'pending_registrations',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'token',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create indexes for common queries
    await queryRunner.createIndex(
      'clinic_memberships',
      new TableIndex({
        name: 'IDX_clinic_memberships_user_clinic',
        columnNames: ['user_id', 'clinic_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'IDX_patients_clinic_id',
        columnNames: ['clinic_id'],
      }),
    );

    await queryRunner.createIndex(
      'procedures',
      new TableIndex({
        name: 'IDX_procedures_patient_id',
        columnNames: ['patient_id'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'IDX_appointments_patient_id',
        columnNames: ['patient_id'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'IDX_appointments_clinic_id',
        columnNames: ['clinic_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation (respecting foreign keys)
    const tables = [
      'pending_registrations',
      'user_invitations',
      'notifications',
      'patient_documents',
      'budget_items',
      'budgets',
      'treatment_plan_items',
      'treatment_plans',
      'appointments',
      'payments',
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

import { AppDataSource } from './typeorm.config';
import * as fs from 'fs';
import * as path from 'path';

async function generateMigration() {
  try {
    const migrationName = process.argv[2] || 'InitialSchema';

    console.log(`🔄 Generating migration: ${migrationName}...`);

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Connected to database');
    }

    // Generate migration using TypeORM's schema builder
    const upSql = await AppDataSource.driver.createSchemaBuilder().log();

    // Create migrations directory if it doesn't exist
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Generate timestamp-based filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${migrationName}.ts`;
    const filepath = path.join(migrationsDir, filename);

    const migrationTemplate = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${migrationName}${timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration should be generated using TypeORM CLI
    // For now, this is a placeholder that will be filled in
    // Run: npm run migration:generate -- ${migrationName}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implement rollback
  }
}
`;

    fs.writeFileSync(filepath, migrationTemplate);
    console.log(`✅ Migration created: ${filename}`);
    console.log(`📝 Location: ${filepath}`);
    console.log('⚠️  Please manually populate the up() method with your SQL');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating migration:', error);
    process.exit(1);
  }
}

generateMigration();

import { AppDataSource } from './typeorm.config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates the initial migration by comparing the current database schema
 * with the entities defined in the application.
 *
 * Usage: npm run migration:generate -- InitialSchema
 */
async function generateInitialMigration() {
  try {
    const migrationName = process.argv[2] || 'InitialSchema';

    console.log(`🔄 Generating migration: ${migrationName}...`);

    // Initialize the connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Connected to database');
    }

    // Build the migration
    console.log('📋 Building migration...');
    const upSql = await AppDataSource.driver.createSchemaBuilder().log();

    // Create migrations directory if it doesn't exist
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Generate timestamp-based filename (using a more readable format)
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `${timestamp}-${migrationName}.ts`;
    const filepath = path.join(migrationsDir, filename);

    // Create a migration template
    const migrationClass = migrationName.replace(/[^a-zA-Z0-9]/g, '');
    const migrationTemplate = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${migrationClass}${timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Auto-generated migration - populated by schema builder
    // This migration creates the initial database schema from entities
    await Promise.resolve(); // Placeholder - see comments below

    // TODO: The actual SQL statements should be generated here
    // by the TypeORM schema builder. This requires running migrations
    // in a development environment first, then copying the generated SQL.
    //
    // For now, this migration should be populated manually or by:
    // 1. Running: npx typeorm migration:generate -d dist/typeorm.config.js -n InitialSchema
    // 2. Copying the generated SQL from node_modules or the migration file
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implement rollback - drop all tables in reverse dependency order
    // This will be generated when migrations are working properly
  }
}
`;

    fs.writeFileSync(filepath, migrationTemplate);
    console.log(`✅ Migration file created: ${filename}`);
    console.log(`📝 Location: migrations/${filename}`);
    console.log('');
    console.log('⚠️  Next steps:');
    console.log('1. Ensure your database is running and accessible');
    console.log('2. Check that all environment variables are set correctly');
    console.log('3. The migration file has been created but needs to be populated');
    console.log('4. You can either:');
    console.log('   a) Use TypeORM CLI: npx typeorm migration:generate -d dist/typeorm.config.js -n MigrationName');
    console.log('   b) Manually write the SQL in the up() method');
    console.log('   c) Or let TypeORM sync handle it in development (synchronize: true)');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating migration:', error);
    process.exit(1);
  }
}

generateInitialMigration();

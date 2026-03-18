import { AppDataSource } from './typeorm.config';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    const migrations = await AppDataSource.runMigrations();
    console.log(`✅ Executed ${migrations.length} migration(s)`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();

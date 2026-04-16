import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || process.env.PGPORT || '5434'),
  username: process.env.POSTGRES_USER || process.env.PGUSER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || process.env.PGDATABASE || 'odonto_tec',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
  migrationsRun: false,
  migrationsTableName: 'typeorm_migrations',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

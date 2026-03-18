import { DataSource } from 'typeorm';

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? (process.env.NODE_ENV === 'production' ? (() => { throw new Error('FATAL SECURITY ERROR: POSTGRES_PASSWORD is required in production') })() : 'postgres_password'),
    database: process.env.POSTGRES_DB || 'odonto_tec',
    synchronize: false,
    entities: [],
});

async function drop() {
    try {
        await dataSource.initialize();
        console.log('Connected to database. Dropping schema...');
        await dataSource.dropDatabase();
        console.log('Schema dropped successfully.');
        await dataSource.destroy();
    } catch (error) {
        console.error('Error dropping schema:', error);
        process.exit(1);
    }
}

drop();

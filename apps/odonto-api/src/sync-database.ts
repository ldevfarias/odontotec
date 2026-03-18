import { AppDataSource } from './typeorm.config';

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando banco de dados...');

    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    await AppDataSource.synchronize();
    console.log('✅ Banco sincronizado com sucesso!');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
    process.exit(1);
  }
}

syncDatabase();

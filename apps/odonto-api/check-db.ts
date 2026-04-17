import * as dotenv from 'dotenv';
import * as path from 'path';
import { createConnection } from 'typeorm';

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5434'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres_password',
      database: process.env.POSTGRES_DB || 'odonto_tec',
      synchronize: false,
      logging: false,
    });

    console.log('Connected to DB');
    const appointments = await connection.query(`
            SELECT id, date, duration, dentist_id, patient_id 
            FROM appointments 
            ORDER BY id DESC 
            LIMIT 5;
        `);

    console.log('Last 5 appointments:');
    appointments.forEach((a: Record<string, unknown>) => {
      console.log(
        `ID: ${a['id']} | Raw Date: ${a['date']} | JS Date: ${new Date(a['date'] as string).toISOString()} | Local: ${new Date(a['date'] as string).toString()}`,
      );
    });

    await connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();

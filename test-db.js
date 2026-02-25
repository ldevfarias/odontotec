const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5434,
    user: 'postgres',
    password: 'postgres_password',
    database: 'odonto_tec'
});
client.connect();
client.query('SELECT id, date, duration, status FROM appointments WHERE "dentist_id" = 4 AND status != \'CANCELLED\' ORDER BY date DESC LIMIT 10', (err, res) => {
    if (err) console.error(err.stack);
    else console.table(res.rows);
    client.end();
});

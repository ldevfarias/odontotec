const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5434,
    user: 'postgres',
    password: 'postgres_password',
    database: 'odonto_tec'
});
client.connect();
client.query('UPDATE appointments SET date = date_trunc(\'minute\', date) WHERE id = 20', (err, res) => {
    if (err) console.error(err.stack);
    else console.log('Cleaned up appointment 20:', res.rowCount);
    client.end();
});

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const { createApp } = require('./app');

const dataMode = process.env.DATA_MODE || 'primary';
if (!['primary', 'demo'].includes(dataMode)) throw new Error('DATA_MODE debe ser primary o demo.');
const databaseName = dataMode === 'demo' ? process.env.DEMO_DB_NAME : process.env.DB_NAME;
if (!databaseName) throw new Error(`Falta ${dataMode === 'demo' ? 'DEMO_DB_NAME' : 'DB_NAME'}.`);
if (dataMode === 'demo' && databaseName !== 'tueste_business_solutions_entrega') {
  throw new Error('El modo demo requiere la base académica de evaluación autorizada.');
}
const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Faltan variables de conexión: ${missing.join(', ')}`);

const pool = mysql.createPool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: databaseName, user: process.env.DB_USER, password: process.env.DB_PASSWORD, waitForConnections: true, connectionLimit: 10, queueLimit: 0, decimalNumbers: true });
const app = createApp({ pool, dataMode, databaseName });
const port = Number(process.env.PORT || 3017);
const server = app.listen(port, () => console.log(`API Tueste Analytics (${dataMode}) disponible en http://localhost:${port}`));
async function shutdown() { await pool.end(); server.close(() => process.exit(0)); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


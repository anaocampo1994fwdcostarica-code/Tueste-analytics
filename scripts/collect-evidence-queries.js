/*
 * Consulta de solo lectura para evidencias de la entrega académica.
 * No ejecuta DDL, DML, migraciones ni inserciones.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mysql = require('../backend/node_modules/mysql2/promise');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env'), quiet: true });

const TARGET_DATABASE = 'tueste_business_solutions_entrega';

function section(title) {
  console.log(`\n${'='.repeat(78)}\n${title}\n${'='.repeat(78)}`);
}

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: TARGET_DATABASE,
    decimalNumbers: true,
  });

  try {
    const query = async (sql) => (await pool.query(sql))[0];
    const [identity] = await query('SELECT DATABASE() AS current_database');
    if (identity.current_database !== TARGET_DATABASE) {
      throw new Error(`Destino no autorizado: ${identity.current_database || '(sin base)'}`);
    }

    section('EVIDENCIA SELECT — BASE DE EVALUACIÓN');
    console.table([identity]);

    const tables = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    section(`TABLAS EXISTENTES (${tables.length})`);
    console.table(tables);

    const counts = [];
    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME;
      const [count] = await query(`SELECT COUNT(*) AS record_count FROM \`${tableName}\``);
      counts.push({ table_name: tableName, record_count: count.record_count });
    }
    section(`CONTEOS DE REGISTROS (TOTAL: ${counts.reduce((sum, row) => sum + Number(row.record_count), 0)})`);
    console.table(counts);

    const foreignKeys = await query(`
      SELECT table_name, column_name, referenced_table_name, referenced_column_name
      FROM information_schema.key_column_usage
      WHERE table_schema = DATABASE() AND referenced_table_name IS NOT NULL
      ORDER BY table_name, column_name
    `);
    section(`RELACIONES / CLAVES FORÁNEAS (${foreignKeys.length})`);
    console.table(foreignKeys);

    const [acquisition] = await query(`
      SELECT
        SUM(ad_spend_usd) / NULLIF(SUM(clicks), 0) AS cpc_usd,
        100 * SUM(clicks) / NULLIF(SUM(impressions), 0) AS ctr_percent,
        SUM(ad_spend_usd + other_marketing_cost_usd) /
          NULLIF((SELECT COUNT(DISTINCT subscription_id) FROM campaign_attributions), 0) AS cac_usd,
        (
          SELECT SUM(so.total_usd - so.tax_usd)
          FROM campaign_attributions ca
          JOIN subscription_orders so ON so.subscription_id = ca.subscription_id
          WHERE so.status IN ('paid', 'processing', 'shipped', 'delivered')
        ) / NULLIF(SUM(ad_spend_usd), 0) AS roas
      FROM campaign_daily_metrics
    `);
    section('CPC, CTR, CAC Y ROAS GLOBALES');
    console.table([acquisition]);

    const [conversion] = await query(`
      SELECT COUNT(DISTINCT l.id) AS total_leads,
        COUNT(DISTINCT s.source_lead_id) AS converted_leads,
        COUNT(DISTINCT s.source_lead_id) / NULLIF(COUNT(DISTINCT l.id), 0) AS lead_to_subscriber_rate
      FROM leads l
      LEFT JOIN subscriptions s ON s.source_lead_id = l.id
    `);
    section('CONVERSIÓN DEL EMBUDO');
    console.table([conversion]);

    const [cycle] = await query(`
      SELECT COUNT(*) AS closed_opportunities,
        AVG(TIMESTAMPDIFF(HOUR, l.created_at, o.closed_at) / 24.0) AS average_sales_cycle_days
      FROM sales_opportunities o
      JOIN leads l ON l.id = o.lead_id
      WHERE o.status IN ('won', 'lost') AND o.closed_at IS NOT NULL
    `);
    section('CICLO DE VENTA');
    console.table([cycle]);

    const [ticket] = await query(`
      SELECT COUNT(*) AS recognized_orders,
        AVG(total_usd - tax_usd) AS average_ticket_usd
      FROM subscription_orders
      WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
    `);
    section('TICKET PROMEDIO');
    console.table([ticket]);

    const comparison = await query(`
      WITH vanity AS (
        SELECT campaign_id, SUM(impressions) AS impressions, SUM(clicks) AS clicks,
          SUM(ad_spend_usd) AS media_spend_usd,
          SUM(ad_spend_usd + other_marketing_cost_usd) AS total_acquisition_cost_usd
        FROM campaign_daily_metrics GROUP BY campaign_id
      ), business AS (
        SELECT ca.campaign_id, COUNT(DISTINCT ca.subscription_id) AS acquired_customers,
          COUNT(DISTINCT so.id) AS recognized_orders,
          COALESCE(SUM(so.total_usd - so.tax_usd), 0) AS attributed_revenue_usd
        FROM campaign_attributions ca
        LEFT JOIN subscription_orders so ON so.subscription_id = ca.subscription_id
          AND so.status IN ('paid', 'processing', 'shipped', 'delivered')
        GROUP BY ca.campaign_id
      )
      SELECT c.name AS campaign, v.impressions, v.clicks,
        v.clicks / NULLIF(v.impressions, 0) AS ctr_rate,
        v.media_spend_usd / NULLIF(v.clicks, 0) AS cpc_usd,
        COALESCE(b.acquired_customers, 0) AS acquired_customers,
        COALESCE(b.recognized_orders, 0) AS recognized_orders,
        COALESCE(b.attributed_revenue_usd, 0) AS attributed_revenue_usd,
        v.total_acquisition_cost_usd / NULLIF(b.acquired_customers, 0) AS cac_usd,
        b.attributed_revenue_usd / NULLIF(v.media_spend_usd, 0) AS roas
      FROM campaigns c
      LEFT JOIN vanity v ON v.campaign_id = c.id
      LEFT JOIN business b ON b.campaign_id = c.id
      ORDER BY c.id
    `);
    section('COMPARACIÓN: MÉTRICAS DE VANIDAD Y DE NEGOCIO');
    console.table(comparison);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

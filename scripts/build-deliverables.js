import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const deliveryDir = path.join(root, 'entrega');
const diagramDir = path.join(deliveryDir, 'diagramas');
fs.mkdirSync(diagramDir, { recursive: true });

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function buildSql() {
  const database = 'tueste_business_solutions_entrega';
  let base = read('database/schema_actual.sql');
  const firstTable = base.indexOf('CREATE TABLE `advertising_acquisition_history`');
  if (firstTable < 0) throw new Error('No se encontró el inicio del esquema actual.');
  base = base.slice(firstTable).replace(/\n-- La base real[\s\S]*$/u, '').trim();

  let migration = read('database/migracion_comercial_propuesta.sql');
  migration = migration.slice(migration.indexOf('CREATE TABLE `team_members`')).trim();

  let data = read('database/datos_ficticios_tueste.sql');
  data = data.replaceAll('tueste_analytics_test_migration', database).trim();
  const queries = read('database/consultas_metricas_propuestas.sql')
    .replace('WHERE tp.contact_id = ?', 'WHERE tp.contact_id = 1')
    .replace('-- Reemplazar ? por un parametro preparado; no concatenar el identificador.', '-- Ejecucion DEMO autocontenida para el contacto ficticio 1.')
    .trim();

  const output = `-- Primer Postejercicio — Business Solutions: Mercadeo comercial en una empresa de servicios.\n-- Tueste Analytics: DDL + DML DEMO + consultas académicas.\n-- Base exclusiva de entrega. Falla si ya existe y no contiene credenciales.\n-- Los 514 registros son ficticios y no representan resultados reales de Tueste.\n\nCREATE DATABASE \`${database}\`\n  CHARACTER SET utf8mb4\n  COLLATE utf8mb4_0900_ai_ci;\n\nUSE \`${database}\`;\n\n-- ============================================================\n-- 1. DDL: 12 tablas financieras originales\n-- ============================================================\n${base}\n\n-- ============================================================\n-- 2. DDL: 24 tablas comerciales\n-- ============================================================\n${migration}\n\n-- ============================================================\n-- 3. DML: 514 registros ficticios con validaciones bloqueantes\n-- ============================================================\n${data}\n\n-- ============================================================\n-- 4. Consultas académicas de métricas\n-- La consulta 12 usa el contacto ficticio 1 para ser autocontenida.\n-- ============================================================\n${queries}\n`;
  fs.writeFileSync(path.join(deliveryDir, 'tueste_business_solutions.sql'), output, 'utf8');
}

function parseEr() {
  const source = read('database/diagrama_er_comercial.mmd');
  const entities = [...source.matchAll(/^\s{4}([a-z][a-z0-9_]*)\s*\{/gm)].map((match) => match[1]);
  const relations = [...source.matchAll(/^\s{4}([a-z][a-z0-9_]*)\s+([^\s]+)--([^\s]+)\s+([a-z][a-z0-9_]*)\s*:\s*(.+)$/gm)]
    .map((match) => ({ from: match[1], left: match[2], right: match[3], to: match[4], label: match[5].trim() }));
  return { entities, relations };
}

const erGroups = [
  ['Finanzas existentes', ['products','commercial_offers','offer_products','product_variable_costs','order_variable_cost_assumptions','financial_assumptions','advertising_acquisition_history','commercial_scenarios','repurchase_patterns','subscription_parameters','simulation_configs','simulation_config_scenarios']],
  ['Campañas y contenido', ['team_members','marketing_channels','campaigns','campaign_daily_metrics','content_items','content_channels','content_reviews']],
  ['CRM y embudo', ['contacts','customer_journey_stages','customer_touchpoints','sales_funnel_stages','leads','lead_stage_history','sales_opportunities']],
  ['Handoffs y suscripciones', ['marketing_sales_handoffs','handoff_followups','subscription_plans','subscriptions','subscription_items','subscription_orders','subscription_order_items','deliveries','subscription_events','campaign_attributions']],
];
const junctions = new Set(['offer_products','simulation_config_scenarios','content_channels','subscription_items']);

function buildErSvg() {
  const { entities, relations } = parseEr();
  if (entities.length !== 36) throw new Error(`Se esperaban 36 entidades ER y se encontraron ${entities.length}.`);
  const width = 2600, height = 2500, groupWidth = 600, startX = 70, startY = 190;
  const positions = new Map();
  const groupSvg = [];
  erGroups.forEach(([title, names], groupIndex) => {
    const x = startX + groupIndex * 630;
    const boxHeight = 100 + names.length * 82;
    groupSvg.push(`<rect x="${x}" y="130" width="${groupWidth}" height="${boxHeight}" rx="18" fill="${groupIndex === 0 ? '#e2f1e7' : '#fff4dc'}" stroke="${groupIndex === 0 ? '#357052' : '#a66b00'}" stroke-width="2"/>`);
    groupSvg.push(`<text x="${x + 24}" y="170" font-size="25" font-weight="700" fill="#173d29">${escapeXml(title)}</text>`);
    names.forEach((name, index) => {
      const nodeX = x + 30, nodeY = startY + index * 82;
      positions.set(name, { x: nodeX, y: nodeY, cx: nodeX + 270, cy: nodeY + 27 });
      const isJunction = junctions.has(name);
      groupSvg.push(`<rect x="${nodeX}" y="${nodeY}" width="540" height="54" rx="9" fill="${isJunction ? '#ffe1a8' : '#ffffff'}" stroke="${isJunction ? '#a45f00' : '#6a7e73'}" stroke-width="${isJunction ? 3 : 1.5}"/>`);
      groupSvg.push(`<text x="${nodeX + 18}" y="${nodeY + 34}" font-size="20" font-family="Arial" fill="#173d29">${escapeXml(name)}${isJunction ? '  [TABLA INTERMEDIA N:M]' : ''}</text>`);
    });
  });

  const relationY = 1320;
  const relationRows = relations.map((r, index) => {
    const col = index % 3, row = Math.floor(index / 3);
    const x = 80 + col * 830, y = relationY + row * 54;
    return `<text x="${x}" y="${y}" font-size="16" font-family="Consolas, monospace" fill="#334b40">${escapeXml(`${r.from} ${r.left}--${r.right} ${r.to} : ${r.label}`)}</text>`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f8faf7"/>
  <text x="70" y="65" font-size="38" font-weight="700" font-family="Arial" fill="#173d29">Tueste Analytics — Diagrama ER (36 tablas)</text>
  <text x="70" y="105" font-size="20" font-family="Arial" fill="#586d62">Cardinalidades Mermaid preservadas: || uno obligatorio · o| cero o uno · o{ cero o muchos · |{ uno o muchos</text>
  ${groupSvg.join('\n  ')}
  <text x="70" y="1260" font-size="30" font-weight="700" font-family="Arial" fill="#173d29">Relaciones y cardinalidades</text>
  ${relationRows.join('\n  ')}
  <text x="70" y="2440" font-size="17" font-family="Arial" fill="#7a4c00">Naranja intenso: tabla intermedia N:M · Verde: tablas financieras existentes · Amarillo: extensión comercial</text>
</svg>`;
  fs.writeFileSync(path.join(diagramDir, 'diagrama_er_comercial.svg'), svg, 'utf8');
}

function buildArchitectureSvg() {
  const width = 1900, height = 1250;
  const agents = ['Campañas y publicidad','Contenidos y calendario','Revisión y aprobaciones','Embudo y leads','Handoff marketing–ventas','Suscripciones y clientes','Analítica comercial y financiera'];
  const agentNodes = agents.map((name, index) => {
    const col = index % 4, row = Math.floor(index / 4), x = 100 + col * 440, y = 520 + row * 160;
    return `<rect x="${x}" y="${y}" width="390" height="90" rx="14" fill="#fff3d6" stroke="#a66b00" stroke-width="2" stroke-dasharray="8 5"/><text x="${x + 195}" y="${y + 53}" text-anchor="middle" font-size="19" font-family="Arial" fill="#5e3d00">${escapeXml(name)}</text><path d="M950 420 L${x + 195} ${y}" stroke="#a66b00" stroke-width="2" fill="none" marker-end="url(#arrow)"/>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#566b60"/></marker></defs>
  <rect width="100%" height="100%" fill="#f8faf7"/>
  <text x="70" y="60" font-size="38" font-weight="700" font-family="Arial" fill="#173d29">Tueste Analytics — Arquitectura de agentes</text>
  <rect x="90" y="110" width="330" height="80" rx="14" fill="#fde4e4" stroke="#a43a3a" stroke-width="2"/><text x="255" y="158" text-anchor="middle" font-size="21" font-family="Arial">Usuario / aprobación humana</text>
  <rect x="530" y="110" width="300" height="80" rx="14" fill="#dff3e5" stroke="#26643f" stroke-width="2"/><text x="680" y="158" text-anchor="middle" font-size="21" font-family="Arial">React [EXISTENTE]</text>
  <rect x="970" y="110" width="300" height="80" rx="14" fill="#dff3e5" stroke="#26643f" stroke-width="2"/><text x="1120" y="158" text-anchor="middle" font-size="21" font-family="Arial">Express GET [EXISTENTE]</text>
  <rect x="1410" y="110" width="300" height="80" rx="14" fill="#dff3e5" stroke="#26643f" stroke-width="2"/><text x="1560" y="145" text-anchor="middle" font-size="20" font-family="Arial">MySQL DEMO</text><text x="1560" y="172" text-anchor="middle" font-size="16" font-family="Arial">36 tablas [EXISTENTE]</text>
  <path d="M420 150 L530 150 M830 150 L970 150 M1270 150 L1410 150" stroke="#26643f" stroke-width="3" marker-end="url(#arrow)"/>
  <rect x="700" y="300" width="500" height="120" rx="18" fill="#fff3d6" stroke="#a66b00" stroke-width="3" stroke-dasharray="8 5"/><text x="950" y="350" text-anchor="middle" font-size="27" font-weight="700" font-family="Arial">Orquestador [PROPUESTO]</text><text x="950" y="385" text-anchor="middle" font-size="18" font-family="Arial">único canal de coordinación</text>
  <path d="M680 190 L850 300 M1120 190 L1050 300 M255 190 L700 340" stroke="#566b60" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
  ${agentNodes.join('\n  ')}
  <rect x="560" y="900" width="780" height="100" rx="16" fill="#e8eefc" stroke="#496aa8" stroke-width="2" stroke-dasharray="6 4"/><text x="950" y="942" text-anchor="middle" font-size="22" font-family="Arial">Herramientas externas [PROPUESTAS]</text><text x="950" y="975" text-anchor="middle" font-size="17" font-family="Arial">Publicidad · CRM · correo · calendario · CMS · pagos · logística · BI</text>
  <path d="M950 840 L950 900" stroke="#496aa8" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="90" y="1070" width="1720" height="90" rx="12" fill="#fde4e4" stroke="#a43a3a" stroke-width="2"/><text x="950" y="1110" text-anchor="middle" font-size="22" font-weight="700" font-family="Arial" fill="#641f1f">APROBACIÓN HUMANA: gasto · publicación · contacto · cambio de etapa · cierre · cobro · suscripción · mutaciones</text><text x="950" y="1142" text-anchor="middle" font-size="18" font-family="Arial" fill="#641f1f">Los agentes especializados no se comunican directamente entre sí.</text>
  <text x="80" y="1215" font-size="17" font-family="Arial" fill="#53685d">Verde sólido = implementado · Amarillo discontinuo = propuesto · Azul = integración externa propuesta · Rojo = control humano</text>
</svg>`;
  fs.writeFileSync(path.join(diagramDir, 'diagrama_arquitectura_agentes.svg'), svg, 'utf8');
}

buildSql();
buildErSvg();
buildArchitectureSvg();
console.log(JSON.stringify({ sql: 'entrega/tueste_business_solutions.sql', diagrams: ['entrega/diagramas/diagrama_er_comercial.svg','entrega/diagramas/diagrama_arquitectura_agentes.svg'] }));


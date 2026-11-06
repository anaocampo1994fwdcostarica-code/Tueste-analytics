const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./app');

function mockPool() {
  return { execute: async (sql) => {
    if (sql.includes('DATABASE() AS current_database')) return [[{ current_database:'tueste_business_solutions_entrega', table_count:36 }]];
    if (sql.includes('FROM campaigns) campaigns')) return [[{ campaigns:10,leads:12,converted_leads:10,subscriptions:10,recognized_orders:22,media_spend_usd:7350,other_marketing_cost_usd:585,recognized_revenue_usd:1122.8,average_ticket_usd:51.036364,cpc_usd:0.720588,ctr_percent:2.697,cac_usd:793.5,roas:0.152762,average_sales_cycle_days:9.28409091 }]];
    if (sql.includes('FROM products')) return [[{ id:1,name:'[DEMO] Producto' }]];
    return [[]];
  } };
}
async function withServer(run) {
  const app=createApp({pool:mockPool(),dataMode:'demo',databaseName:'tueste_business_solutions_entrega'});
  const server=app.listen(0); await new Promise(resolve=>server.once('listening',resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise(resolve=>server.close(resolve)); }
}
test('health identifica explícitamente el modo DEMO y las 36 tablas',()=>withServer(async base=>{
  const response=await fetch(`${base}/api/health`); const body=await response.json();
  assert.equal(response.status,200); assert.equal(body.meta.isDemo,true); assert.equal(body.tableCount,36);
  assert.equal(response.headers.get('x-tueste-data-mode'),'demo');
}));
test('resumen comercial expone métricas demo de solo lectura',()=>withServer(async base=>{
  const response=await fetch(`${base}/api/commercial/summary`); const body=await response.json();
  assert.equal(response.status,200); assert.equal(body.data[0].campaigns,10); assert.equal(body.data[0].recognized_orders,22);
  assert.equal(body.data[0].recognized_revenue_usd,1122.8); assert.equal(body.data[0].cac_usd,793.5);
  assert.equal(body.data[0].roas,0.152762); assert.equal(body.data[0].average_sales_cycle_days,9.28409091);
}));
test('una ruta financiera anterior continúa disponible',()=>withServer(async base=>{
  const response=await fetch(`${base}/api/products`); const body=await response.json();
  assert.equal(response.status,200); assert.equal(body.data[0].id,1);
}));


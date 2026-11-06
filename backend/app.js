const express = require('express');
const cors = require('cors');

function createApp({ pool, dataMode, databaseName }) {
  const app = express();
  const isDemo = dataMode === 'demo';
  const meta = { dataMode, database: databaseName, isDemo, label: isDemo ? 'DATOS FICTICIOS — DEMOSTRACIÓN ACADÉMICA' : null };
  app.use(cors());
  app.use(express.json());
  app.use((_req, res, next) => { res.set('X-Tueste-Data-Mode', dataMode); next(); });
  function databaseError(res, error) { console.error('Error de MySQL:', error.code || error.message); return res.status(503).json({ error: 'No fue posible consultar MySQL.', detail: error.code || 'DATABASE_ERROR', meta }); }
  async function query(res, sql, params = []) { try { const [rows] = await pool.execute(sql, params); res.json({ data: rows, meta }); } catch (error) { databaseError(res, error); } }

  app.get('/api/health', async (_req, res) => {
    try {
      const [rows] = await pool.execute('SELECT DATABASE() AS current_database, (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = ?) AS table_count', ['BASE TABLE']);
      const current = rows[0];
      const validDemo = !isDemo || (current.current_database === databaseName && Number(current.table_count) === 36);
      res.status(validDemo ? 200 : 503).json({ status: validDemo ? 'ok' : 'degraded', database: 'connected', currentDatabase: current.current_database, tableCount: Number(current.table_count), meta });
    } catch (error) { databaseError(res, error); }
  });
  app.get('/api/products', (_req, res) => query(res, 'SELECT id, name, description, active AS is_active FROM products ORDER BY name'));
  app.get('/api/offers', (_req, res) => query(res, `SELECT o.id,o.name,o.description,o.selling_price_usd,o.active AS is_active,COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT('productId',p.id,'name',p.name,'quantity',op.quantity)) FROM offer_products op JOIN products p ON p.id=op.product_id WHERE op.offer_id=o.id),JSON_ARRAY()) products FROM commercial_offers o ORDER BY o.name`));
  app.get('/api/costs', async (_req, res) => { try { const [a,b] = await Promise.all([pool.execute('SELECT pvc.id,pvc.product_id,p.name product_name,pvc.cost_name,pvc.cost_usd FROM product_variable_costs pvc JOIN products p ON p.id=pvc.product_id ORDER BY p.name,pvc.cost_name'),pool.execute('SELECT id,name,shipping_cost_usd,payment_fee_percent,payment_fee_fixed_usd,other_cost_usd FROM order_variable_cost_assumptions ORDER BY name')]); res.json({ data: { productCosts:a[0], orderCosts:b[0] }, meta }); } catch (error) { databaseError(res,error); } });
  app.get('/api/scenarios', (_req,res) => query(res,'SELECT cs.id,cs.name,cs.description,cs.offer_id,cs.order_cost_assumption_id,cs.monthly_ad_spend_usd AS advertising_spend_usd,cs.expected_cac_usd,cs.active AS is_active,o.selling_price_usd FROM commercial_scenarios cs JOIN commercial_offers o ON o.id=cs.offer_id ORDER BY cs.id'));
  app.get('/api/simulations', (_req,res) => query(res,'SELECT sc.id,sc.name,sc.financial_assumption_id AS assumptions_id,sc.projection_months,sc.created_at,fa.monthly_fixed_cost_usd,fa.notes FROM simulation_configs sc LEFT JOIN financial_assumptions fa ON fa.id=sc.financial_assumption_id ORDER BY sc.created_at DESC'));
  app.get('/api/financial-assumptions', (_req,res) => query(res,'SELECT id,name,monthly_fixed_cost_usd,projection_months,notes FROM financial_assumptions ORDER BY id'));
  app.get('/api/acquisition-history', (_req,res) => query(res,'SELECT id,period_start,period_end,channel,ad_spend_usd,acquired_customers,attributed_revenue_usd FROM advertising_acquisition_history ORDER BY period_start DESC,id DESC'));
  app.get('/api/repurchase-patterns', (_req,res) => query(res,'SELECT id,name,month_number,repurchase_probability FROM repurchase_patterns ORDER BY name,month_number'));

  app.get('/api/commercial/summary', (_req,res) => query(res,`SELECT
    (SELECT COUNT(*) FROM campaigns) campaigns,
    (SELECT COUNT(*) FROM leads) leads,
    (SELECT COUNT(DISTINCT source_lead_id) FROM subscriptions) converted_leads,
    (SELECT COUNT(*) FROM subscriptions) subscriptions,
    (SELECT COUNT(*) FROM subscription_orders WHERE status IN ('paid','processing','shipped','delivered')) recognized_orders,
    (SELECT COALESCE(SUM(ad_spend_usd),0) FROM campaign_daily_metrics) media_spend_usd,
    (SELECT COALESCE(SUM(other_marketing_cost_usd),0) FROM campaign_daily_metrics) other_marketing_cost_usd,
    (SELECT COALESCE(SUM(total_usd-tax_usd),0) FROM subscription_orders WHERE status IN ('paid','processing','shipped','delivered')) recognized_revenue_usd,
    (SELECT AVG(total_usd-tax_usd) FROM subscription_orders WHERE status IN ('paid','processing','shipped','delivered')) average_ticket_usd,
    (SELECT SUM(ad_spend_usd)/NULLIF(SUM(clicks),0) FROM campaign_daily_metrics) cpc_usd,
    (SELECT 100*SUM(clicks)/NULLIF(SUM(impressions),0) FROM campaign_daily_metrics) ctr_percent,
    (SELECT SUM(ad_spend_usd+other_marketing_cost_usd)/NULLIF((SELECT COUNT(DISTINCT subscription_id) FROM campaign_attributions),0) FROM campaign_daily_metrics) cac_usd,
    (SELECT SUM(o.total_usd-o.tax_usd)/NULLIF((SELECT SUM(ad_spend_usd) FROM campaign_daily_metrics),0) FROM campaign_attributions a JOIN subscription_orders o ON o.subscription_id=a.subscription_id WHERE o.status IN ('paid','processing','shipped','delivered')) roas,
    (SELECT AVG(TIMESTAMPDIFF(HOUR,l.created_at,o.closed_at)/24.0) FROM sales_opportunities o JOIN leads l ON l.id=o.lead_id WHERE o.status IN ('won','lost') AND o.closed_at IS NOT NULL) average_sales_cycle_days`));
  app.get('/api/commercial/campaigns', (_req,res) => query(res,`WITH spend AS (SELECT campaign_id,SUM(ad_spend_usd) media_spend_usd,SUM(other_marketing_cost_usd) other_cost_usd,SUM(impressions) impressions,SUM(clicks) clicks FROM campaign_daily_metrics GROUP BY campaign_id),acquired AS (SELECT campaign_id,COUNT(DISTINCT subscription_id) customers FROM campaign_attributions GROUP BY campaign_id),revenue AS (SELECT ca.campaign_id,SUM(o.total_usd-o.tax_usd) revenue_usd FROM campaign_attributions ca JOIN subscription_orders o ON o.subscription_id=ca.subscription_id AND o.status IN ('paid','processing','shipped','delivered') GROUP BY ca.campaign_id) SELECT c.id,c.name,ch.name channel,c.status,c.planned_budget_usd,COALESCE(s.media_spend_usd,0) media_spend_usd,COALESCE(s.other_cost_usd,0) other_cost_usd,COALESCE(s.impressions,0) impressions,COALESCE(s.clicks,0) clicks,s.media_spend_usd/NULLIF(s.clicks,0) cpc_usd,s.clicks/NULLIF(s.impressions,0) ctr_rate,(s.media_spend_usd+s.other_cost_usd)/NULLIF(a.customers,0) cac_usd,r.revenue_usd/NULLIF(s.media_spend_usd,0) roas,COALESCE(a.customers,0) acquired_customers,COALESCE(r.revenue_usd,0) attributed_revenue_usd FROM campaigns c JOIN marketing_channels ch ON ch.id=c.channel_id LEFT JOIN spend s ON s.campaign_id=c.id LEFT JOIN acquired a ON a.campaign_id=c.id LEFT JOIN revenue r ON r.campaign_id=c.id ORDER BY c.start_date,c.id`));
  app.get('/api/commercial/channels', (_req,res) => query(res,`SELECT ch.id,ch.name,ch.channel_type,COUNT(DISTINCT c.id) campaigns,COALESCE(SUM(m.ad_spend_usd),0) media_spend_usd,COALESCE(SUM(m.impressions),0) impressions,COALESCE(SUM(m.clicks),0) clicks,SUM(m.ad_spend_usd)/NULLIF(SUM(m.clicks),0) cpc_usd,SUM(m.clicks)/NULLIF(SUM(m.impressions),0) ctr_rate FROM marketing_channels ch LEFT JOIN campaigns c ON c.channel_id=ch.id LEFT JOIN campaign_daily_metrics m ON m.campaign_id=c.id GROUP BY ch.id,ch.name,ch.channel_type ORDER BY ch.name`));
  app.get('/api/commercial/funnel', (_req,res) => query(res,'SELECT s.id,s.name,s.sort_order,s.is_closed,COUNT(DISTINCT h.lead_id) leads FROM sales_funnel_stages s LEFT JOIN lead_stage_history h ON h.stage_id=s.id GROUP BY s.id,s.name,s.sort_order,s.is_closed ORDER BY s.sort_order'));
  app.get('/api/commercial/conversions', (_req,res) => query(res,`WITH ordered AS (SELECT lead_id,stage_id from_stage,LEAD(stage_id) OVER(PARTITION BY lead_id ORDER BY entered_at,id) to_stage FROM lead_stage_history),entries AS (SELECT stage_id,COUNT(DISTINCT lead_id) entered FROM lead_stage_history GROUP BY stage_id),transitions AS (SELECT from_stage,to_stage,COUNT(DISTINCT lead_id) transitioned FROM ordered WHERE to_stage IS NOT NULL GROUP BY from_stage,to_stage) SELECT f.name from_stage,t.name to_stage,e.entered,tz.transitioned,tz.transitioned/NULLIF(e.entered,0) conversion_rate FROM transitions tz JOIN entries e ON e.stage_id=tz.from_stage JOIN sales_funnel_stages f ON f.id=tz.from_stage JOIN sales_funnel_stages t ON t.id=tz.to_stage ORDER BY f.sort_order,t.sort_order`));
  app.get('/api/commercial/opportunities', (_req,res) => query(res,`SELECT o.id,CONCAT(c.first_name,' ',c.last_name) contact,o.status,o.expected_value_usd,o.won_value_usd,o.opened_at,o.closed_at,TIMESTAMPDIFF(HOUR,l.created_at,o.closed_at)/24.0 sales_cycle_days FROM sales_opportunities o JOIN leads l ON l.id=o.lead_id JOIN contacts c ON c.id=l.contact_id ORDER BY o.opened_at`));
  app.get('/api/commercial/contents', (_req,res) => query(res,'SELECT i.id,i.title,i.content_type,i.status,i.scheduled_at,i.published_at,tm.name author,COUNT(r.id) reviews,MAX(r.reviewed_at) last_reviewed_at FROM content_items i JOIN team_members tm ON tm.id=i.author_id LEFT JOIN content_reviews r ON r.content_id=i.id GROUP BY i.id,i.title,i.content_type,i.status,i.scheduled_at,i.published_at,tm.name ORDER BY i.id'));
  app.get('/api/commercial/handoffs', (_req,res) => query(res,'SELECT h.id,h.lead_id,h.decision,h.delivered_at,h.decided_at,h.rejection_reason,m.name marketing_owner,s.name sales_owner,COUNT(f.id) followups,TIMESTAMPDIFF(HOUR,h.delivered_at,h.decided_at) decision_hours FROM marketing_sales_handoffs h JOIN team_members m ON m.id=h.marketing_owner_id JOIN team_members s ON s.id=h.sales_owner_id LEFT JOIN handoff_followups f ON f.handoff_id=h.id GROUP BY h.id,h.lead_id,h.decision,h.delivered_at,h.decided_at,h.rejection_reason,m.name,s.name ORDER BY h.delivered_at'));
  app.get('/api/commercial/customers', (_req,res) => query(res,`SELECT c.id,c.customer_type,CONCAT(c.first_name,' ',c.last_name) name,c.company_name,c.email,COUNT(DISTINCT l.id) leads,COUNT(DISTINCT s.id) subscriptions FROM contacts c LEFT JOIN leads l ON l.contact_id=c.id LEFT JOIN subscriptions s ON s.contact_id=c.id GROUP BY c.id,c.customer_type,c.first_name,c.last_name,c.company_name,c.email ORDER BY c.id`));
  app.get('/api/commercial/subscriptions', (_req,res) => query(res,`SELECT s.id,CONCAT(c.first_name,' ',c.last_name) customer,c.customer_type,p.name plan,s.status,s.started_on,s.cancelled_on,COUNT(DISTINCT o.id) orders,COALESCE(SUM(CASE WHEN o.status IN ('paid','processing','shipped','delivered') THEN o.total_usd-o.tax_usd ELSE 0 END),0) recognized_revenue_usd FROM subscriptions s JOIN contacts c ON c.id=s.contact_id JOIN subscription_plans p ON p.id=s.plan_id LEFT JOIN subscription_orders o ON o.subscription_id=s.id GROUP BY s.id,c.first_name,c.last_name,c.customer_type,p.name,s.status,s.started_on,s.cancelled_on ORDER BY s.id`));
  app.get('/api/commercial/orders', (_req,res) => query(res,`SELECT o.id,o.order_number,o.status,o.ordered_at,o.paid_at,o.total_usd,o.tax_usd,o.total_usd-o.tax_usd recognized_revenue_usd,s.id subscription_id,CONCAT(c.first_name,' ',c.last_name) customer FROM subscription_orders o JOIN subscriptions s ON s.id=o.subscription_id JOIN contacts c ON c.id=s.contact_id ORDER BY o.ordered_at,o.id`));
  app.get('/api/commercial/ticket-average', (_req,res) => query(res,`SELECT COUNT(*) recognized_orders,AVG(total_usd-tax_usd) average_ticket_usd FROM subscription_orders WHERE status IN ('paid','processing','shipped','delivered')`));
  app.get('/api/commercial/financial-status', (_req,res) => query(res,`SELECT 'partial' margin_status,'partial' ltv_status,'insufficient_data' ltv_cac_status,'insufficient_data' payback_status,'partial' operating_cash_flow_status,'Faltan comisiones transaccionales, caja inicial, impuestos pagados, CAPEX, deuda y fechas reales de cobro/pago.' limitation`));
  app.use((err,_req,res,_next) => { console.error(err); res.status(500).json({ error:'Error interno del servidor.',meta }); });
  return app;
}
module.exports = { createApp };


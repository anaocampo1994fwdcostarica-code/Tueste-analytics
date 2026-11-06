-- PROPUESTAS PARA MYSQL 8.0. NO EJECUTADAS CONTRA LA BASE ACTUAL.
-- Requieren las tablas definidas en migracion_comercial_propuesta.sql.
-- Estados de ingreso reconocido usados aqui: paid, processing, shipped y delivered.
-- Pedidos pending, cancelled y refunded no se consideran ingreso.

-- 1. CPC y CTR por campana.
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  SUM(m.ad_spend_usd) AS executed_media_spend_usd,
  SUM(m.impressions) AS impressions,
  SUM(m.clicks) AS clicks,
  SUM(m.ad_spend_usd) / NULLIF(SUM(m.clicks), 0) AS cpc_usd,
  SUM(m.clicks) / NULLIF(SUM(m.impressions), 0) AS ctr_rate,
  100 * SUM(m.clicks) / NULLIF(SUM(m.impressions), 0) AS ctr_percent
FROM campaigns c
JOIN campaign_daily_metrics m ON m.campaign_id = c.id
GROUP BY c.id, c.name;

-- 2. CPC y CTR por canal, agregando primero cada campana.
WITH campaign_totals AS (
  SELECT
    c.id AS campaign_id,
    c.channel_id,
    SUM(m.ad_spend_usd) AS media_spend_usd,
    SUM(m.impressions) AS impressions,
    SUM(m.clicks) AS clicks
  FROM campaigns c
  JOIN campaign_daily_metrics m ON m.campaign_id = c.id
  GROUP BY c.id, c.channel_id
)
SELECT
  ch.id AS channel_id,
  ch.name AS channel_name,
  SUM(ct.media_spend_usd) / NULLIF(SUM(ct.clicks), 0) AS cpc_usd,
  SUM(ct.clicks) / NULLIF(SUM(ct.impressions), 0) AS ctr_rate
FROM marketing_channels ch
JOIN campaign_totals ct ON ct.channel_id = ch.id
GROUP BY ch.id, ch.name;

-- 3. Presupuesto planificado frente a inversion ejecutada.
WITH spend AS (
  SELECT
    campaign_id,
    SUM(ad_spend_usd) AS media_spend_usd,
    SUM(other_marketing_cost_usd) AS other_marketing_cost_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
)
SELECT
  c.id,
  c.name,
  c.planned_budget_usd,
  COALESCE(s.media_spend_usd, 0) AS media_spend_usd,
  COALESCE(s.other_marketing_cost_usd, 0) AS other_marketing_cost_usd,
  COALESCE(s.media_spend_usd, 0) + COALESCE(s.other_marketing_cost_usd, 0) AS executed_total_usd,
  c.planned_budget_usd - COALESCE(s.media_spend_usd, 0) - COALESCE(s.other_marketing_cost_usd, 0) AS remaining_budget_usd
FROM campaigns c
LEFT JOIN spend s ON s.campaign_id = c.id;

-- 4. CAC por campana.
-- Incluye medios y otros costos; cada suscripcion solo puede tener una atribucion.
WITH spend AS (
  SELECT
    campaign_id,
    SUM(ad_spend_usd + other_marketing_cost_usd) AS acquisition_cost_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
),
acquisitions AS (
  SELECT
    campaign_id,
    COUNT(DISTINCT subscription_id) AS acquired_customers
  FROM campaign_attributions
  GROUP BY campaign_id
)
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  COALESCE(s.acquisition_cost_usd, 0) AS acquisition_cost_usd,
  COALESCE(a.acquired_customers, 0) AS acquired_customers,
  s.acquisition_cost_usd / NULLIF(a.acquired_customers, 0) AS cac_usd
FROM campaigns c
LEFT JOIN spend s ON s.campaign_id = c.id
LEFT JOIN acquisitions a ON a.campaign_id = c.id;

-- 5. ROAS por campana.
-- Los gastos e ingresos se agregan en CTE separados para no multiplicar filas.
WITH spend AS (
  SELECT campaign_id, SUM(ad_spend_usd) AS media_spend_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
),
revenue AS (
  SELECT
    ca.campaign_id,
    SUM(so.total_usd - so.tax_usd) AS attributed_revenue_usd
  FROM campaign_attributions ca
  JOIN subscription_orders so ON so.subscription_id = ca.subscription_id
  WHERE so.status IN ('paid','processing','shipped','delivered')
  GROUP BY ca.campaign_id
)
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  COALESCE(r.attributed_revenue_usd, 0) AS attributed_revenue_usd,
  COALESCE(s.media_spend_usd, 0) AS media_spend_usd,
  r.attributed_revenue_usd / NULLIF(s.media_spend_usd, 0) AS roas
FROM campaigns c
LEFT JOIN spend s ON s.campaign_id = c.id
LEFT JOIN revenue r ON r.campaign_id = c.id;

-- 6. Conversion entre etapas consecutivas observadas del embudo.
WITH ordered_history AS (
  SELECT
    h.lead_id,
    h.stage_id AS from_stage_id,
    LEAD(h.stage_id) OVER (PARTITION BY h.lead_id ORDER BY h.entered_at, h.id) AS to_stage_id
  FROM lead_stage_history h
),
stage_entries AS (
  SELECT stage_id, COUNT(DISTINCT lead_id) AS entered_leads
  FROM lead_stage_history
  GROUP BY stage_id
),
transitions AS (
  SELECT
    from_stage_id,
    to_stage_id,
    COUNT(DISTINCT lead_id) AS transitioned_leads
  FROM ordered_history
  WHERE to_stage_id IS NOT NULL
  GROUP BY from_stage_id, to_stage_id
)
SELECT
  fs.name AS from_stage,
  ts.name AS to_stage,
  se.entered_leads,
  t.transitioned_leads,
  t.transitioned_leads / NULLIF(se.entered_leads, 0) AS conversion_rate
FROM transitions t
JOIN stage_entries se ON se.stage_id = t.from_stage_id
JOIN sales_funnel_stages fs ON fs.id = t.from_stage_id
JOIN sales_funnel_stages ts ON ts.id = t.to_stage_id
ORDER BY fs.sort_order, ts.sort_order;

-- 7. Conversion total de lead a suscriptor.
SELECT
  COUNT(DISTINCT l.id) AS total_leads,
  COUNT(DISTINCT s.source_lead_id) AS converted_leads,
  COUNT(DISTINCT s.source_lead_id) / NULLIF(COUNT(DISTINCT l.id), 0) AS lead_to_subscriber_rate
FROM leads l
LEFT JOIN subscriptions s ON s.source_lead_id = l.id;

-- 8. Ciclo de venta en dias para oportunidades cerradas.
SELECT
  o.id AS opportunity_id,
  o.status,
  TIMESTAMPDIFF(HOUR, l.created_at, o.closed_at) / 24.0 AS sales_cycle_days
FROM sales_opportunities o
JOIN leads l ON l.id = o.lead_id
WHERE o.status IN ('won','lost')
  AND o.closed_at IS NOT NULL;

-- 9. Promedio y mediana aproximada no se mezclan: esta consulta entrega promedio.
-- Ticket promedio observado, sin impuestos.
SELECT
  COUNT(*) AS recognized_orders,
  AVG(total_usd - tax_usd) AS average_ticket_usd
FROM subscription_orders
WHERE status IN ('paid','processing','shipped','delivered');

-- 10. Ticket promedio por plan y tipo de cliente.
SELECT
  sp.id AS plan_id,
  sp.name AS plan_name,
  c.customer_type,
  COUNT(*) AS recognized_orders,
  AVG(so.total_usd - so.tax_usd) AS average_ticket_usd
FROM subscription_orders so
JOIN subscriptions s ON s.id = so.subscription_id
JOIN subscription_plans sp ON sp.id = s.plan_id
JOIN contacts c ON c.id = s.contact_id
WHERE so.status IN ('paid','processing','shipped','delivered')
GROUP BY sp.id, sp.name, c.customer_type;

-- 11. Metricas de vanidad y de negocio en una vista comparativa por campana.
WITH vanity AS (
  SELECT
    campaign_id,
    SUM(impressions) AS impressions,
    SUM(clicks) AS clicks,
    SUM(ad_spend_usd) AS media_spend_usd,
    SUM(ad_spend_usd + other_marketing_cost_usd) AS total_acquisition_cost_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
),
business AS (
  SELECT
    ca.campaign_id,
    COUNT(DISTINCT ca.subscription_id) AS acquired_customers,
    COUNT(DISTINCT so.id) AS recognized_orders,
    COALESCE(SUM(so.total_usd - so.tax_usd), 0) AS attributed_revenue_usd
  FROM campaign_attributions ca
  LEFT JOIN subscription_orders so
    ON so.subscription_id = ca.subscription_id
   AND so.status IN ('paid','processing','shipped','delivered')
  GROUP BY ca.campaign_id
)
SELECT
  c.id,
  c.name,
  v.impressions,
  v.clicks,
  v.clicks / NULLIF(v.impressions, 0) AS ctr_rate,
  v.media_spend_usd / NULLIF(v.clicks, 0) AS cpc_usd,
  COALESCE(b.acquired_customers, 0) AS acquired_customers,
  COALESCE(b.recognized_orders, 0) AS recognized_orders,
  COALESCE(b.attributed_revenue_usd, 0) AS attributed_revenue_usd,
  v.total_acquisition_cost_usd / NULLIF(b.acquired_customers, 0) AS cac_usd,
  b.attributed_revenue_usd / NULLIF(v.media_spend_usd, 0) AS roas
FROM campaigns c
LEFT JOIN vanity v ON v.campaign_id = c.id
LEFT JOIN business b ON b.campaign_id = c.id;

-- 12. Recorrido cronologico de un contacto.
-- Reemplazar ? por un parametro preparado; no concatenar el identificador.
SELECT
  tp.occurred_at,
  js.name AS journey_stage,
  tp.touchpoint_type,
  COALESCE(c.name, ch.name) AS source_name,
  tp.notes
FROM customer_touchpoints tp
JOIN customer_journey_stages js ON js.id = tp.journey_stage_id
LEFT JOIN campaigns c ON c.id = tp.campaign_id
LEFT JOIN marketing_channels ch ON ch.id = tp.channel_id
WHERE tp.contact_id = ?
ORDER BY tp.occurred_at, tp.id;

-- 13. Cumplimiento del traspaso a ventas.
SELECT
  decision,
  COUNT(*) AS handoffs,
  AVG(TIMESTAMPDIFF(HOUR, delivered_at, decided_at)) AS average_decision_hours
FROM marketing_sales_handoffs
GROUP BY decision;

-- 14. Margen de contribucion observado por pedido antes de comisiones de pago.
-- El fee de pago no existe como hecho transaccional; debe incorporarse antes de
-- presentar este resultado como margen completo.
WITH item_costs AS (
  SELECT
    order_id,
    SUM(quantity * unit_cost_usd) AS product_cost_usd
  FROM subscription_order_items
  GROUP BY order_id
)
SELECT
  so.id AS order_id,
  so.order_number,
  so.subtotal_usd - so.discount_usd AS net_product_revenue_usd,
  COALESCE(ic.product_cost_usd, 0) AS product_cost_usd,
  so.shipping_usd,
  (so.subtotal_usd - so.discount_usd) - COALESCE(ic.product_cost_usd, 0) - so.shipping_usd AS partial_contribution_margin_usd
FROM subscription_orders so
LEFT JOIN item_costs ic ON ic.order_id = so.id
WHERE so.status IN ('paid','processing','shipped','delivered');

-- 15. LTV observado a 12 meses por suscripcion, usando contribucion parcial.
WITH item_costs AS (
  SELECT order_id, SUM(quantity * unit_cost_usd) AS product_cost_usd
  FROM subscription_order_items
  GROUP BY order_id
),
order_contribution AS (
  SELECT
    so.subscription_id,
    so.ordered_at,
    (so.subtotal_usd - so.discount_usd) - COALESCE(ic.product_cost_usd, 0) - so.shipping_usd AS contribution_usd
  FROM subscription_orders so
  LEFT JOIN item_costs ic ON ic.order_id = so.id
  WHERE so.status IN ('paid','processing','shipped','delivered')
)
SELECT
  s.id AS subscription_id,
  SUM(oc.contribution_usd) AS observed_ltv_12m_usd
FROM subscriptions s
JOIN order_contribution oc ON oc.subscription_id = s.id
WHERE oc.ordered_at >= s.started_on
  AND oc.ordered_at < DATE_ADD(s.started_on, INTERVAL 12 MONTH)
GROUP BY s.id;

-- 16. Flujo operativo mensual antes de costos fijos y movimientos financieros.
-- No equivale a flujo de caja completo: caja inicial, costos fijos, impuestos
-- pagados, CAPEX, deuda y fechas reales de cobro/pago deben suministrarse al motor.
WITH monthly_revenue AS (
  SELECT
    DATE_FORMAT(paid_at, '%Y-%m-01') AS period_month,
    SUM(total_usd - tax_usd) AS revenue_usd
  FROM subscription_orders
  WHERE status IN ('paid','processing','shipped','delivered')
    AND paid_at IS NOT NULL
  GROUP BY DATE_FORMAT(paid_at, '%Y-%m-01')
),
monthly_product_cost AS (
  SELECT
    DATE_FORMAT(so.paid_at, '%Y-%m-01') AS period_month,
    SUM(oi.quantity * oi.unit_cost_usd) AS product_cost_usd
  FROM subscription_orders so
  JOIN subscription_order_items oi ON oi.order_id = so.id
  WHERE so.status IN ('paid','processing','shipped','delivered')
    AND so.paid_at IS NOT NULL
  GROUP BY DATE_FORMAT(so.paid_at, '%Y-%m-01')
),
monthly_marketing AS (
  SELECT
    DATE_FORMAT(metric_date, '%Y-%m-01') AS period_month,
    SUM(ad_spend_usd + other_marketing_cost_usd) AS marketing_cost_usd
  FROM campaign_daily_metrics
  GROUP BY DATE_FORMAT(metric_date, '%Y-%m-01')
)
SELECT
  r.period_month,
  r.revenue_usd,
  COALESCE(pc.product_cost_usd, 0) AS product_cost_usd,
  COALESCE(mm.marketing_cost_usd, 0) AS marketing_cost_usd,
  r.revenue_usd - COALESCE(pc.product_cost_usd, 0) - COALESCE(mm.marketing_cost_usd, 0) AS operating_cash_before_fixed_costs_usd
FROM monthly_revenue r
LEFT JOIN monthly_product_cost pc ON pc.period_month = r.period_month
LEFT JOIN monthly_marketing mm ON mm.period_month = r.period_month
ORDER BY r.period_month;

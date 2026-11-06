// Datos mínimos requeridos antes de calcular indicadores derivados.
// No contiene fórmulas ni valores de ejemplo del caso académico.
export const metricRequirements = {
  cac: ['advertising_acquisition_history.advertising_spend_usd', 'advertising_acquisition_history.agency_fee_usd', 'advertising_acquisition_history.acquired_customers'],
  roas: ['ingresos atribuidos por campaña u oferta', 'advertising_acquisition_history.advertising_spend_usd'],
  breakEvenRoas: ['margen de contribución por oferta', 'regla académica de equilibrio'],
  contributionMargin: ['precio de venta por oferta', 'product_variable_costs', 'order_variable_cost_assumptions'],
  ltv12Months: ['precio o margen por periodo', 'repurchase_patterns', 'subscription_parameters'],
  ltvCacRatio: ['ltv12Months', 'cac'],
  payback: ['margen mensual por cohorte', 'cac'],
  cashFlow: ['financial_assumptions', 'ingresos mensuales', 'costos variables mensuales', 'advertising_acquisition_history'],
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function FlujoCaja({ assumptions, cashFlowResult, loading }) {
  const assumption = assumptions.find((item) => item.is_active) || assumptions[0];
  const missingCashFlow = cashFlowResult?.status === 'insufficient_data';
  const message = loading ? 'Cargando supuestos…' : !assumption ? 'No hay supuestos financieros activos.' : `Costo fijo mensual: ${money.format(assumption.monthly_fixed_cost_usd)} · Horizonte: ${assumption.projection_months} meses.${missingCashFlow ? ' El motor indica que faltan caja inicial y proyecciones mensuales.' : ''}`;
  return (
    <section className="dashboard-section" id="flujo-caja" aria-labelledby="titulo-flujo-caja">
      <header className="section-header"><p className="section-eyebrow">Liquidez empresarial</p><h2 id="titulo-flujo-caja">Flujo de caja</h2><p>Visualización proyectada del movimiento de caja.</p></header>
      <div className="panel-card cashflow-panel"><div className="panel-heading"><h3>Proyección mensual</h3><span>USD</span></div><div className="chart-placeholder" role="status"><div className="chart-grid" aria-hidden="true" /><p>{message} El gráfico requiere ingresos y egresos mensuales del caso.</p></div></div>
    </section>
  );
}

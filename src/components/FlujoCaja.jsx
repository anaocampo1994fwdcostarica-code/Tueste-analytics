export default function FlujoCaja() {
  return (
    <section className="dashboard-section" id="flujo-caja" aria-labelledby="titulo-flujo-caja">
      <header className="section-header">
        <p className="section-eyebrow">Liquidez empresarial</p>
        <h2 id="titulo-flujo-caja">Flujo de caja</h2>
        <p>Visualización proyectada del movimiento de caja.</p>
      </header>
      <div className="panel-card cashflow-panel">
        <div className="panel-heading">
          <h3>Proyección mensual</h3>
          <span>USD</span>
        </div>
        <div className="chart-placeholder" role="img" aria-label="Espacio reservado para el gráfico futuro de flujo de caja">
          <div className="chart-grid" aria-hidden="true" />
          <p>Gráfico por configurar</p>
        </div>
      </div>
    </section>
  );
}

const indicators = [
  { label: 'Rentabilidad', detail: 'Indicador por configurar' },
  { label: 'Caja disponible', detail: 'Indicador por configurar' },
  { label: 'Ingresos', detail: 'Indicador por configurar' },
  { label: 'Costos', detail: 'Indicador por configurar' },
];

export default function Dashboard() {
  return (
    <section className="dashboard-section" id="dashboard" aria-labelledby="titulo-dashboard">
      <header className="section-header">
        <p className="section-eyebrow">Herramienta de decisiones financieras</p>
        <h2 id="titulo-dashboard">Panel principal</h2>
        <p>Resumen ejecutivo de rentabilidad y liquidez de Tueste.</p>
      </header>
      <div className="kpi-grid">
        {indicators.map((indicator) => (
          <article className="kpi-card" key={indicator.label}>
            <span className="kpi-label">{indicator.label}</span>
            <strong className="kpi-value" aria-label="Sin dato disponible">—</strong>
            <span className="kpi-detail">{indicator.detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

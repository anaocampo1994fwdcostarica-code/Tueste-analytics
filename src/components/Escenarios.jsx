const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function Escenarios({ scenarios, references, loading, error }) {
  return (
    <section className="dashboard-section" id="comparacion" aria-labelledby="titulo-comparacion">
      <header className="section-header"><p className="section-eyebrow">Comparación estratégica</p><h2 id="titulo-comparacion">Escenarios</h2><p>Contraste visual de las estrategias disponibles.</p></header>
      {error && <p role="status">No se pudieron cargar datos de la API: {error}</p>}
      <div className="scenario-grid">
        {!loading && scenarios.length === 0 && <p>No hay escenarios registrados todavía. Existen {references.length} referencias iniciales pendientes de validación académica; no se muestran como resultados reales.</p>}
        {scenarios.map((scenario, index) => (
          <article className={`scenario-card scenario-${index + 1}`} key={scenario.id}>
            <span className="scenario-status">{scenario.scenario_type}</span><h3>{scenario.name}</h3><p>{scenario.description || 'Sin descripción.'}</p>
            <dl><div><dt>Inversión</dt><dd>{scenario.advertising_spend_usd == null ? '—' : formatter.format(scenario.advertising_spend_usd)}</dd></div><div><dt>Caja inicial</dt><dd>{scenario.initial_cash_usd == null ? '—' : formatter.format(scenario.initial_cash_usd)}</dd></div><div><dt>Costo fijo</dt><dd>{scenario.fixed_monthly_cost_usd == null ? '—' : formatter.format(scenario.fixed_monthly_cost_usd)}</dd></div></dl>
          </article>
        ))}
      </div>
    </section>
  );
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function Simulador({ simulations, assumptions, loading }) {
  const simulation = simulations[0];
  const assumption = assumptions.find((item) => item.id === simulation?.assumptions_id) || assumptions.find((item) => item.is_active) || assumptions[0];
  const fields = simulation && assumption ? [
    ['Configuración', simulation.name], ['Horizonte', `${simulation.projection_months} meses`],
    ['Costo fijo mensual', money.format(assumption.monthly_fixed_cost_usd)], ['Notas', assumption.notes || 'Sin notas'],
    ['Suscripción', 'No vinculada en el esquema actual'],
  ] : [];

  return (
    <section className="dashboard-section" id="simulador" aria-labelledby="titulo-simulador">
      <header className="section-header"><p className="section-eyebrow">Modelo de supuestos</p><h2 id="titulo-simulador">Simulador</h2><p>Consulta la configuración activa almacenada en MySQL.</p></header>
      <div className="simulator-layout"><div className="panel-card simulator-controls"><div className="panel-heading"><h3>Supuestos</h3><span>USD</span></div>
        <div className="placeholder-fields" aria-live="polite">
          {loading && <p>Cargando configuración…</p>}
          {!loading && fields.length === 0 && <p>No hay una configuración de simulación disponible.</p>}
          {fields.map(([label, value]) => <div className="placeholder-field" key={label}><span>{label}</span><div>{value}</div></div>)}
        </div>
      </div><aside className="panel-card simulator-result" aria-label="Resultado del simulador"><span className="panel-label">Resultado estimado</span><strong>—</strong><p>El cálculo se habilitará al contar con ventas, adquisición y patrones de recompra del caso académico.</p></aside></div>
    </section>
  );
}

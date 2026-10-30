const scenarios = [
  { name: 'Actual', description: 'Estrategia operativa de referencia.' },
  { name: 'Agencia', description: 'Estrategia con apoyo externo comercial.' },
  { name: 'Pack', description: 'Estrategia basada en paquetes de producto.' },
];

export default function Escenarios() {
  return (
    <section className="dashboard-section" id="comparacion" aria-labelledby="titulo-comparacion">
      <header className="section-header">
        <p className="section-eyebrow">Comparación estratégica</p>
        <h2 id="titulo-comparacion">Escenarios</h2>
        <p>Contraste visual de las estrategias disponibles.</p>
      </header>
      <div className="scenario-grid">
        {scenarios.map((scenario, index) => (
          <article className={`scenario-card scenario-${index + 1}`} key={scenario.name}>
            <span className="scenario-status">Pendiente de datos</span>
            <h3>{scenario.name}</h3>
            <p>{scenario.description}</p>
            <dl>
              <div><dt>Inversión</dt><dd>—</dd></div>
              <div><dt>Caja final</dt><dd>—</dd></div>
              <div><dt>Indicador clave</dt><dd>—</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

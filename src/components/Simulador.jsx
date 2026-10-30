export default function Simulador() {
  return (
    <section className="dashboard-section" id="simulador" aria-labelledby="titulo-simulador">
      <header className="section-header">
        <p className="section-eyebrow">Modelo de supuestos</p>
        <h2 id="titulo-simulador">Simulador</h2>
        <p>Ajusta los supuestos cuando estén disponibles los datos del proyecto.</p>
      </header>
      <div className="simulator-layout">
        <div className="panel-card simulator-controls">
          <div className="panel-heading">
            <h3>Supuestos</h3>
            <span>USD</span>
          </div>
          <div className="placeholder-fields" aria-label="Campos del simulador pendientes de configuración">
            {[1, 2, 3, 4, 5, 6].map((field) => (
              <div className="placeholder-field" key={field}>
                <span>Supuesto {field}</span>
                <div aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
        <aside className="panel-card simulator-result" aria-label="Resultado del simulador">
          <span className="panel-label">Resultado estimado</span>
          <strong>—</strong>
          <p>El cálculo estará disponible cuando se definan los supuestos.</p>
        </aside>
      </div>
    </section>
  );
}

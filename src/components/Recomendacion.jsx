export default function Recomendacion() {
  return (
    <section className="dashboard-section" id="conclusiones" aria-labelledby="titulo-conclusiones">
      <header className="section-header">
        <p className="section-eyebrow">Lectura financiera</p>
        <h2 id="titulo-conclusiones">Recomendación</h2>
        <p>Conclusiones derivadas de los indicadores y escenarios.</p>
      </header>
      <article className="recommendation-panel">
        <div>
          <span className="recommendation-label">Estado de la recomendación</span>
          <h3>Información pendiente</h3>
          <p>Las conclusiones se generarán después de incorporar los datos y cálculos financieros correspondientes.</p>
        </div>
        <div className="recommendation-status" aria-label="Estado pendiente">Pendiente</div>
      </article>
    </section>
  );
}

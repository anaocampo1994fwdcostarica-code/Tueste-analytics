export default function Recomendacion({ scenarios, products, offers, costs, financialModel, loading }) {
  const baseDataReady = scenarios.length > 0 && products.length > 0 && offers.length > 0 && costs && Object.values(costs).some((items) => items.length > 0);
  const ready = !loading && baseDataReady && financialModel?.comparison.status === 'ok';
  const missing = [scenarios.length === 0 && 'escenarios', products.length === 0 && 'productos', offers.length === 0 && 'ofertas', (!costs || Object.values(costs).every((items) => items.length === 0)) && 'costos'].filter(Boolean);
  return (
    <section className="dashboard-section" id="conclusiones" aria-labelledby="titulo-conclusiones">
      <header className="section-header"><p className="section-eyebrow">Lectura financiera</p><h2 id="titulo-conclusiones">Recomendación</h2><p>Conclusiones derivadas de los indicadores y escenarios.</p></header>
      <article className="recommendation-panel"><div><span className="recommendation-label">Estado de la recomendación</span><h3>{loading ? 'Cargando datos' : ready ? 'Datos listos para cálculo' : 'Información pendiente'}</h3><p>{loading ? 'Consultando la información registrada.' : ready ? 'Los datos base están disponibles; faltan métricas derivadas para emitir una recomendación financiera.' : `Faltan datos base: ${missing.join(', ') || 'datos financieros de cálculo'}.`}</p></div><div className="recommendation-status">{loading ? 'Cargando' : ready ? 'Preparada' : 'Pendiente'}</div></article>
    </section>
  );
}

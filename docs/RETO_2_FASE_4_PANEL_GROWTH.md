# Reto 2 — Fase 4: Panel de Growth de Diego

Estado: implementado; validación automatizada completada después del checkpoint final.

## Módulos

- **Dashboard ejecutivo:** clientes Meta (escenario), referidos válidos (Rewards DEMO), CAC Meta, costo por referido, viralidad, conversión, retención y recompensas.
- **Embudo y ciclo:** cantidades del caso separadas de las unidades de invitación; ciclo propuesto explícitamente rotulado como hipótesis.
- **Economía editable:** gasto Meta, fee, clientes Meta, contribución mensual y churn. Los cambios alteran un escenario hipotético, no datos observados.
- **Cohorte:** retención por mes mediante `projectCohortRetention`.
- **Experimento A/B:** hipótesis post-entrega, variantes, métrica, contramétrica, muestra y conclusión descriptiva; no declara ganador.
- **ICE, matriz de canales y plan de 90 días:** prioridades y acciones propuestas, no resultados de negocio.

## Integración

`GrowthDashboard` carga el mismo estado versionado de `Tueste Rewards` mediante `loadRewardsState`; no duplica conversiones ni recompensas. Una compra DEMO registrada en Rewards se refleja al navegar al panel. MySQL no participa.

## Fuentes

| Dato | Etiqueta |
|---|---|
| Embudo 1.000→60 | Caso / contexto oficial pendiente de contraste PDF directo |
| Estado de invitaciones, compras y recompensas | Tueste Rewards DEMO local |
| Gasto, fee, clientes, contribución y churn editables | Escenario / supuesto |
| Plan, ICE, matriz y A/B | Propuesta de Growth |

## Archivos

- `src/growth/growthDashboardModel.js`
- `src/growth/growthDashboardModel.test.js`
- `src/components/GrowthDashboard.jsx`
- `src/App.jsx`, `src/components/Sidebar.jsx`, `src/styles.css`
- `docs/RETO_2_GROWTH_PROGRESO.md`

## Limitaciones

- CAC marginal no se muestra como cifra cuando falta una curva de inversión/altas exclusiva del Reto 2; se declara pendiente en vez de inventarlo.
- El PDF oficial fue localizado, pero este entorno aún no dispone de extractor PDF para contraste directo.
- Sin navegador automatizable: pendiente QA visual, responsive y de interacción manual.
- Falta convertir el plan de 90 días a edición persistente, añadir exportación/ficha de una página y preparar demo académica de tres minutos.

# Reto 2 — Growth: progreso y checkpoints

Fecha de inicio: 6 de noviembre de 2026.  
Estado: Fases 1 a 4 implementadas; ficha académica, edición persistente del plan y demo final pendientes.
Estado actualizado: Fase 5 implementada técnicamente; contraste del PDF oficial y QA visual manual pendientes.

## Fuentes y jerarquía

| Fuente | Estado | Uso |
|---|---|---|
| `Caso A - Tueste (Parte 2).pdf` | Oficial localizado | Fuente prioritaria; este entorno no tiene extractor PDF disponible, por lo que queda pendiente contrastar texto/páginas directamente. |
| `CONTEXTO_RETO_2_TUESTE.md` | Contexto derivado del PDF | Base trazable de los datos oficiales usados mientras se realiza la lectura directa del PDF. |
| `SKILL (1).md` | Skill leída | Guía de dominio, no sustituye la rúbrica ni el PDF oficial. |
| Reto 1 (`src/financial`, `src/calculations`) | Código existente | Solo se reutiliza `calculateMarginalCac` y `calculatePayback`; no se alteran sus resultados. |

No se trasladan cifras pedagógicas de Migas a Tueste. Cualquier valor de configuración futura se marcará como `PROPOSED_ASSUMPTION` o `DEMO_LOCAL`.

## Diagnóstico del repositorio

- Aplicación React 19 + Vite con CSS tradicional; no utiliza Tailwind.
- Dependencias actuales: React, React DOM y ExcelJS; no se agregaron dependencias.
- La Parte 1 contiene motor financiero, tablero, simulador de 24 meses, exportaciones y dashboard comercial DEMO.
- La suite existente estaba configurada para cálculos, finanzas y backend; se amplió para incluir `src/growth/*.test.js`.
- No se modificaron MySQL, migraciones, datos DEMO, Excel, SQL, PDF, motores ni contratos financieros existentes.

## Fase 1 — alcance y contratos

### MVP propuesto (no presentado como requisito oficial adicional)

1. Cliente DEMO recibe activación posterior a entrega, genera enlace personal y abre compartir por WhatsApp.
2. Amigo DEMO abre enlace, identifica a quien le invitó, ve beneficio aplicado y confirma una compra simulada.
3. Evento elegible actualiza progreso, historial, recompensa y aviso simulado al invitador.
4. Panel de Diego diferencia personas, invitaciones, visitas, compras y costos bajo etiqueta DEMO.

### Estados de dominio previstos

| Entidad | Estados mínimos |
|---|---|
| Conversión | `eligible`, `rejected:self_referral`, `rejected:duplicate_conversion`, `rejected:not_eligible` |
| Recompensa | `earned`, `pending`, `incurred` |
| Fuente de dato | `OFFICIAL_CASE`, `PROPOSED_ASSUMPTION`, `DEMO_LOCAL` |

### North Star y contramétricas

- **North Star propuesta:** compradores referidos válidos por cada 100 primeras compras elegibles, en una ventana declarada. La línea base oficial del caso es 6 por cada 100; una meta 6→9 es hipótesis, no resultado observado.
- **Contramétricas:** costo atribuible por referido ≤ USD 25 (pendiente verificar el fee de Parte 1 antes de congelar), contribución incremental no negativa, duplicados/autoinvitaciones, devoluciones, fraude y churn.

## Fase 2 — motor implementado

Archivo: `src/growth/growthEngine.js`.

| Función | Definición / protección |
|---|---|
| `calculateReferralFunnel` | Mantiene unidades distintas: personas, invitaciones, visitas y compradores; identifica pérdidas por tasa y por cantidad. |
| `calculateAverageCac` / `calculateReferralMarginalCac` | CAC con clientes nuevos válidos; marginal reutiliza el motor financiero existente. |
| `calculateViralCoefficient` | `proporción que invita × invitaciones por invitador × compra de amigo`. |
| `evaluateReferralConversion` | Rechaza autoinvitación, conversión no elegible y duplicados por referencia o amigo. |
| `calculateRewardCost` | Distingue valores devengados, pendientes e incurridos; calcula costo atribuible y verifica tope. |
| `projectCohortRetention` | Cohorte explícita por mes con churn constante. |
| `compareAcquisitionChannels` | Compara CAC sin declarar causalidad ni observación real. |
| `calculateGrowthPayback` | Reutiliza el payback del motor financiero; requiere contribución mensual y horizonte explícitos. |
| `evaluateIce` | Promedio de Impacto, Confianza y Facilidad, escala 1–10. |

### Datos oficiales codificados

El contrato `TUESTE_REFERRAL_CASE` conserva solamente el embudo citado en el contexto: 1.000 entregados, 350 aperturas, 120 visitas al programa, 100 invitadores, 300 invitaciones, 150 visitas de amigos y 60 compras. Sus resultados derivados son 35 %, 34,29 %, 3 invitaciones por invitador, 50 %, 40 % y 6 compradores referidos por cada 100 primeras compras elegibles.

El límite USD 25 se conserva como **derivado pendiente de verificar el fee**: `(USD 4.000 + USD 1.000) / 100 / 2`. No se utiliza todavía como hecho definitivo de producto.

## Pruebas y validación

- `src/growth/growthEngine.test.js`: embudo/unidades, CAC promedio y marginal, viralidad, cohorte/churn, payback, antifraude, costos por estado, canales e ICE.
- `npm test`: **70 aprobadas, 0 fallos**. Incluye las 64 regresiones existentes y 6 pruebas nuevas de Growth.
- `npm run build`: correcto, 46 módulos transformados. Se mantiene la advertencia no bloqueante de Vite sobre el fragmento dinámico de ExcelJS mayor de 500 kB.
- Pendiente de validación visual: no hay navegador automatizable disponible.

## Archivos modificados en este checkpoint

- `package.json`
- `src/growth/growthEngine.js` (nuevo)
- `src/growth/growthEngine.test.js` (nuevo)
- `docs/RETO_2_GROWTH_PROGRESO.md` (nuevo)

## Checkpoint Fase 3 — Tueste Rewards

- Estado DEMO local versionado, recuperable ante JSON corrupto y reiniciable.
- Enlace individual DEMO, copia y URL de intención de compartir por WhatsApp.
- Flujo verificable invitación → registro → compra simulada elegible → recompensa → historial.
- Antifraude e idempotencia: autoinvitación, duplicado, registro repetido y compra repetida bloqueados.
- Interfaz mobile-first integrada en `#tueste-rewards`; no usa MySQL ni integra pagos reales.
- Ver `RETO_2_FASE_3_TUESTE_REWARDS.md` para decisiones, límites y pasos de prueba.

## Próximo checkpoint — Fase 4

1. Panel de Diego: embudo, ciclo, economía de referidos y fuentes claramente separadas.
2. Experimentos A/B, North Star y contramétricas con datos DEMO rotulados.
3. Matriz de canales y plan propuesto de 90 días.

## Checkpoint Fase 4 — Panel de Diego

- Panel Growth integrado en `#panel-growth`, con KPIs de procedencia visible y estado compartido de Rewards.
- Embudo, ciclo, economía editable, cohortes, A/B, ICE, matriz de canales y plan de 90 días como propuestas rotuladas.
- Sin MySQL, sin cambios en Reto 1 y sin declarar resultados hipotéticos como observados.
- Ver `RETO_2_FASE_4_PANEL_GROWTH.md`.

## Checkpoint A — inspección y diagnóstico (Fase 5)

- Se preservaron los cambios existentes sin commit y no se modificó Reto 1.
- La skill de Growth mencionada en el encargo no está disponible en esta sesión.
- No se encontró el PDF oficial Parte 2; el único PDF es `entrega/tueste_business_solutions.pdf`, un entregable generado.
- Sin extractor PDF ni navegador automatizable disponibles.

## Checkpoint B — plan persistente

- CRUD completo, confirmaciones, estados, responsables, metas, métricas, `localStorage`, esquema versionado, recuperación corrupta y reset DEMO.
- Archivos: `growthPlan.js`, `growthPlan.test.js`, `GrowthPlanEditor.jsx` y estilos del panel.

## Checkpoint C — ficha y guion

- Creados `RETO_2_FICHA_GROWTH.md` y `RETO_2_GUION_DEMO_3_MINUTOS.md`.
- Datos del caso, derivados, supuestos y DEMO se distinguen explícitamente.

## Checkpoint D — auditoría y matriz

- Creada `RETO_2_MATRIZ_CUMPLIMIENTO.md`.
- Reglas dependientes del PDF permanecen parciales o no verificables; no se inventó cumplimiento.

## Checkpoint E — pruebas, build y visual

- Pruebas/build: ejecución final registrada — 83 pruebas aprobadas y build exitoso.
- QA visual: Rewards y Panel Growth renderizados con frontend y backend activos; ancho estrecho efectivo de 450 px sin desbordamiento horizontal. La resolución física 375 × 812 no fue simulada por el navegador integrado.

## Checkpoint F — documentación y cierre

- Creados checklist final y reporte de cierre.
- Estado recomendado: listo para demo técnica, condicionado para entrega final por PDF oficial y QA visual.

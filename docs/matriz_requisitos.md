# Matriz de requisitos académicos oficiales

## Enunciado y rúbrica

Enunciado oficial aportado: **“Primer Postejercicio — Business Solutions:
Mercadeo comercial en una empresa de servicios”**. La evaluación contiene cinco
criterios de 20 % y tres entregables: PDF académico, SQL con DDL/DML/consultas y
capturas de ejecución/resultados.

| Criterio oficial | Peso | Evidencia | Estado | Acción necesaria |
|---|---:|---|---|---|
| Análisis comercial e identificación de entidades | 20 % | Modelo comercial, fichas de 36 entidades y documento académico | Completo | Completar portada y revisar redacción final. |
| Diagrama ER con cardinalidades y tablas intermedias | 20 % | Fuente Mermaid y exportaciones SVG/PNG con cuatro intermedias destacadas | Completo | Insertar la versión SVG/PNG en el PDF. |
| Script SQL con integridad, restricciones y 3FN | 20 % | SQL consolidado ejecutado: 36 PK, 51 FK, 25 UNIQUE y 51 CHECK | Completo | Adjuntar captura real de ejecución. |
| Datos ficticios y consultas de métricas | 20 % | 514 registros y consultas ejecutables con resultados reconciliados | Completo | Adjuntar capturas de consultas obligatorias. |
| Agentes, orquestador, diagrama y flujo | 20 % | Siete fichas, orquestador, diagrama, contratos y caso de diez pasos | Completo | Mantener la etiqueta de arquitectura propuesta. |

Los estados siguientes detallan evidencias complementarias.

Estados: **completo** = evidencia suficiente en el alcance documentado;
**parcial** = existe diseño o demostración, pero falta una parte relevante;
**pendiente** = no está realizado; **no verificable** = falta la fuente que
define el criterio.

| Requisito académico provisional | Evidencia existente | Archivo o componente | Estado | Acción necesaria |
|---|---|---|---|---|
| Enunciado y rúbrica oficial | Título, cinco criterios de 20 % y tres entregables aportados por el usuario. | Este documento y `entrega_academica.md` | Completo | Adjuntar copia oficial si el profesor entregó un PDF o aula virtual. |
| Definir a Tueste como servicio de suscripción para hogares y empresas | Alcance, segmentos, planes, suscripciones y recurrencia documentados. | `database/modelo_comercial_propuesto.md`, `subscription_plans`, `subscriptions` | Completo | Confirmar que esta definición coincide con la consigna oficial. |
| CRM de contactos y clientes | Contactos, leads, oportunidades, suscripciones y API de consulta; no hay CRUD ni CRM externo. | `contacts`, `leads`, `sales_opportunities`, `/api/commercial/customers` | Parcial | Aclarar si el requisito exige solo diseño/demostración o un CRM operativo. |
| Recorrido del cliente | Cinco etapas y 32 touchpoints DEMO con origen y cronología. No existe endpoint/pantalla específica del recorrido completo. | `customer_journey_stages`, `customer_touchpoints`, consulta SQL 12 | Parcial | Capturar la consulta 12 y, si la rúbrica exige UI, documentar la ausencia. |
| Embudo de ventas | Etapas, 43 movimientos, conversiones, oportunidades y vista React. | `sales_funnel_stages`, `lead_stage_history`, `/api/commercial/funnel`, sección Embudo | Completo | Obtener captura real y anexar resultado de conversiones. |
| Marketing y campañas | Canales, diez campañas, métricas diarias, atribución y dashboard. | `marketing_channels`, `campaigns`, `campaign_daily_metrics`, `/api/commercial/campaigns` | Completo | Obtener captura de campañas y declarar que los datos son DEMO. |
| Presupuestos y gasto | Presupuesto planificado separado de medios y otros costos; consulta comparativa. | `campaigns.planned_budget_usd`, `campaign_daily_metrics`, consulta SQL 3 | Completo | Capturar consulta y explicar que presupuesto no es gasto ejecutado. |
| Contenidos y calendario | Piezas, fechas programadas/publicadas y canales; pantalla de consulta. No existe calendario gráfico ni edición. | `content_items`, `content_channels`, `/api/commercial/contents` | Parcial | Aclarar alcance; capturar listado y calendario lógico en datos. |
| Revisión y aprobaciones | Historial de 12 revisiones, estados aprobados/rechazados y reglas `CHECK`; solo lectura en API. | `content_reviews`, `content_items.status`, migración comercial | Parcial | Demostrar datos y restricciones; no afirmar workflow de aprobación funcional. |
| Traspaso marketing–ventas | 12 handoffs, seguimientos, decisiones y pantalla/API. | `marketing_sales_handoffs`, `handoff_followups`, `/api/commercial/handoffs` | Completo | Capturar aceptado, rechazado y pendiente. |
| Suscripciones, pedidos y entregas | Diez suscripciones, 24 pedidos, 24 entregas y eventos DEMO. | `subscriptions`, `subscription_orders`, `deliveries`, `subscription_events` | Completo | Obtener captura de clientes/suscripciones y consulta de pedidos. |
| Modelo relacional ampliado | 12 tablas originales + 24 comerciales; 36 en DEMO, 51 FK y 51 `CHECK`. | `schema_actual.sql`, `migracion_comercial_propuesta.sql`, prueba aislada documentada | Completo | Incorporar diagrama ER renderizado y captura del esquema MySQL. |
| Tercera forma normal | Catálogos, hechos, historiales y N:M separados; excepciones de estado explicadas. | `modelo_comercial_propuesto.md`, sección 3FN | Completo | Incluir ejemplos de dependencias y excepciones en defensa oral. |
| Datos ficticios mínimos | 514 registros; mínimos conservadores de 5/10 validados. | `datos_ficticios_tueste.sql`, `validacion_datos_ficticios.md` | Completo | Adjuntar tabla de conteos y remarcar que no son datos reales. |
| Consultas SQL académicas | 16 consultas ejecutadas y documentadas. | `consultas_metricas_propuestas.sql`, `resultados_metricas_demo.md` | Completo | Capturar ejecución de consultas clave en MySQL. |
| CPC y CTR | CPC global USD 0,720588 y CTR 2,697 %, confirmados por API y sumas canónicas. | consultas 1–2, `/api/commercial/campaigns` | Completo | Mantener los valores corregidos; descartar los valores antiguos multiplicados. |
| CAC, ROAS, conversiones, ciclo y ticket | CAC USD 793,50; ROAS 0,152762; conversión 83,33 %; ciclo 9,2841 días; ticket USD 51,036364. | consultas 4–11 y API comercial | Completo | Adjuntar evidencia de consulta/API y fórmulas. |
| Métricas financieras completas | Margen/LTV/flujo son parciales; LTV/CAC, payback y flujo completo carecen de entradas. | consultas 14–16, `financial-status`, `financialEngine.js` | Pendiente | No completar sin comisión, caja, impuestos pagados, CAPEX, deuda y fechas de pago. |
| API Express | 22 endpoints `GET`, pruebas y modo DEMO explícito. | `backend/app.js`, `backend/app.test.js` | Completo | Capturar `/api/health` y dos respuestas comerciales. |
| Aplicación React DEMO | Siete secciones, estados de carga/error y etiqueta DEMO permanente. | `CommercialDashboard.jsx`, `App.jsx`, `Sidebar.jsx` | Completo | Obtener capturas reales en escritorio y móvil. |
| Motor financiero independiente | Funciones y pruebas existentes; la interfaz no presenta métricas incompletas como completas. | `financialEngine.js`, pruebas de cálculo | Completo | Adjuntar salida de pruebas y explicar separación respecto de analítica DEMO. |
| Siete agentes especializados | Fichas completas, permisos, tablas, endpoints, límites y ejemplos. Son diseño, no implementación. | `docs/fichas_agentes.md` | Completo | Mantener la etiqueta “propuesta académica”. |
| Agente orquestador | Coordinación central, contratos, aprobación y política de escritura documentados. | `docs/orquestador.md` | Completo | Presentar secuencia y límites; no afirmar runtime funcional. |
| Caso multiagente completo | Diez pasos desde campaña hasta evaluación. | `docs/flujo_ejemplo_agentes.md` | Completo | Incluirlo como caso propuesto, no ejecución real. |
| Diagrama ER | Fuente Mermaid y SVG/PNG con 36 tablas, cardinalidades y N:M destacadas. | `database/diagrama_er_comercial.mmd`, `entrega/diagramas/` | Completo | Insertar en PDF y capturar la vista final. |
| Diagrama de arquitectura de agentes | Fuente y SVG/PNG distinguen existente, propuesto, externo y aprobación. | `docs/diagrama_arquitectura_agentes.mmd`, `entrega/diagramas/` | Completo | Insertar en PDF. |
| Bibliografía verificable | No hay fuentes académicas externas registradas. | Inventario documental | Pendiente | El estudiante debe aportar fuentes verificadas y formato bibliográfico requerido. |
| Evidencias visuales | La app/API están disponibles, pero no hay capturas guardadas. | `docs/checklist_evidencias.md` | Pendiente | Tomar capturas reales, fecharlas y referenciarlas en anexos. |

## Resumen provisional

- Completos: 21.
- Parciales: 4.
- Pendientes: 3.
- No verificables: 0.


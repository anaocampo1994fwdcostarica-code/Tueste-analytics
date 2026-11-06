# Flujo ejemplo: campaña digital para suscriptores empresariales

## Supuesto del caso

Tueste desea captar nuevas empresas para un servicio recurrente de café. El caso
describe el comportamiento de la arquitectura **propuesta**; no se ejecutó una
campaña real ni existen agentes funcionales. Cada coordinación pasa por el
orquestador.

## Participantes y contratos

- Usuario humano: define objetivo y aprueba decisiones con impacto.
- Orquestador: divide, valida, solicita aprobaciones y consolida.
- Agentes especializados: producen análisis o borradores dentro de su dominio.
- Express/MySQL: fuentes actuales de solo lectura.
- Herramientas externas: propuestas, no conectadas actualmente.

## 1. Planificación de campaña

**Responsable:** Agente de campañas y publicidad.

El usuario entrega al orquestador segmento empresarial, periodo, objetivo y tope
de presupuesto. El orquestador consulta el resumen y encarga un plan. El agente
revisa `marketing_channels`, `campaigns`, `campaign_daily_metrics` y, como
referencia no solapada, `advertising_acquisition_history` mediante
`GET /api/commercial/channels`, `GET /api/commercial/campaigns` y
`GET /api/commercial/summary`.

**Intercambio:** brief → propuesta de canal, fechas, presupuesto y KPI. El
agente no promete conversiones históricas ni inventa honorarios.

**Aprobación:** una persona aprueba objetivo, presupuesto y fechas. Sin esta
aprobación no puede proponerse crear el registro futuro en `campaigns`.

## 2. Elaboración de contenidos

**Responsable:** Agente de contenidos y calendario editorial.

El orquestador transforma el plan aprobado en un brief y lo entrega a Contenido.
El agente consulta `campaigns`, `marketing_channels`, `products`,
`commercial_offers`, `content_items` y `content_channels` usando las rutas
`GET /api/commercial/campaigns`, `GET /api/commercial/channels`,
`GET /api/products`, `GET /api/offers` y `GET /api/commercial/contents`.

**Intercambio:** plan aprobado → calendario, borradores de anuncio, publicación,
correo y landing page, con canal y fecha.

**Aprobación:** el responsable de marketing aprueba el brief y el calendario.
Una implementación futura podría persistir borradores en `content_items` y
`content_channels`, pero no publicarlos.

## 3. Revisión y aprobación

**Responsable:** Agente de revisión y aprobaciones.

Contenido devuelve cada borrador al orquestador. El orquestador crea una tarea
separada para Revisión, que consulta `content_items`, `content_channels`,
`content_reviews`, `commercial_offers` y `products` mediante
`GET /api/commercial/contents`, `GET /api/offers` y `GET /api/products`.

**Intercambio:** pieza y criterios → dictamen con evidencia y acción propuesta.

**Aprobación:** un revisor humano decide aprobación, rechazo o cambios. El agente
no aprueba su propia recomendación. En el futuro, `content_reviews` y
`content_items.status` se actualizarían atómicamente.

## 4. Publicación

**Responsable:** Agente de contenidos, después de autorización; ejecución por una
herramienta externa propuesta.

El orquestador verifica que exista aprobación vigente y que la versión aprobada
sea la que se publicará. Contenido prepara el paquete para la plataforma.

**Tablas:** `content_items`, `content_channels`, `content_reviews`, `campaigns`.

**Intercambio:** versión aprobada → vista previa → confirmación humana → orden
acotada de publicación.

**Aprobación:** obligatoria inmediatamente antes de publicar. El resultado
externo se validaría antes de marcar `content_items.status='published'` y asignar
`published_at`.

## 5. Captación de leads

**Responsable:** Agente de embudo y seguimiento de leads.

Las plataformas externas futuras producirían interacciones. Un servicio de
ingesta validaría y deduplicaría antes de crear `contacts`,
`customer_touchpoints` y `leads`. El agente consulta el estado mediante
`GET /api/commercial/customers` y `GET /api/commercial/funnel`.

**Tablas:** `contacts`, `customer_journey_stages`, `customer_touchpoints`,
`leads`, `campaigns`, `marketing_channels`.

**Intercambio:** formulario/interacción → contacto normalizado, origen y lead
propuesto.

**Aprobación:** las reglas de privacidad y consentimiento deben estar aprobadas;
una coincidencia incierta de contacto requiere resolución humana.

## 6. Calificación

**Responsable:** Agente de embudo y seguimiento de leads.

El agente resume empresa, necesidad, fuente, touchpoints y etapa; propone avanzar
o descartar. Consulta `leads`, `lead_stage_history`, `sales_funnel_stages`,
`customer_touchpoints` y `sales_opportunities` por
`GET /api/commercial/funnel`, `GET /api/commercial/conversions`,
`GET /api/commercial/opportunities` y `GET /api/commercial/customers`.

**Intercambio:** evidencia del lead → prioridad, etapa y siguiente acción.

**Aprobación:** marketing confirma cambio de etapa, descarte o creación de
oportunidad. Debe quedar una sola etapa abierta en `lead_stage_history`.

## 7. Traspaso a ventas

**Responsable:** Agente de traspaso entre mercadeo y ventas.

El orquestador entrega únicamente leads calificados. Handoff prepara contexto,
responsables, oportunidad, fuente y razón de calificación, consultando
`marketing_sales_handoffs`, `handoff_followups`, `leads`,
`lead_stage_history`, `sales_opportunities` y `team_members` mediante
`GET /api/commercial/handoffs`, `GET /api/commercial/opportunities` y
`GET /api/commercial/funnel`.

**Intercambio:** expediente de marketing → entrega pendiente → decisión de
ventas.

**Aprobaciones:** marketing autoriza entrega; ventas acepta o rechaza. El rechazo
requiere motivo y fecha; el agente no decide por ventas.

## 8. Conversión a suscripción

**Responsable:** Agente de suscripciones y clientes.

Después de cierre ganado, el orquestador entrega contacto, plan solicitado y
oportunidad. El agente compara `subscription_plans`, `commercial_offers`,
`offer_products`, `products` y `subscription_parameters`; consulta
`GET /api/commercial/subscriptions`, `GET /api/commercial/customers`,
`GET /api/products` y `GET /api/offers`.

**Intercambio:** oportunidad ganada → propuesta de plan, frecuencia y productos
→ aceptación del cliente.

**Aprobaciones:** ventas confirma condiciones y el cliente acepta. Cobro y alta
requieren autorización explícita. Una implementación futura escribiría
`subscriptions`, `subscription_items` y `subscription_events` mediante una
transacción; no directamente por el agente.

## 9. Seguimiento comercial

**Responsables:** Suscripciones y Embudo, coordinados exclusivamente por el
orquestador.

Suscripciones revisa `subscription_orders`, `subscription_order_items`,
`deliveries`, `subscription_events` y `subscriptions` mediante
`GET /api/commercial/orders` y `GET /api/commercial/subscriptions`. Si existe una incidencia comercial,
devuelve un informe al orquestador; este decide si crea una tarea independiente
para Embudo o Handoff.

**Intercambio:** estado de pedido/entrega/evento → alerta y acción sugerida.

**Aprobaciones:** renovación contractual, cambio de plan, pausa, cancelación,
reembolso y contacto externo.

## 10. Evaluación de resultados

**Responsable:** Agente de analítica comercial y financiera.

El orquestador fija periodo y campaña. Analítica consulta
`campaign_daily_metrics`, `campaign_attributions`, `lead_stage_history`,
`sales_opportunities`, `subscriptions` y `subscription_orders` mediante
`GET /api/commercial/campaigns`, `GET /api/commercial/channels`,
`GET /api/commercial/conversions`, `GET /api/commercial/opportunities`,
`GET /api/commercial/summary`, `GET /api/commercial/ticket-average` y
`GET /api/commercial/financial-status`.

**Fórmulas:**

- CPC = gasto de medios / clics.
- CTR = clics / impresiones.
- CAC = (medios + otros costos) / suscripciones atribuidas distintas.
- ROAS = ingreso reconocido atribuido / gasto de medios.
- Conversión = leads que llegan al destino / entradas en origen.

**Intercambio:** hechos agregados → informe con fórmula, periodo, resultados,
limitaciones y recomendación condicionada.

**Aprobación:** cualquier cambio de presupuesto o publicación externa del
informe. Si faltan comisión de pago, caja, impuestos pagados, CAPEX, deuda o
calendario de cobros/pagos, el orquestador debe declarar margen/LTV/flujo como
parcial y payback o flujo completo como información insuficiente.

## Resultado consolidado

El orquestador presenta al usuario un único expediente: plan aprobado, piezas y
dictámenes, captación y conversiones, decisiones de handoff, suscripciones e
indicadores. Distingue explícitamente datos, supuestos y decisiones humanas. No
permite que un resultado analítico autorice automáticamente la siguiente acción.


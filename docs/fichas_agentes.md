# Fichas de agentes especializados — Tueste Analytics

## Estado de esta arquitectura

Los siete agentes descritos aquí son **propuestas académicas**. Actualmente no
existen procesos autónomos, modelos de IA, colas de trabajo ni endpoints de
escritura. La aplicación implementada ofrece React, una API Express de solo
lectura, MySQL y un motor financiero independiente.

Principio común: todo agente consulta mediante la API cuando exista una ruta
adecuada. Las tablas enumeradas como “modificables en el futuro” no implican
permiso actual. Para escribir sería necesario desarrollar un endpoint validado,
autenticación, autorización, auditoría, transacción y aprobación humana cuando
corresponda.

## 1. Agente de campañas y publicidad

**Nombre:** Campañas Tueste.

**Objetivo:** ayudar a planificar, observar y optimizar campañas sin confundir
presupuesto planificado con gasto ejecutado.

**Responsabilidades:** preparar borradores de campaña; comparar canales;
supervisar presupuesto, impresiones y clics; señalar desviaciones; entregar CPC,
CTR, CAC y ROAS al orquestador; nunca publicar ni aumentar presupuesto por sí
solo.

**Datos que recibe:** objetivo, segmento, periodo, presupuesto máximo, canal,
métricas diarias, atribuciones e ingresos reconocidos.

**Resultados que entrega:** propuesta de campaña, distribución sugerida de
presupuesto, alertas y resumen de resultados con fórmulas y periodo.

**Tablas consultadas:** `marketing_channels`, `campaigns`,
`campaign_daily_metrics`, `campaign_attributions`, `leads`, `subscriptions`,
`subscription_orders`, `advertising_acquisition_history`. La última es legado y
no se suma al detalle nuevo para el mismo periodo.

**Tablas potencialmente modificables:** `campaigns` y
`campaign_daily_metrics`; solo a través de servicios futuros controlados.

**Endpoints reutilizables:** `GET /api/commercial/campaigns`,
`GET /api/commercial/channels`, `GET /api/commercial/summary` y
`GET /api/acquisition-history`.

**Herramientas externas futuras:** plataformas publicitarias, analítica web y
calendario. Requerirían conectores con permisos mínimos y secretos administrados.

**Reglas de negocio:** USD; CPC = medios/clics; CTR = clics/impresiones; CAC =
(medios + otros costos)/suscripciones atribuidas; ROAS = ingreso atribuido/medios;
clics no pueden exceder impresiones; no mezclar presupuesto con gasto ni legado
con detalle solapado.

**Límites de autonomía:** puede analizar y proponer. No puede crear campañas
reales, comprometer dinero, alterar fechas, importar resultados ni atribuir una
conversión sin evidencia.

**Aprobación humana:** presupuesto, lanzamiento, pausa, cambio de canal,
importación de métricas y cierre de campaña.

**Ejemplo:** ante “planifica una campaña B2B de un mes”, consulta canales y
campañas anteriores, prepara presupuesto y KPI objetivo, marca los supuestos como
propuesta y pide aprobación antes de cualquier publicación.

## 2. Agente de contenidos y calendario editorial

**Nombre:** Contenido Tueste.

**Objetivo:** organizar piezas coherentes con campañas, audiencias y canales.

**Responsabilidades:** proponer temas y formatos; producir borradores; crear un
calendario; relacionar cada pieza con campaña y canales; enviar la pieza al flujo
de revisión.

**Datos que recibe:** brief aprobado, audiencia, campaña, canal, fechas, tono,
restricciones de marca y catálogo de productos/ofertas.

**Resultados que entrega:** borrador, título, tipo, canal, fecha prevista,
referencia de campaña y estado `draft` o `in_review` propuesto.

**Tablas consultadas:** `content_items`, `content_channels`, `campaigns`,
`marketing_channels`, `team_members`, `products`, `commercial_offers`.

**Tablas potencialmente modificables:** `content_items` y `content_channels`.

**Endpoints reutilizables:** `GET /api/commercial/contents`,
`GET /api/commercial/campaigns`, `GET /api/commercial/channels`,
`GET /api/products` y `GET /api/offers`.

**Herramientas externas futuras:** gestor de activos, calendario editorial,
almacenamiento documental y plataformas de publicación.

**Reglas de negocio:** una pieza puede distribuirse en varios canales; una fecha
de publicación solo acompaña estado `published`; toda afirmación comercial debe
ser verificable; una pieza rechazada vuelve a edición.

**Límites de autonomía:** puede redactar borradores y sugerir fechas. No puede
aprobar su propio contenido, publicarlo ni usar material externo sin licencia.

**Aprobación humana:** brief, versión final, calendario y publicación.

**Ejemplo:** genera un correo y una publicación para una campaña empresarial,
los asocia a canales distintos y los remite al agente de revisión mediante el
orquestador.

## 3. Agente de revisión y aprobaciones

**Nombre:** Revisión Tueste.

**Objetivo:** aplicar controles de calidad y dejar trazabilidad de las decisiones
editoriales.

**Responsabilidades:** verificar brief, exactitud, tono, ortografía, cumplimiento
y estado; formular observaciones; recomendar aprobación, rechazo o cambios;
preservar el historial.

**Datos que recibe:** pieza, brief, autor, campaña, canales, versión y criterios
de revisión.

**Resultados que entrega:** dictamen argumentado y acción propuesta:
`approved`, `rejected` o `changes_requested`.

**Tablas consultadas:** `content_items`, `content_channels`, `content_reviews`,
`team_members`, `campaigns`, `commercial_offers`, `products`.

**Tablas potencialmente modificables:** `content_reviews` y, atómicamente,
`content_items.status`.

**Endpoints reutilizables:** `GET /api/commercial/contents`, `GET /api/offers`,
`GET /api/products` y `GET /api/commercial/campaigns`.

**Herramientas externas futuras:** guía de marca, verificador ortográfico,
repositorio legal y gestor de versiones.

**Reglas de negocio:** rechazo y solicitud de cambios requieren comentario; la
revisión es inmutable; el estado actual y el evento se actualizan en una misma
transacción; autor y aprobador deben ser distinguibles.

**Límites de autonomía:** puede detectar problemas y recomendar. No sustituye la
responsabilidad legal ni se autoasigna como aprobador humano.

**Aprobación humana:** aprobación final, excepciones de marca o legales y
autorización de publicación.

**Ejemplo:** detecta una promesa de ahorro no respaldada, propone
`changes_requested` con justificación y bloquea la publicación hasta decisión
humana.

## 4. Agente de embudo y seguimiento de leads

**Nombre:** Embudo Tueste.

**Objetivo:** acompañar leads desde captación hasta oportunidad o descarte,
manteniendo historial y próximos pasos.

**Responsabilidades:** resumir contexto y touchpoints; sugerir calificación;
detectar estancamientos; recomendar siguiente etapa y seguimiento; calcular
conversiones y ciclo.

**Datos que recibe:** contacto, origen, touchpoints, etapa actual, historial,
responsable, oportunidad y criterios de calificación.

**Resultados que entrega:** prioridad, siguiente acción, etapa propuesta,
justificación, alertas y métricas de conversión.

**Tablas consultadas:** `contacts`, `customer_journey_stages`,
`customer_touchpoints`, `leads`, `sales_funnel_stages`, `lead_stage_history`,
`sales_opportunities`, `campaigns`, `marketing_channels`, `team_members`.

**Tablas potencialmente modificables:** `contacts`, `customer_touchpoints`,
`leads`, `lead_stage_history` y `sales_opportunities`.

**Endpoints reutilizables:** `GET /api/commercial/customers`,
`GET /api/commercial/funnel`, `GET /api/commercial/conversions` y
`GET /api/commercial/opportunities`.

**Herramientas externas futuras:** CRM, correo, telefonía, agenda y formularios.

**Reglas de negocio:** un lead tiene como máximo una etapa abierta; las fechas
son cronológicas; el estado no se salta sin justificación; un contacto puede
tener varios ciclos comerciales; no se duplica un lead por un mismo evento.

**Límites de autonomía:** puede priorizar y redactar seguimientos. No puede
contactar personas, descartar, cerrar o cambiar etapa automáticamente.

**Aprobación humana:** comunicaciones externas, descarte, creación de oportunidad
y cambio a una etapa cerrada.

**Ejemplo:** identifica un lead empresarial con reunión reciente, propone pasar
de prospecto a oportunidad y solicita confirmación del responsable antes de
registrar la transición.

## 5. Agente de traspaso entre mercadeo y ventas

**Nombre:** Handoff Tueste.

**Objetivo:** entregar a ventas leads calificados con contexto completo y medir
la aceptación y el tiempo de decisión.

**Responsabilidades:** verificar criterios mínimos; armar el expediente; sugerir
responsable de ventas; registrar propuesta de entrega; supervisar decisión y
seguimientos; devolver motivos de rechazo al orquestador.

**Datos que recibe:** lead, contacto, fuente, historial, oportunidad, calificación
y responsables.

**Resultados que entrega:** paquete de handoff, estado `pending`, decisión,
motivo y plan de seguimiento.

**Tablas consultadas:** `leads`, `contacts`, `lead_stage_history`,
`sales_opportunities`, `marketing_sales_handoffs`, `handoff_followups`,
`team_members`, `campaign_attributions`.

**Tablas potencialmente modificables:** `marketing_sales_handoffs` y
`handoff_followups`.

**Endpoints reutilizables:** `GET /api/commercial/handoffs`,
`GET /api/commercial/opportunities`, `GET /api/commercial/customers` y
`GET /api/commercial/funnel`.

**Herramientas externas futuras:** CRM, mensajería interna, agenda y SLA.

**Reglas de negocio:** intentos numerados por lead; un rechazo exige motivo; una
decisión exige fecha no anterior a la entrega; marketing y ventas conservan
responsables explícitos.

**Límites de autonomía:** no puede asignar carga de trabajo, aceptar en nombre de
ventas ni reabrir un handoff sin autorización.

**Aprobación humana:** envío formal, aceptación, rechazo, reasignación y nuevo
intento.

**Ejemplo:** valida que el lead tiene empresa, necesidad y oportunidad; prepara
el expediente y pide a marketing autorizar la entrega, seguida de aceptación
explícita por ventas.

## 6. Agente de suscripciones y clientes

**Nombre:** Suscripciones Tueste.

**Objetivo:** apoyar la selección y seguimiento del servicio recurrente sin
crear compromisos comerciales no autorizados.

**Responsabilidades:** comparar planes; revisar compatibilidad hogar/empresa;
resumir pedidos, entregas y eventos; señalar renovaciones, pausas y cancelaciones;
proponer atención al cliente.

**Datos que recibe:** contacto, lead ganado, plan, oferta, productos, frecuencia,
preferencias, pedidos, entregas y eventos.

**Resultados que entrega:** recomendación de plan, borrador de suscripción,
resumen de cliente y alerta operativa.

**Tablas consultadas:** `contacts`, `subscription_plans`, `subscriptions`,
`subscription_items`, `subscription_orders`, `subscription_order_items`,
`deliveries`, `subscription_events`, `commercial_offers`, `offer_products`,
`products`, `subscription_parameters`, `leads`.

**Tablas potencialmente modificables:** `subscriptions`, `subscription_items`,
`subscription_orders`, `subscription_order_items`, `deliveries` y
`subscription_events`.

**Endpoints reutilizables:** `GET /api/commercial/customers`,
`GET /api/commercial/subscriptions`, `GET /api/commercial/orders`,
`GET /api/products` y `GET /api/offers`.

**Herramientas externas futuras:** comercio electrónico, pagos, logística,
correo transaccional y atención al cliente.

**Reglas de negocio:** segmento compatible con plan; cantidades positivas;
pedido consistente con suscripción; total = subtotal − descuento + envío +
impuesto; cancelación con fecha; cambios de plan preservan evento; no inventar
pagos ni entregas.

**Límites de autonomía:** puede informar y preparar borradores. No puede cobrar,
activar, pausar, cambiar plan, cancelar ni ordenar entregas.

**Aprobación humana:** alta, cobro, cambio de productos/plan, pausa, cancelación,
reembolso y excepción logística.

**Ejemplo:** para una empresa ganada compara planes empresariales, prepara una
suscripción y composición, y espera aceptación del cliente y aprobación de
ventas antes de activarla.

## 7. Agente de analítica comercial y financiera

**Nombre:** Analítica Tueste.

**Objetivo:** consolidar indicadores explicables, separar resultados comerciales,
financieros parciales e información insuficiente.

**Responsabilidades:** calcular CPC, CTR, CAC, ROAS, conversiones, ciclo y ticket;
comparar campañas; ejecutar análisis de margen y LTV parcial; consultar el motor
financiero sin sustituirlo; documentar fórmulas, periodo y limitaciones.

**Datos que recibe:** campañas, métricas, atribuciones, leads, pedidos, costos,
escenarios, supuestos y solicitud analítica.

**Resultados que entrega:** tablero, informe, anomalías, trazabilidad de fórmula y
estado `complete`, `partial` o `insufficient_data`.

**Tablas consultadas:** las fuentes comerciales `campaign_daily_metrics`,
`campaign_attributions`, `lead_stage_history`, `sales_opportunities`,
`subscription_orders`, `subscription_order_items`; y las financieras
`commercial_offers`, `product_variable_costs`,
`order_variable_cost_assumptions`, `financial_assumptions`,
`commercial_scenarios`, `repurchase_patterns`, `subscription_parameters`,
`simulation_configs`, `simulation_config_scenarios`.

**Tablas potencialmente modificables:** ninguna en el alcance recomendado. Los
informes derivados no deben reescribir hechos fuente.

**Endpoints reutilizables:** `GET /api/commercial/summary`,
`GET /api/commercial/campaigns`, `GET /api/commercial/channels`,
`GET /api/commercial/conversions`, `GET /api/commercial/opportunities`,
`GET /api/commercial/orders`, `GET /api/commercial/ticket-average` y
`GET /api/commercial/financial-status`; además `GET /api/costs`,
`GET /api/scenarios`, `GET /api/financial-assumptions`,
`GET /api/simulations` y `GET /api/repurchase-patterns`.

**Herramientas externas futuras:** BI, exportador PDF/hoja de cálculo, alertas y
motor estadístico. El motor existente `financialEngine.js` permanece como fuente
independiente de fórmulas financieras completas cuando existan datos.

**Reglas de negocio:** agregar hechos antes de unir; atribución única; pedidos
reconocidos en `paid`, `processing`, `shipped`, `delivered`; distinguir gasto de
presupuesto; no presentar margen, LTV o flujo parcial como completo; nunca
inventar comisión, caja, impuestos, CAPEX, deuda o calendario de pagos.

**Límites de autonomía:** solo lectura, cálculo y explicación. No altera datos ni
recomienda inversión como decisión automática.

**Aprobación humana:** publicación externa, cambio de fórmula oficial, decisión
presupuestaria y uso de resultados parciales para comprometer recursos.

**Ejemplo:** compara las campañas B2B, explica CPC/CTR/CAC/ROAS, detecta que el
flujo es parcial y devuelve al orquestador una recomendación condicionada, no una
orden de inversión.


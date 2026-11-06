# Modelo comercial propuesto para Tueste Analytics

## 1. Alcance y decisión empresarial

Tueste se modela como una **empresa de servicios de suscripción de café para hogares y empresas**. El producto físico es un componente del servicio recurrente; la relación comercial principal comprende captación, calificación, suscripción, entregas, renovaciones y cancelaciones.

Esta propuesta es únicamente de diseño. No modifica las 12 tablas instaladas ni ejecuta migraciones o cargas de datos.

## 2. Principios del diseño

- Extensión aditiva: se conservan las 12 tablas actuales.
- Tercera forma normal: catálogos, hechos y relaciones N:M se separan.
- Un solo origen por métrica: las métricas operativas nuevas se calculan desde hechos detallados.
- Importes en USD y porcentajes como fracciones entre `0` y `1`.
- Los indicadores derivados (CPC, CTR, CAC, ROAS y conversiones) no se almacenan.
- Los valores de pedidos se guardan como instantáneas históricas; no se recalculan con precios futuros.
- Estados y fechas conservan trazabilidad mediante tablas de historial cuando el proceso lo requiere.

## 3. Tablas actuales que se reutilizan

| Tabla | Uso en el modelo ampliado |
|---|---|
| `products` | Café y productos incluidos en ofertas, suscripciones y pedidos. |
| `commercial_offers` | Oferta comercial y precio base que respalda un plan. |
| `offer_products` | Composición predeterminada de la oferta. |
| `product_variable_costs` | Costos variables vigentes conocidos por producto. |
| `order_variable_cost_assumptions` | Supuestos de envío, procesamiento y otros costos. |
| `financial_assumptions` | Costos fijos y horizonte de simulación. |
| `advertising_acquisition_history` | Resumen histórico legado. No se mezcla con hechos nuevos en una misma consulta. |
| `commercial_scenarios` | Escenarios financieros asociados a ofertas. |
| `repurchase_patterns` | Supuestos de recompra del motor financiero. |
| `subscription_parameters` | Supuestos financieros de precio, churn y costo de suscripción. |
| `simulation_configs` | Configuración de simulaciones. |
| `simulation_config_scenarios` | Escenarios incluidos en una simulación. |

`advertising_acquisition_history` permanecerá como resumen importado o legado. Las consultas académicas nuevas usarán `campaign_daily_metrics`, `campaign_attributions` y pedidos. Si se carga un período en el modelo detallado, ese mismo período no debe agregarse además desde la tabla histórica.

## 4. Entidades nuevas propuestas

Se proponen **24 tablas nuevas**.

### 4.1 Responsables, canales y campañas

#### `team_members`

Personas responsables de mercadeo, ventas, contenido y aprobaciones.

- Atributos: nombre, correo único, departamento y estado activo.
- Justificación: evita repetir nombres de responsables y permite trazabilidad.

#### `marketing_channels`

Catálogo normalizado de canales orgánicos, pagados, referidos y directos.

- Atributos: código único, nombre, tipo y estado activo.
- Justificación: sustituye texto libre en los nuevos procesos y permite agrupar métricas.

#### `campaigns`

Campañas de captación asociadas a un canal.

- Atributos: nombre, objetivo, canal, presupuesto planificado, período y estado.
- Relación: N:1 con `marketing_channels`.

#### `campaign_daily_metrics`

Hechos diarios de ejecución publicitaria.

- Atributos: gasto en medios, otros costos de mercadeo, impresiones y clics.
- Relación: N:1 con `campaigns`.
- Unicidad: una fila por campaña y fecha.
- Justificación: permite CPC, CTR, presupuesto ejecutado y CAC sin guardar indicadores derivados.

### 4.2 Recorrido del cliente y embudo

#### `contacts`

Hogares o empresas que pueden convertirse en clientes.

- Atributos: tipo de cliente, nombre, apellido, empresa, correo, teléfono y fecha de creación.
- Una restricción valida que un contacto empresarial tenga nombre de empresa.

#### `customer_journey_stages`

Catálogo ordenado del recorrido: conciencia, consideración, decisión, retención y recomendación.

#### `customer_touchpoints`

Interacciones cronológicas del contacto.

- Atributos: contacto, etapa del recorrido, campaña o canal directo, tipo, fecha y notas.
- Exactamente uno de `campaign_id` o `channel_id` identifica el origen; esto evita duplicar el canal ya determinado por una campaña.

#### `sales_funnel_stages`

Catálogo ordenado del embudo: lead, prospecto, oportunidad, cierre y descartado.

#### `leads`

Proceso comercial iniciado para un contacto.

- Atributos: contacto, fuente de captación, propietario de mercadeo, fecha y estado.
- Una persona puede tener más de un ciclo comercial en momentos diferentes.

#### `lead_stage_history`

Historial de transiciones del embudo.

- Atributos: lead, etapa, responsable, fecha de entrada y salida.
- Una clave generada y única permite como máximo una etapa abierta por lead.
- El estado actual se obtiene de la fila sin fecha de salida; no se duplica en `leads`.

#### `sales_opportunities`

Información comercial propia de la etapa de oportunidad/cierre.

- Atributos: lead único, valor esperado, estado, fechas y valor ganado.
- Justificación: permite ciclo de venta y separa una oportunidad de la identidad del lead.

### 4.3 Contenidos y aprobaciones

#### `content_items`

Piezas de contenido: publicación, correo o anuncio.

- Atributos: campaña opcional, autor, título, tipo, referencia al cuerpo, fecha programada, fecha publicada y estado operativo.
- El contenido puede distribuirse en varios canales.

#### `content_channels`

Relación N:M entre contenido y canales.

#### `content_reviews`

Historial inmutable de envío a revisión, aprobación y rechazo.

- Atributos: contenido, revisor, acción, comentario y fecha.
- El backend deberá actualizar el estado actual de `content_items` en la misma transacción que inserta la revisión.

### 4.4 Traspaso de mercadeo a ventas

#### `marketing_sales_handoffs`

Entrega formal de un lead calificado.

- Atributos: lead, responsables de mercadeo y ventas, fecha de entrega, decisión, fecha de decisión y motivo de rechazo.
- Restricciones condicionales exigen motivo al rechazar y prohíben motivo al aceptar.

#### `handoff_followups`

Seguimientos posteriores al traspaso, con responsable, fecha y nota.

### 4.5 Suscripciones, pedidos y entregas

#### `subscription_plans`

Plan comercial del servicio.

- Relaciones: N:1 con `commercial_offers` y N:1 opcional con `subscription_parameters`.
- Atributos: segmento hogar/empresa, intervalo y unidad de frecuencia, estado activo.
- El precio base y la composición predeterminada se obtienen de la oferta; no se duplican.

#### `subscriptions`

Contrato recurrente con el contacto cliente.

- Relaciones: cliente, plan y lead de origen opcional.
- Atributos: estado y fechas de inicio, finalización y cancelación.

#### `subscription_items`

Personalización de productos y cantidades por suscripción.

- Relación N:M entre `subscriptions` y `products` con cantidad.
- Si no hay personalización, la aplicación puede copiar explícitamente la composición de `offer_products` al activar la suscripción.

#### `subscription_orders`

Pedido generado por una suscripción.

- Atributos: número único, período de servicio, estado, fecha e instantáneas de subtotal, descuento, envío, impuestos y total.
- Es la fuente de ticket promedio e ingresos atribuidos.

#### `subscription_order_items`

Detalle histórico del pedido.

- Atributos: producto, cantidad, precio unitario y costo unitario al momento del pedido.
- Las instantáneas son hechos transaccionales y no violan 3FN: describen el evento, no el precio actual del producto.

#### `deliveries`

Entrega física asociada a un pedido, con fecha programada, fecha efectiva, estado y referencia de seguimiento.

#### `subscription_events`

Historial de activaciones, renovaciones, pausas, reanudaciones, cambios de plan y cancelaciones.

- Conserva plan anterior/nuevo cuando corresponde.
- Permite medir renovaciones y cancelaciones sin sobrescribir la historia.

### 4.6 Atribución

#### `campaign_attributions`

Asocia una conversión adquirida con una campaña, un lead y una suscripción.

- `lead_id` y `subscription_id` son únicos.
- Registra el modelo de atribución y la fecha.
- La unicidad define una sola campaña acreditada por adquisición y evita contar dos veces clientes o ingresos.
- El ingreso atribuido se obtiene de pedidos pagados de la suscripción; no se guarda otra copia del importe.

## 5. Relaciones con el modelo financiero

La cadena principal es:

`commercial_scenarios → commercial_offers ← subscription_plans → subscriptions → subscription_orders`

- Un escenario conserva su oferta mediante la relación actual.
- Un plan utiliza esa misma oferta y opcionalmente sus parámetros financieros.
- Una suscripción materializa el servicio elegido por un cliente.
- Los pedidos aportan ingresos y ticket real.
- Los detalles de pedido y costos actuales permiten margen observado.
- `campaign_attributions` conecta adquisición e ingresos con la campaña.
- Los hechos detallados pueden alimentar el motor existente de CAC, ROAS, LTV, payback y flujo de caja.

No se agrega una FK directa entre escenario y suscripción porque el escenario es una hipótesis y la suscripción es un hecho. Ambos se comparan por su oferta compartida; si más adelante debe registrarse qué escenario originó un experimento real, se propondrá una entidad de experimento separada.

## 6. Origen de métricas y reglas contra doble conteo

| Métrica | Numerador/denominador | Fuente canónica nueva |
|---|---|---|
| CPC | gasto en medios / clics | `campaign_daily_metrics` |
| CTR | clics / impresiones | `campaign_daily_metrics` |
| CAC | gasto en medios + otros costos / clientes atribuidos | métricas + `campaign_attributions` |
| ROAS | ingresos de pedidos pagados atribuidos / gasto en medios | pedidos + atribuciones + métricas |
| Conversión | entradas a etapa destino / entradas a etapa origen | `lead_stage_history` |
| Ciclo de venta | fecha de cierre − fecha de creación del lead | `leads`, `sales_opportunities` |
| Ticket promedio | promedio del total de pedidos pagados | `subscription_orders` |
| Margen | ingreso del pedido − costos variables | pedidos, detalles y supuestos de costo |

Reglas:

1. No sumar `advertising_acquisition_history` con `campaign_daily_metrics` para el mismo alcance y período.
2. Agregar métricas diarias antes de unirlas con atribuciones o pedidos; de lo contrario se multiplican filas.
3. Contar adquisiciones por `COUNT(DISTINCT subscription_id)`.
4. Contar cada pedido una sola vez y únicamente en estados pagados/completados definidos.
5. Usar `campaign_attributions` como fuente única de asignación de una adquisición a una campaña.
6. No sumar el presupuesto planificado al gasto ejecutado.
7. Distinguir métricas de vanidad (impresiones, clics, CTR) de negocio (suscripciones, ingresos, CAC, ROAS, ticket).

## 7. Revisión de 3FN e integridad

- Cada tabla representa una entidad o hecho con una clave primaria simple.
- Las relaciones N:M usan tablas intermedias (`content_channels`, `subscription_items`).
- Catálogos de canal y etapa eliminan textos repetidos.
- Los atributos no clave dependen de la clave completa de su tabla.
- Las métricas derivadas no se almacenan.
- Los datos históricos de pedidos son instantáneas del evento, no dependencias del catálogo actual.
- Las FK usan tipos `INT`, compatibles con las PK actuales.
- `CHECK`, `UNIQUE` e índices cubren dominios, fechas, cantidades y búsquedas principales.

Excepciones operativas controladas:

- `content_items.status` es el estado actual y `content_reviews` es la auditoría. Deben escribirse atómicamente.
- `subscriptions.status` es el estado actual y `subscription_events` es la auditoría. Deben escribirse atómicamente.
- Estas duplicaciones controladas evitan reconstruir el estado en cada operación y no introducen dependencia entre atributos no clave dentro de la misma tabla.

## 8. Riesgos y decisiones pendientes

1. Confirmar si CAC incluye todos los costos no publicitarios o solo fee de agencia.
2. Confirmar modelo de atribución académico: primer contacto, último contacto o regla fija.
3. Definir estados de pedido que se consideran ingreso reconocido.
4. Definir si una renovación crea una nueva suscripción o solo un evento; la propuesta usa un evento.
5. Definir política de anonimización de contactos para la demostración.
6. Confirmar si los mínimos de 5/10 aplican a cada tabla o al conjunto de cada categoría; el plan adopta el criterio conservador por tabla cuando resulte semánticamente válido.
7. Validar si impuestos forman parte del ticket y del ROAS académico.

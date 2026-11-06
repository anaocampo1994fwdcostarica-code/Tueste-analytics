# Validación de datos ficticios de Tueste Analytics

## Alcance y seguridad

Validación ejecutada el 4 de noviembre de 2026 exclusivamente en
`tueste_analytics_test_migration`, con MySQL 8.0.46. Antes de cargar se verificó:

- destino explícito: `tueste_analytics_test_migration`;
- 36 tablas presentes;
- cero registros en las 36 tablas;
- la base principal `tueste_analytics` conservaba sus 12 tablas.

El script no contiene `USE`, exige el nombre exacto de la base temporal y suma
los registros de las 36 tablas antes de iniciar. Si encuentra datos, una base
distinta o una validación fallida, la restricción de la tabla temporal de guardia
provoca error antes del `COMMIT`. No se borraron ni actualizaron datos previos.

Todos los nombres usan `[DEMO]`, `DEMO_` o el dominio reservado
`example.invalid`. Los importes y resultados son sintéticos, no historia real de
Tueste.

## Registros insertados

| Tabla | Registros | Clasificación |
|---|---:|---|
| `advertising_acquisition_history` | 10 | Movimiento legado ficticio |
| `campaign_attributions` | 10 | Movimiento |
| `campaign_daily_metrics` | 30 | Movimiento |
| `campaigns` | 10 | Movimiento/maestra |
| `commercial_offers` | 5 | Catálogo |
| `commercial_scenarios` | 5 | Catálogo |
| `contacts` | 12 | Maestra |
| `content_channels` | 12 | N:M |
| `content_items` | 10 | Movimiento |
| `content_reviews` | 12 | Movimiento |
| `customer_journey_stages` | 5 | Catálogo |
| `customer_touchpoints` | 32 | Movimiento |
| `deliveries` | 24 | Movimiento |
| `financial_assumptions` | 5 | Catálogo de supuestos |
| `handoff_followups` | 12 | Movimiento |
| `lead_stage_history` | 43 | Movimiento |
| `leads` | 12 | Movimiento |
| `marketing_channels` | 5 | Catálogo |
| `marketing_sales_handoffs` | 12 | Movimiento |
| `offer_products` | 13 | N:M |
| `order_variable_cost_assumptions` | 5 | Catálogo de supuestos |
| `product_variable_costs` | 10 | Maestra de costos |
| `products` | 5 | Catálogo |
| `repurchase_patterns` | 60 | Supuestos temporales |
| `sales_funnel_stages` | 5 | Catálogo |
| `sales_opportunities` | 12 | Movimiento |
| `simulation_config_scenarios` | 15 | N:M |
| `simulation_configs` | 5 | Configuración |
| `subscription_events` | 15 | Movimiento |
| `subscription_items` | 18 | N:M |
| `subscription_order_items` | 36 | Movimiento |
| `subscription_orders` | 24 | Movimiento |
| `subscription_parameters` | 5 | Catálogo de supuestos |
| `subscription_plans` | 5 | Catálogo |
| `subscriptions` | 10 | Movimiento |
| `team_members` | 5 | Catálogo/maestra |

Se cumplen los mínimos conservadores de cinco registros en catálogos y diez en
movimientos o relaciones, con 60 patrones de recompra (cinco patrones por doce
meses).

## Validaciones ejecutadas

| Control | Resultado |
|---|---|
| 36 tablas presentes | Aprobado |
| Mínimos de catálogos y movimientos | Aprobado |
| FK huérfanas en relaciones críticas | 0; aprobado |
| Fechas inválidas de campañas, oportunidades o suscripciones | 0; aprobado |
| Clics mayores que impresiones | 0; aprobado |
| Más de una etapa abierta por lead | 0; aprobado |
| Handoffs aceptados/rechazados inconsistentes | 0; aprobado |
| Contenidos publicados sin fecha o no publicados con fecha | 0; aprobado |
| Totales de pedido inconsistentes | 0; aprobado |
| Subtotales distintos del detalle de pedido | 0; aprobado |
| Atribuciones duplicadas por lead o suscripción | 0; aprobado |
| Leads convertidos sin suscripción | 0; aprobado |
| Contactos fuera de `example.invalid` | 0; aprobado |

Además, MySQL aplicó durante la carga las 51 FK y las 51 restricciones `CHECK`
del esquema. No hubo validaciones fallidas.

## Coherencia demostrada

- Diez de doce leads se convierten en suscripciones; existe un lead descartado y
  uno abierto.
- El historial contiene una sola etapa abierta por lead y transiciones ordenadas.
- Hay diez handoffs aceptados, uno rechazado con motivo y uno pendiente.
- Los contenidos incluyen publicaciones aprobadas, una revisión pendiente, un
  rechazo y cambios solicitados.
- Las suscripciones incluyen estados activo, pausado y cancelado; los eventos
  incluyen activación, renovación, pausa, cambio de plan y cancelación.
- Los 24 pedidos tienen 36 líneas; 22 califican como ingreso en las consultas,
  uno está cancelado y uno reembolsado.
- Cada campaña tiene una única atribución de lead y suscripción.
- El histórico publicitario ficticio usa 2025 y no se suma al detalle de campañas
  de 2026.

## Supuestos sintéticos

Las únicas referencias académicas conservadas literalmente son:

- escenario A: publicidad mensual de USD 8.000;
- escenario B: publicidad mensual de USD 16.000 y descuento introductorio de 30 %;
- escenario C: pack de tres bolsas por USD 48 y publicidad mensual de USD 8.000.

Los costos de producto, envío, procesamiento, costos fijos, tasas, volúmenes,
impresiones, clics y conversiones son supuestos sintéticos. No se inventó un
honorario de agencia: el escenario B declara que no está incluido.

## Errores y correcciones

- Se evitó usar `INFORMATION_SCHEMA.TABLES.table_rows` para comprobar una base
  vacía, porque InnoDB puede entregar estimaciones. El script final suma
  `COUNT(*)` exactos de las 36 tablas.
- En la comprobación independiente se confirmó que unir métricas diarias,
  atribuciones y pedidos sin agregarlas antes multiplica filas. Las consultas 4,
  5 y 11 ya evitan ese error mediante agregaciones separadas.
- La integración de Etapa 3 detectó que el primer resumen independiente de CPC y
  CTR también provenía de esa unión multiplicada. Se corrigieron los valores
  globales a USD 0,720588 y 2,697 %, respectivamente; las consultas por campaña
  y canal nunca estuvieron afectadas.

No fue necesario corregir datos después del `COMMIT`; la primera ejecución de la
carga final pasó todos los controles bloqueantes.


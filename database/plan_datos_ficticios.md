# Plan de datos ficticios académicos

## 1. Propósito y límites

Este documento planifica una carga futura de demostración. **No contiene ni ejecuta `INSERT`**. Todos los registros deberán identificarse como ficticios y no representar personas, empresas, ventas o resultados reales de Tueste.

Se adopta la interpretación conservadora del requisito:

- al menos **5 registros en cada tabla de catálogo o maestra**, cuando existan cinco valores semánticamente válidos;
- al menos **10 registros en cada tabla de movimientos**, no solo diez en el conjunto;
- tablas auxiliares N:M: mínimo 10 relaciones cuando sea coherente; si la cardinalidad legítima es menor, se documentará la excepción.

Antes de cargar debe confirmarse con el docente si el mínimo se aplica por tabla o por categoría. No se inventarán resultados académicos; los valores serán datos controlados de demostración.

## 2. Identificación del conjunto ficticio

- Nombres visibles con prefijo `[DEMO]` cuando el campo lo permita.
- Correos bajo el dominio reservado `example.invalid`.
- Códigos con prefijo `DEMO_`.
- Fechas dentro de un período académico acordado.
- Importes y conteos definidos en un anexo de supuestos, no tomados como hechos reales.
- El script futuro se ejecutará dentro de una transacción y mostrará conteos de control antes de `COMMIT`.

## 3. Clasificación y mínimos: tablas actuales

| Tabla | Clasificación | Objetivo de carga | Justificación |
|---|---:|---:|---|
| `products` | Catálogo | 5 | Productos disponibles dentro del servicio. |
| `commercial_offers` | Catálogo | 5 | Ofertas base para planes y escenarios. |
| `offer_products` | Auxiliar N:M | ≥10 | Composición de cinco ofertas; no es catálogo ni movimiento temporal. |
| `product_variable_costs` | Maestra de costos | ≥10 | Al menos dos componentes de costo por producto. |
| `order_variable_cost_assumptions` | Catálogo de supuestos | 5 | Configuraciones de costos por pedido. |
| `financial_assumptions` | Catálogo de supuestos | 5 | Variantes identificadas de proyección. |
| `advertising_acquisition_history` | Movimiento/resumen legado | 10 | Diez períodos/canales históricos ficticios, sin solaparlos con el detalle nuevo. |
| `commercial_scenarios` | Catálogo de escenarios | 5 | A, B y C más dos escenarios exclusivamente demostrativos si el mínimo es por tabla. Requiere aprobación académica. |
| `repurchase_patterns` | Catálogo temporal de supuestos | ≥60 | Cinco patrones por 12 meses. |
| `subscription_parameters` | Catálogo de supuestos | 5 | Parámetros financieros de los planes. |
| `simulation_configs` | Configuración | 5 | Cinco configuraciones demostrativas. |
| `simulation_config_scenarios` | Auxiliar N:M | ≥10 | Asociaciones entre configuraciones y escenarios. |

`advertising_acquisition_history` no se sumará a `campaign_daily_metrics`. Puede representar un período anterior al modelo detallado o quedar fuera de las consultas académicas nuevas.

## 4. Clasificación y mínimos: tablas nuevas

### Catálogos y maestras

| Tabla | Objetivo | Contenido coherente previsto |
|---|---:|---|
| `team_members` | 5 | Responsables ficticios de mercadeo, ventas, operaciones y administración. |
| `marketing_channels` | ≥5 | Por ejemplo, canales orgánicos, pagados, referidos y directos; los nombres exactos se aprobarán antes de cargar. |
| `contacts` | ≥12 | Personas ficticias: clientes particulares y contactos empresariales. Es dato maestro, no catálogo. |
| `customer_journey_stages` | 5 | Conciencia, consideración, decisión, retención y recomendación. |
| `sales_funnel_stages` | 5 | Lead, prospecto, oportunidad, cierre y descartado. |
| `subscription_plans` | 5 | Planes para hogar, empresa o ambos, vinculados a ofertas existentes. |

### Movimientos y procesos

| Tabla | Objetivo mínimo | Regla de coherencia |
|---|---:|---|
| `campaigns` | 10 | Diferentes períodos, canales y estados; presupuesto definido. |
| `campaign_daily_metrics` | ≥30 | Al menos tres días por campaña; clics nunca mayores que impresiones. |
| `customer_touchpoints` | ≥30 | Varios puntos por contacto y etapas cronológicas. |
| `leads` | ≥12 | Un ciclo comercial por cada contacto de la muestra, con fuente válida. |
| `lead_stage_history` | ≥30 | Transiciones ordenadas y una sola etapa abierta por lead. |
| `sales_opportunities` | ≥10 | Oportunidades abiertas, ganadas y perdidas consistentes con el embudo. |
| `content_items` | ≥10 | Publicaciones, correos y anuncios con autor, programación y estado. |
| `content_reviews` | ≥10 | Revisiones coherentes con el estado actual del contenido. |
| `marketing_sales_handoffs` | ≥10 | Casos pendientes, aceptados y rechazados; motivo obligatorio al rechazar. |
| `handoff_followups` | ≥10 | Seguimientos vinculados a handoffs existentes. |
| `subscriptions` | ≥10 | Suscripciones particulares y empresariales originadas por leads ganados. |
| `subscription_orders` | ≥24 | Al menos dos períodos para la mayoría de las suscripciones. |
| `subscription_order_items` | ≥30 | Detalle consistente con cada pedido y productos vigentes. |
| `deliveries` | ≥10 | Entregas programadas, en tránsito y realizadas. |
| `subscription_events` | ≥10 | Activaciones y una muestra de renovación, pausa, cambio o cancelación. |
| `campaign_attributions` | ≥10 | Una atribución por lead convertido y suscripción adquirida. |

### Tablas auxiliares N:M

| Tabla | Objetivo | Clasificación |
|---|---:|---|
| `content_channels` | ≥10 | Asociación de contenido con uno o más canales. No es catálogo ni movimiento autónomo. |
| `subscription_items` | ≥15 | Configuración personalizada de productos por suscripción. No es un evento temporal. |

## 5. Secuencia de carga propuesta

1. Catálogos actuales: productos, ofertas, costos y supuestos.
2. Equipo, canales y etapas.
3. Composición de ofertas, parámetros y planes.
4. Campañas, contenidos y métricas diarias.
5. Contactos y touchpoints iniciales.
6. Leads e historial del embudo.
7. Revisiones de contenido, handoffs y seguimientos.
8. Oportunidades y cierres.
9. Suscripciones e ítems personalizados.
10. Pedidos, detalles y entregas.
11. Eventos de suscripción y atribuciones.
12. Escenarios, simulaciones y patrones financieros.

La secuencia respeta todas las FK y evita usar identificadores inexistentes.

## 6. Flujo de demostración que deberán soportar los datos

1. Una campaña pagada publica un anuncio aprobado.
2. Se registran impresiones, clics y gasto diario.
3. Un contacto realiza un touchpoint y se convierte en lead.
4. El lead avanza de conciencia/lead a consideración/prospecto y luego a oportunidad.
5. Mercadeo entrega el lead a ventas.
6. Ventas acepta el handoff y gana la oportunidad.
7. El contacto elige un plan y activa una suscripción.
8. La suscripción genera pedidos y entregas periódicas.
9. Una sola atribución conecta campaña, lead y suscripción.
10. Las consultas calculan CPC, CTR, CAC, ROAS, conversión, ciclo y ticket sin duplicar hechos.

También deben existir caminos alternativos: lead descartado, handoff rechazado con seguimiento, contenido rechazado y suscripción cancelada. Esos casos son necesarios para probar restricciones, no para simular resultados favorables.

## 7. Controles de calidad previos al COMMIT futuro

### Conteos por clasificación

La carga futura deberá ejecutar consultas como:

```sql
SELECT 'marketing_channels' AS table_name, COUNT(*) AS row_count FROM marketing_channels
UNION ALL SELECT 'customer_journey_stages', COUNT(*) FROM customer_journey_stages
UNION ALL SELECT 'sales_funnel_stages', COUNT(*) FROM sales_funnel_stages
UNION ALL SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL SELECT 'campaign_daily_metrics', COUNT(*) FROM campaign_daily_metrics
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'lead_stage_history', COUNT(*) FROM lead_stage_history
UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL SELECT 'subscription_orders', COUNT(*) FROM subscription_orders;
```

### Integridad y cronología

- Cero FK huérfanas.
- Cero campañas con fin anterior al inicio.
- Cero métricas con clics mayores que impresiones.
- Cero leads con más de una etapa abierta.
- Cero oportunidades cerradas antes de su apertura.
- Cero handoffs rechazados sin motivo.
- Cero contenidos publicados sin fecha de publicación.
- Cero pedidos cuyo total difiera de subtotal − descuento + envío + impuesto.
- Cero atribuciones duplicadas por lead o suscripción.

### Reconciliación

- Clientes adquiridos por campaña = suscripciones distintas en `campaign_attributions`.
- Ingreso atribuido = suma de pedidos reconocidos de esas suscripciones.
- Gasto ejecutado = suma de hechos diarios, nunca presupuesto planificado.
- Cada pedido se cuenta una sola vez en ticket e ingresos.

## 8. Datos aún por aprobar

1. Valores ficticios exactos de precios, costos, presupuestos y tasas.
2. Período de la demostración.
3. Nombres finales de canales y planes.
4. Definición académica de CAC y atribución.
5. Estados de pedido reconocidos como ingreso.
6. Si deben crearse dos escenarios adicionales para que `commercial_scenarios` llegue a cinco.
7. Confirmación de que el criterio 5/10 se aplica por tabla.

No se preparará el script de `INSERT` hasta recibir estas decisiones y autorización expresa.

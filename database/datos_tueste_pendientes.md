# Datos pendientes para el modelo financiero de Tueste

## Estado verificado

Las 12 tablas existen, pero actualmente contienen **0 registros**. Por tanto, todavía no hay cifras financieras del caso académico almacenadas. Lo único confirmado es el alcance solicitado: importes en USD, proyección de flujo de caja a 24 meses y comparación de tres escenarios comerciales. Los valores por defecto del esquema no se consideran datos del caso.

## Información necesaria y destino

| Información | Tabla y campos | Campos obligatorios al cargar | Estado |
|---|---|---|---|
| Productos comercializados | `products`: `name`, `description`, `active` | `name`, `active` | Pendiente |
| Ofertas o packs y precio de venta | `commercial_offers`: `name`, `description`, `selling_price_usd`, `active` | `name`, `selling_price_usd`, `active` | Pendiente |
| Composición de cada oferta | `offer_products`: `offer_id`, `product_id`, `quantity` | Los tres campos | Pendiente; requiere productos y ofertas previos |
| Costos variables unitarios de cada producto | `product_variable_costs`: `product_id`, `cost_name`, `cost_usd` | Los tres campos | Pendiente |
| Costos variables por pedido | `order_variable_cost_assumptions`: `name`, `shipping_cost_usd`, `payment_fee_percent`, `payment_fee_fixed_usd`, `other_cost_usd` | Todos; los importes pueden ser cero solo si el caso lo confirma | Pendiente |
| Historial de adquisición y ventas atribuidas | `advertising_acquisition_history`: `period_start`, `period_end`, `channel`, `ad_spend_usd`, `acquired_customers`, `attributed_revenue_usd` | Todos | Pendiente |
| Costos fijos y horizonte | `financial_assumptions`: `name`, `monthly_fixed_cost_usd`, `projection_months`, `notes` | `name`, `monthly_fixed_cost_usd`, `projection_months` | Se conoce el horizonte objetivo de 24 meses; costo y nombre pendientes |
| Tres escenarios | `commercial_scenarios`: `name`, `description`, `offer_id`, `order_cost_assumption_id`, `monthly_ad_spend_usd`, `expected_cac_usd`, `active` | `name`, `offer_id`, `monthly_ad_spend_usd`, `active`; `expected_cac_usd` es necesario si no se deriva del historial | Se conoce la cantidad requerida (3); definición y valores pendientes |
| Recompra mensual para LTV | `repurchase_patterns`: `name`, `month_number`, `repurchase_probability` | Los tres campos | Pendiente para meses 1 a 12 como mínimo |
| Suscripción, si forma parte de algún escenario | `subscription_parameters`: `name`, `monthly_price_usd`, `monthly_churn_rate`, `monthly_variable_cost_usd` | Todos | Pendiente confirmar si aplica |
| Configuración de la simulación | `simulation_configs`: `name`, `financial_assumption_id`, `projection_months` | `name`, `projection_months`; vincular el supuesto financiero para el cálculo | Horizonte objetivo conocido: 24 meses |
| Escenarios incluidos en la simulación | `simulation_config_scenarios`: `simulation_config_id`, `scenario_id` | Ambos | Pendiente; deben vincularse los tres escenarios |

Los identificadores `id` son autoincrementales y no deben proporcionarse manualmente.

## Datos adicionales que el esquema actual no puede representar bien

Antes de cargar datos conviene confirmar la regla académica exacta para cada indicador y decidir cómo modelar lo siguiente:

- **Caja inicial:** no existe una columna para el saldo inicial de efectivo.
- **Volumen mensual por escenario:** faltan pedidos, clientes nuevos o unidades proyectadas por cada uno de los 24 meses. Sin ello no puede proyectarse ingreso, costo variable ni caja mensual.
- **Movimientos de caja no operativos:** no hay campos/tablas para inversiones iniciales, CAPEX, impuestos, deuda, aportes, cobros/pagos diferidos o capital de trabajo, si el caso los contempla.
- **Fee de agencia:** el historial y los escenarios solo almacenan gasto publicitario; no existe un campo separado para honorarios de agencia.
- **Cohortes para payback:** no hay vínculo entre mes de adquisición, escenario y contribución mensual posterior de esa cohorte.
- **Patrones de recompra:** `repurchase_patterns` no tiene clave foránea hacia escenario, oferta o segmento, ni cantidad esperada; el campo `name` sería solo una convención textual insuficiente para relaciones robustas.
- **Suscripciones:** `subscription_parameters` no está relacionada con escenarios ni configuraciones de simulación.
- **Vigencia de precios y costos:** no hay fechas de efectividad, por lo que el esquema solo representa un valor actual por registro.
- **Orden de comparación:** la tabla intermedia permite asociar tres escenarios, pero no almacena su orden ni exige exactamente tres.

## Cobertura de indicadores con el modelo actual

- **Margen de contribución:** calculable por oferta si se cargan precio, composición y todos los costos variables. Falta definir si el gasto de adquisición forma parte del margen usado por el caso.
- **CAC:** calculable históricamente como gasto publicitario dividido entre clientes adquiridos. Si el fee de agencia debe incluirse, falta almacenarlo por separado.
- **ROAS:** calculable históricamente con ingresos atribuidos y gasto publicitario.
- **ROAS de equilibrio:** derivable a partir del porcentaje de margen de contribución, siempre que se confirme la fórmula académica y que los costos estén completos.
- **LTV a 12 meses:** aproximable con recompra, precio y margen, pero falta relacionar explícitamente el patrón con escenario/oferta y confirmar si la probabilidad representa clientes, pedidos o unidades.
- **Relación LTV:** si significa `LTV/CAC`, es derivable una vez calculados ambos; debe confirmarse esa definición.
- **Payback:** no es confiablemente calculable sin contribución mensual por cohorte o supuestos equivalentes.
- **Flujo de caja a 24 meses:** no es calculable de forma completa sin caja inicial y volumen/ingresos/egresos mensuales por escenario.
- **Comparación de tres escenarios:** la asociación está soportada, pero faltan los impulsores mensuales y vínculos mencionados para comparar todos los indicadores.

## Confirmaciones manuales necesarias antes de insertar

1. Entregar las cifras reales del caso para todos los elementos marcados como pendientes.
2. Confirmar las fórmulas académicas de ROAS de equilibrio, LTV a 12 meses, relación LTV y payback.
3. Confirmar si publicidad incluye fee de agencia y si existen impuestos, inversiones, deuda o plazos de cobro/pago.
4. Definir los tres escenarios y sus volúmenes mensuales durante 24 meses.
5. Autorizar por separado cualquier cambio futuro de estructura; este documento no agrega columnas ni modifica MySQL.

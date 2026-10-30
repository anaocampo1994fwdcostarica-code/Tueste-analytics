# Esquema MySQL de Tueste Analytics

El archivo `schema.sql` crea la base de datos `tueste_analytics` y sus tablas para MySQL 8.0. Este esquema está preparado como contrato inicial para una futura API con Node.js y Express; el SQL no se ejecuta ni contiene registros.

## Tablas

- `products`: catálogo base de productos comercializados por Tueste.
- `commercial_offers`: ofertas, descuentos, suscripciones, paquetes y promociones comerciales.
- `offer_products`: composición de cada oferta y cantidad de unidades por producto.
- `product_variable_costs`: costo variable histórico o vigente por producto y tipo, con vigencias temporales.
- `order_variable_cost_assumptions`: costos variables asociados al pedido y a una oferta. Los costos monetarios usan `amount_usd`; la comisión de procesamiento usa `percentage_rate` expresada como fracción.
- `financial_assumptions`: supuestos generales versionados, como caja inicial, costos fijos, piso de seguridad y horizonte.
- `advertising_acquisition_history`: inversión publicitaria, clientes adquiridos y fee de agencia observados históricamente.
- `commercial_scenarios`: estrategias actuales o hipotéticas que se compararán en las simulaciones.
- `repurchase_patterns`: patrones mensuales de recompra por escenario y segmento de cliente.
- `subscription_parameters`: parámetros versionados para suscripciones, incluyendo precio, churn, renovaciones y permanencia.
- `simulation_configs`: configuración seleccionada para ejecutar una simulación.
- `simulation_config_scenarios`: relación muchos-a-muchos entre simulaciones y escenarios, incluyendo orden de presentación.

## Relaciones principales

Una oferta se compone de uno o más productos mediante `offer_products`. Cada producto puede tener varios registros de costo variable con vigencia temporal. Los costos variables de pedido pueden aplicarse globalmente o asociarse a una oferta.

Los supuestos financieros sirven como base de configuraciones de simulación. Una simulación puede vincular parámetros de suscripción y varios escenarios; el historial publicitario permanece independiente, porque representa observaciones pasadas en lugar de hipótesis.

Los escenarios pueden usar supuestos generales y tienen patrones mensuales propios de recompra. Cada escenario puede vincularse opcionalmente a una oferta mediante `offer_id`, permitiendo asociar el descuento comercial y el pack a su representación de negocio. La tabla intermedia conserva qué escenarios participan en una configuración y en qué orden se presentan.

## Supuestos de diseño

- Los importes, costos y porcentajes se almacenan en `DECIMAL`; los porcentajes utilizan una fracción entre `0` y `1`. Por ejemplo, una tasa expresada como 4,5 % se almacena como `0.045`.
- Una comisión de procesamiento nunca debe guardarse como importe USD fijo. La columna `percentage_rate` de `order_variable_cost_assumptions` representa la tasa aplicable al importe pagado.
- Las campañas publicitarias sin nombre están representadas por `NULL`, sin sustitución por texto inventado. Una columna generada normaliza esa ausencia para que la clave única evite duplicados, mientras las campañas nombradas siguen diferenciándose entre sí.
- USD es la moneda de referencia. Las columnas monetarias llevan el sufijo `*_usd` y todas las tablas monetarias incluyen validación `currency = 'USD'`.
- No se almacenan CAC, LTV, ROAS ni cualquier otro indicador derivable a partir de inversión, clientes, precios o costos.
- Los datos históricos, supuestos generales, suscripciones y escenarios hipotéticos están separados conceptualmente.
- `product_variable_costs` distingue el tipo de costo además del producto y valida intervalos mediante triggers para detectar solapamientos, incluidos finales abiertos. MySQL 8 no ofrece restricciones de exclusión de rangos. Como defensa adicional, la API futura debe ejecutar cambios dentro de una transacción y aplicar `SELECT ... FOR UPDATE` sobre el producto antes de insertar o actualizar costos vigentes. Esta combinación evita carreras concurrentes sobre el registro padre; los triggers detectan solapamientos entre registros ya visibles.
- Las fechas mensuales de históricos se normalizan al primer día del mes mediante la restricción correspondiente.
- La API puede consultar periodos de vigencia sin duplicar costos: solo se aplican registros cuyo intervalo incluye la fecha consultada.
- `churn_rate` representa la cancelación mensual como fracción. La supervivencia de una cohorte puede calcularse como `(1 - churn_rate) ^ edad_meses`, sin guardar la tasa derivada ni indicadores derivados adicionales.
- En esta etapa no se incluyen usuarios, pedidos reales ni transacciones. Esas entidades podrían añadirse después sin modificar la separación entre datos históricos y simulaciones.

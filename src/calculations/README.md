# Motor financiero

`financialEngine.js` contiene funciones puras: no consulta la API, no accede a MySQL y no modifica sus argumentos. Cada función devuelve uno de estos estados:

- `ok`: cálculo realizado con los parámetros recibidos.
- `insufficient_data`: faltan parámetros; incluye `missing`.
- `invalid_data`: los parámetros no cumplen el dominio de la fórmula.
- `not_recovered`: el CAC no se recuperó dentro del horizonte entregado al cálculo de payback.

No se reemplazan datos ausentes por cero. Un cero solo participa cuando el llamador lo proporciona expresamente.

## Fórmulas

- **Costo variable del pedido** = costos de productos + envío + (`precio × comisión porcentual`) + comisión fija + otros costos.
- **Margen de contribución** = precio de venta − costo variable del pedido.
- **Porcentaje de margen** = margen de contribución ÷ ingreso.
- **CAC** = (publicidad + honorarios de agencia) ÷ clientes adquiridos.
- **ROAS** = ingresos atribuidos ÷ gasto publicitario.
- **ROAS de equilibrio** = 1 ÷ porcentaje de margen de contribución. Esta definición debe validarse contra la documentación académica.
- **LTV a 12 meses** = margen de la compra inicial + suma, para los meses 1–12, de (`probabilidad de recompra × cantidad × margen de contribución`).
- **Relación LTV/CAC** = LTV ÷ CAC. Se usa esta interpretación de “relación LTV”, pendiente de validación académica.
- **Payback** = primer momento en que la contribución acumulada de la cohorte alcanza el CAC. Dentro del mes de recuperación se interpola linealmente.
- **Flujo neto mensual** = ingresos + otras entradas − costos variables − costos fijos − publicidad − otras salidas.
- **Caja final mensual** = caja inicial mensual + flujo neto mensual.
- **Comparación**: orden descendente por cada métrica recibida; no produce una recomendación ponderada ni inventa métricas ausentes.

## Integración

`tuesteModel.js` adapta los datos de la API a estados consumibles por React. Solo calcula ROAS histórico cuando existe historial. CAC queda pendiente aunque haya historial porque la estructura real no contiene honorarios de agencia y no se asume que sean cero.

`scenarioReferences.js` conserva las referencias iniciales A, B y C proporcionadas por el usuario. Están marcadas como pendientes de validación y no se insertan en MySQL ni se presentan como resultados calculados.

Las pruebas usan exclusivamente valores sintéticos declarados dentro de `financialEngine.test.js`.

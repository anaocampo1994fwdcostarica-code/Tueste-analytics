# Etapa 13 — Cierre del Nivel 2: El tablero de Tueste

Fecha: 6 de noviembre de 2026  
Fuente normativa: `Caso A - Tueste (1).pdf`  
Alcance: tablero financiero interactivo de 12 meses. MySQL DEMO y el futuro Nivel 3 permanecen separados.

## 1. Resumen

Se incorporó una sección identificable como **Nivel 2 · Tablero interactivo** dentro de la aplicación React existente. Reutiliza `simulationModel.js`, no replica fórmulas en componentes y mantiene los escenarios Actual, Agencia y Pack. El tablero comercial continúa montado de forma independiente; una API ausente muestra su propio error y no impide usar el modelo financiero.

El Nivel 2 demostrado pasa de 38,5 % a **92,3 %** según los 13 requisitos de la auditoría: 11 cumplidos y 2 parciales. No se declara 100 % porque el Excel editable externo conserva discrepancias conocidas y todavía no existe un enlace público verificado.

## 2. Cumplimiento requisito por requisito

| Requisito | Estado | Evidencia |
|---|:---:|---|
| Página React interactiva | Cumplido | Recálculo con estado React y `useMemo`; sección `#nivel-2`. |
| Nueve controles obligatorios | Cumplido | Meta, precio/bolsa, café, envío, suscriptores, churn, pedidos, fee y descuento. |
| Ocho indicadores en vivo | Cumplido | Margen, break-even, CAC, LTV, ratio, payback, ROAS primer pedido y CAC marginal. |
| Curva de caja por cliente | Cumplido | Tres escenarios, meses 0–12 y línea USD 0; mes 0 es `-CAC`. |
| LTV frente a CAC | Cumplido | Punto exacto y referencias geométricas 1:1 y 3:1. |
| Clientes vs inversión | Cumplido | Seis puntos históricos, interpolación, selección y cinco CAC marginales. |
| Umbral ROAS break-even | Cumplido | Comparación visual y mensaje por debajo/sobre el umbral. |
| Semáforo LTV/CAC | Cumplido | Rojo `<1`, amarillo `1–<3`, verde `≥3`, con texto accesible. |
| Gráfico trampa del ROAS | Cumplido | Ads Manager 3,0x fijo, primer pedido dinámico y break-even dinámico. |
| Paridad Excel menor de 1 % | Parcial | Caso base coincide; Pack y payback del Excel editable externo siguen discrepantes. |
| Restaurar datos originales | Cumplido | Restaura controles, distribución mensual y escenario Actual. |
| Nombre, unidad y explicación | Cumplido | Todas las tarjetas y controles muestran unidad y metodología breve. |
| Abrir sin instalación | Parcial | `dist/` está listo para hosting estático; no se publicó ni se verificó una URL pública. |

## 3. Controles y método de pedidos sueltos

Los valores originales restaurados son: Meta 8.000; precio 17 por bolsa; café 5,44; envío 4,50; suscriptores 15 %; churn 9 %; tres pedidos sueltos; fee 1.000; descuento Actual 0 %.

Meta se limita a 0–20.000 y usa exactamente `[[0,0],[4000,100],[8000,165],[12000,210],[16000,235],[20000,250]]` con interpolación lineal. No se extrapola. Con Meta 0, clientes Meta es 0 y CAC/ROAS son “No aplicable”; los 47 orgánicos no entran en el CAC.

Al modificar el total de pedidos se multiplica cada mes por `nuevoTotal / totalVigente`. Así se conserva la forma relativa de la distribución. Restaurar vuelve a copiar la distribución original completa, que suma 3.

## 4. Fórmulas de los ocho indicadores

1. Contribución: `precio pedido − café − envío − pasarela − empaque`; margen porcentual: `contribución / precio`.
2. ROAS break-even: `1 / margen porcentual` para la oferta del escenario.
3. CAC real: `(Meta + fee) / clientes nuevos Meta`; no aplicable sin clientes Meta.
4. LTV 12 meses: contribución ponderada de compras sueltas y suscriptores retenidos.
5. LTV/CAC: `LTV de contribución / CAC real`.
6. Payback entero: primer mes con acumulado `≥ 0`; interpolado se conserva con nombre distinto.
7. ROAS primer pedido: `clientes Meta × ingreso del primer pedido / Meta`.
8. CAC marginal: `Δ inversión / Δ clientes Meta`; en un quiebre se muestran tramo anterior y siguiente.

El caso original conserva contribución USD 15,89, margen 46,735294 %, break-even 2,139711x, CAC real USD 54,545455, LTV USD 54,796071, ratio 1,004595x, payback entero mes 12 y ROAS del primer pedido 0,70125x.

## 5. Evidencia de gráficos

- **Curva por cliente:** las tres series contienen 13 puntos; Actual inicia en `-54,545455` y cruza en el mes 12.
- **LTV/CAC:** utiliza coordenadas CAC/LTV y dos rectas reales de referencia, no decoraciones.
- **Adquisición:** diferencia puntos históricos, selección interpolada y etiqueta el costo marginal de los cinco tramos.
- **Trampa del ROAS:** mantiene 3,0x como referencia histórica fija. Primer pedido y break-even se recalculan. La explicación aclara que atribución publicitaria no equivale a caja bancaria incremental.

## 6. Matriz de paridad con Excel editable

| Métrica | React original | Excel editable | Diferencia | Estado / explicación |
|---|---:|---:|---:|---|
| Contribución pedido | 15,89 | 15,89 | 0 % | Coincidencia comprobada. |
| CAC real Actual | 54,545455 | 54,545455 | 0 % | Coincidencia comprobada. |
| LTV Actual | 54,796071 | 54,796071 | 0 % | Coincidencia comprobada. |
| LTV/CAC Actual | 1,004595x | 1,004595x | 0 % | Coincidencia comprobada. |
| Payback Actual | Mes 12 | `>12` almacenado | No comparable | Discrepancia conocida de fórmula/recálculo del libro. |
| LTV/CAC Pack 100 % | 1,459132x | 1,125054x | 29,69 % sobre React | Reglas Pack distintas; documentado en Etapa 12. |

El archivo externo no fue modificado. La paridad completa sigue pendiente de autorización, corrección y recálculo del libro original.

## 7. Componentes y archivos

- `src/financial/levelTwoModel.js`: contrato de nueve controles, validación, semáforo, CAC marginal y contrato de datos de gráficos.
- `src/financial/contracts.js`: descuento original del escenario Actual separado del descuento de Agencia.
- `src/components/LevelTwoDashboard.jsx`: controles, ocho tarjetas y tres visualizaciones nuevas.
- `src/financial/simulationModel.js`: casos Meta 0, métricas nulas y break-even por escenario.
- `src/components/Dashboard.jsx`: montaje del Nivel 2, restauración y robustez de curvas sin NaN.
- `src/components/Sidebar.jsx`: acceso `Nivel 2 · Tablero`.
- `src/financial/financialExport.js`: exporta precio por bolsa, suscriptores y pedidos vigentes.
- `src/styles.css`: diseño responsive coherente con Tueste.
- Pruebas: `levelTwoModel.test.js` y `financialExport.test.js`.

## 8. Pruebas y build

Resultado final: **50 pruebas aprobadas, 0 fallos**. Cubren los nueve controles, recálculo, límites, Meta 0/20.000/intermedio, interpolación, indicadores, quiebres marginales, datos de los cuatro gráficos, semáforo, restauración, escenarios previos y Excel con supuestos modificados.

`npm run build` finaliza correctamente con Vite 7.3.7, 44 módulos transformados. ExcelJS permanece como fragmento dinámico grande (advertencia de tamaño, no error).

No hay infraestructura Playwright/Puppeteer instalada; por eso la comprobación visual automatizada de píxeles queda pendiente. La compilación valida JSX/CSS y el diseño incluye reglas para escritorio, tableta y móvil.

## 9. Acceso sin instalación y publicación

La compilación estática queda en `dist/` y el modelo financiero funciona sin MySQL. Para publicar, subir el contenido de `dist/` a un hosting estático compatible con SPA (por ejemplo, el servicio autorizado por la institución) y abrir la URL resultante. El dashboard comercial requerirá configurar `VITE_API_URL` y su API; su ausencia no invalida el tablero financiero.

No se realizó despliegue externo, no se subieron credenciales y no existe todavía una URL pública comprobada. Abrir `dist/index.html` directamente con `file://` no es la estrategia recomendada; debe servirse por HTTP/HTTPS.

## 10. Pendientes y siguiente etapa

1. Corregir y recalcular el Excel editable externo solo con autorización; volver a ejecutar la matriz de paridad.
2. Publicar `dist/` en el destino autorizado y verificar la URL desde un equipo sin entorno de desarrollo.
3. Hacer revisión visual manual en navegador real y, si se desea automatización, incorporar infraestructura de pruebas visuales en una etapa autorizada.
4. La Etapa 14 puede comenzar después de aceptar estas limitaciones. Debe construir el Nivel 3 de 24 meses en un módulo separado, sin convertir silenciosamente el actual modelo de 12 meses.

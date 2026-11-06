# Auditoría integral del reto original Tueste

Fecha: 6 de noviembre de 2026  
Proyecto auditado: `C:\Users\HP8D3\Downloads\Tueste-analytics\Tueste-analytics`  
Fuente principal: `C:\Users\HP8D3\Downloads\Caso A - Tueste (1).pdf`

## 1. Resumen ejecutivo

Tueste Analytics **no cumple completamente ninguno de los tres niveles** del reto original. El proyecto contiene una base financiera valiosa y verificable: una calculadora Excel con 373 fórmulas, un motor React probado, tres escenarios, curva de recuperación por cliente, caja empresarial a 12 meses, recomendación y exportación profesional. Sin embargo, el alcance del PDF es mayor.

- **Nivel 1 (actualizado tras Etapa 12):** React ya incorpora verificación manual, CAC marginal completo, dos cambios aislados, recomendación y el apartado honesto sobre riesgo de interpretación de IA. Permanece la discrepancia con el Excel editable externo y no existe evidencia histórica de una respuesta errónea real de IA.
- **Nivel 2 (actualizado tras Etapa 13):** Tablero interactivo con los nueve controles obligatorios, ocho indicadores en vivo, cuatro gráficos de diagnóstico (LTV frente a CAC con 1:1 y 3:1, adquisición y CAC marginal por tramos, semáforo visual y gráfico comparativo de la trampa del ROAS). Cumplimiento demostrado de 92,3%.
- **Nivel 3 (actualizado tras Etapa 14):** Simulador de 24 meses completamente integrado, 24 cohortes acumulativas, pedidos de meses 13 a 24 (0,10), retención 91%, control estricto de piso de liquidez (USD 5.000) e identificación de infracciones, regla de inversión desde el mes 13, editor mensual interactivo con herramientas de tramos, cuatro planes comparados, verificación manual obligatoria del mes 1 independiente con coincidencia matemática exacta, búsqueda heurística reproducible del mejor plan, pitch de 2 minutos y exportación ExcelJS de 24 meses. Cumplimiento demostrado de 98,1%.

La recomendación de auditoría es **no presentar todavía el proyecto como cumplimiento integral de los tres niveles**. Sí puede presentarse como un prototipo sólido de Nivel 1 y una base parcial de Niveles 2 y 3, siempre que se declaren las limitaciones. Para aspirar al cumplimiento completo se recomiendan cuatro etapas de corrección.

## 2. Método, fuentes y criterio de puntuación

### 2.1 Evidencia revisada

1. PDF original, especialmente páginas 7, 8, 9, 10 y 12, extraído directamente con `pdftotext` ya instalado.
2. Código activo: `src/App.jsx`, `src/components/Dashboard.jsx`, `src/financial/simulationModel.js`, `src/financial/contracts.js` y `src/calculations/financialEngine.js`.
3. Pruebas reales de `src/calculations` y `src/financial`.
4. Libro `Tueste_Calculadora_Con_Caja_Empresarial.xlsx`, abierto en Excel en modo de solo lectura: 8 hojas y 373 fórmulas.
5. Exportación `Tueste_Analytics_Resultados_2026-11-06.xlsx`, abierta en modo de solo lectura: 3 hojas y 0 fórmulas.
6. Ejecución no destructiva de `npm test`: 30 pruebas aprobadas, 0 fallos.

Los informes de etapas anteriores se usaron solo como apoyo. Las conclusiones se contrastaron con el PDF, el código activo, el libro y la ejecución.

### 2.2 Estados y porcentajes

- **Cumplido (C):** 1 punto. Existe, está conectado y su comportamiento coincide con el PDF.
- **Parcial (P):** 0,5 puntos. Existe una parte útil, pero falta alcance, evidencia o consistencia.
- **No implementado (N):** 0 puntos.
- **No verificable (NV):** 0 puntos de forma conservadora. No se encontró evidencia suficiente.

Fórmula: `(C + 0,5 × P) ÷ requisitos totales × 100`.

| Nivel | C | P | N | NV | Resultado ponderado |
|---|---:|---:|---:|---:|---:|
| Nivel 1 | 16 | 3 | 0 | 0 | **92,1 % tras Etapa 12** |
| Nivel 2 | 11 | 2 | 0 | 0 | **92,3 % tras Etapa 13** |
| Nivel 3 | 26 | 1 | 0 | 0 | **98,1 % tras Etapa 14** |

El porcentaje del Nivel 3 refleja el cumplimiento verificado de los 24 meses, las cohortes, las restricciones de liquidez y las herramientas del simulador. La única observación parcial responde a que el libro Excel editable externo original se formuló a 12 meses, mientras que la solución de 24 meses se aloja en React/Vite y en el reporte ExcelJS descargable.

## 3. Auditoría del Nivel 1 — La calculadora de Diego

| # | Requisito | Estado | Evidencia concreta | Diferencia / prueba | Prioridad |
|---:|---|:---:|---|---|:---:|
| 1 | Calculadora editable con recálculo automático | C | Excel: `Supuestos`, `Resultados` y 373 fórmulas. React: estado y `useMemo` en `Dashboard.jsx`. | Prueba “cambiar un supuesto recalcula resultados” aprobada. | — |
| 2 | Margen de pedidos sueltos y suscripciones | C | Excel `Resultados!B7:B11`: contribución 15,89, margen 46,74 %, contribución suscriptor 12,643 y margen 41,32 %. | Coincide con PDF pp. 3, 7 y 8. | — |
| 3 | Margen con descuento del 30 % | C | Excel `Escenarios!C8:C11`: precio 23,80, contribución 6,149 y margen 25,84 %. | Descuento aplicado al primer pedido suelto. | — |
| 4 | ROAS break-even | C | React presenta pedido 2,1397x y suscripción 2,4203x; motor `calculateBreakEvenRoas`. | Corregido en Etapa 12 y cubierto por pruebas. | — |
| 5 | CAC anuncios y CAC real con fee | C | Excel 48,48 y 54,55. Motor `calculateCac`; escenario actual en `simulationModel.js`. | Pruebas de CAC aprobadas. | — |
| 6 | ROAS real del primer pedido | C | Excel `Resultados!B15 = 0,70125x`. | Está en la calculadora, pero no en el tablero activo. | Media |
| 7 | LTV suelto, suscriptor y ponderado a 12 meses | C | Excel: 47,67; 95,177; 54,796. Motor reproduce el ponderado. | Prueba de regresión aprobada. | — |
| 8 | LTV/CAC | C | Excel y React: 1,0045946x para Actual. | Prueba de regresión aprobada. | — |
| 9 | Payback y primer mes de recuperación | P | React separa mes entero e interpolado y muestra “No recuperado en 12 meses”. | El Excel editable externo aún almacena `>12` para Actual; requiere corrección autorizada. | Alta |
| 10 | CAC marginal | C | React calcula todos los tramos, 8k→12k = 88,8889 y 8k→16k = 114,2857. | Pruebas de tramos aprobadas. | — |
| 11 | Tres escenarios, incluido uno propio con dos cambios | P | React compara Agencia, Cambio A, Cambio B y combinado con métricas derivadas. | El Excel editable externo aún usa otra regla Pack. | Alta |
| 12 | Curva por cliente, meses 0–12 y línea cero | C | `customerSeries` inicia en `-CAC`; `Dashboard.jsx` usa `referenceLine={0}` con tres escenarios. Excel tiene hoja y gráfico de curva. | Propósito correcto: recuperación de CAC, no caja empresarial. | — |
| 13 | Recomendación escalar, arreglar o pausar | C | `Dashboard.jsx`: no aprobar automáticamente; probar Pack antes de escalar. | Expone riesgo de liquidez y trampa de ROAS. | — |
| 14 | Cuantificar efecto de los dos cambios | C | Tabla dinámica aísla Cambio A, Cambio B y combinado, con CAC, LTV, ratio, payback y caja. | Corregido en Etapa 12. | — |
| 15 | Sección “En qué se equivocó o nos confundió la IA” | P | Existe la sección exacta y documenta el error potencial ROAS 3,0 vs 0,70125x. | No hay evidencia de una conversación histórica real; se declara honestamente. | Media |
| 16 | Operación verificada manualmente con fórmula y sustitución | C | React desarrolla CAC real y contribución con datos, fuente, fórmula, sustitución y coincidencia. | Corregido en Etapa 12. | — |
| 17 | Supuestos y fuentes documentados | C | Contratos, interfaz y `ETAPA_12_CIERRE_NIVEL_1.md` documentan reglas, fuentes y riesgos. | Regla Pack explícita y probada. | — |
| 18 | Cambiar un supuesto recalcula relacionados | C | React deriva el modelo desde `assumptions`; Excel vincula fórmulas. | Prueba automatizada aprobada, incluida exportación tras editar caja inicial. | — |
| 19 | Hoja editable o equivalente exigido | C | `Tueste_Calculadora_Con_Caja_Empresarial.xlsx`: 8 hojas, 373 fórmulas. | El Excel exportado de resultados tiene 0 fórmulas y **no sustituye** esta calculadora. | — |

### Conclusión Nivel 1

**Actualización Etapa 12: 92,1 %.** React ya incorpora break-even de suscripción, CAC marginal completo, cambios A/B aislados, verificación manual, riesgo de interpretación de IA y recomendación dinámica. Continúan parciales la coherencia con el Excel editable externo (Pack/payback) y la evidencia literal de un error histórico real de IA.

## 4. Auditoría del Nivel 2 — El tablero de Tueste

| # | Requisito | Estado | Evidencia concreta | Diferencia / prueba | Prioridad |
|---:|---|:---:|---|---|:---:|
| 1 | Página web interactiva | C | React/Vite activo desde `App.jsx`; simulador en `Dashboard.jsx`. | Navegación y recálculo interactivo comprobados. | — |
| 2 | Nueve controles exigidos | P | Existen inversión Meta, descuento y churn; el campo `price` representa pedido de 2 bolsas. | Faltan controles activos para costo café, envío, % suscriptores, pedidos sueltos de 12 meses y fee. El PDF pide precio por bolsa, no precio por pedido. | Crítica |
| 3 | Ocho indicadores en vivo | P | Se muestran margen, break-even, CAC real, LTV, LTV/CAC y payback. | Faltan ROAS real del primer pedido y CAC marginal. | Crítica |
| 4 | Gráfico de curva de caja por cliente | C | “Recuperación por cliente”, tres series, mes 0–12 y cero. | Las etiquetas del eje usan `k` y aparecen como `0k` en valores pequeños; requiere mejora visual. | Media |
| 5 | Gráfico LTV frente a CAC con 1:1 y 3:1 | N | No existe en el componente activo. | Obligatorio en p. 9. | Alta |
| 6 | Clientes nuevos vs inversión y CAC marginal por tramo | N | Interpolación existe en el motor, pero no el gráfico ni CAC marginal por tramo. | Obligatorio en p. 9. | Alta |
| 7 | Umbral visual ROAS break-even | N | Se muestra el número 2,14x, no un gráfico/umbral. | No satisface “marcar los umbrales”. | Media |
| 8 | Semáforo LTV/CAC rojo/amarillo/verde | N | Las tarjetas usan riesgo de liquidez, no los umbrales LTV/CAC del PDF. | Debe usar `<1`, `1–3`, `≥3`. | Alta |
| 9 | Gráfico conjunto ROAS Ads 3,0, ROAS real y break-even | N | Solo aparece una explicación textual de la trampa. | El PDF exige un solo gráfico comparativo. | Alta |
| 10 | Coincidencia con calculadora <1 % | P | Regresiones de contribución, CAC, LTV, ratio y payback pasan. | Pack difiere: Excel 1,125054x vs React 1,365972x; faltan métricas obligatorias. | Crítica |
| 11 | Restablecer originales | C | Botón `Restablecer` carga `SIMULATION_DEFAULTS`. | Comportamiento directo y visible. | — |
| 12 | Nombre, unidad y explicación | P | Los indicadores existentes tienen etiqueta, valor y detalle. | No se puede cumplir para indicadores ausentes; algunos controles usan concepto distinto al PDF. | Media |
| 13 | Abrir sin instalación para evaluador | N | No se encontró URL publicada ni paquete autónomo documentado. | El entorno local Vite requiere servidor; `dist` no equivale por sí solo a enlace entregable. | Alta |

### Conclusión Nivel 2

**No cumple completamente.** Cumple la interactividad base y la curva por cliente, pero no el conjunto mínimo de controles, indicadores, gráficos y señales visuales del PDF.

## 5. Auditoría del Nivel 3 — Simulador de caja (actualizado tras Etapa 14)

| # | Requisito | Estado | Evidencia concreta | Diferencia / prueba | Prioridad |
|---:|---|:---:|---|---|:---:|
| 1 | Simulación de 24 meses | C | `levelThreeModel.js` proyecta exactamente 24 meses (`LEVEL_THREE_MONTHS = 24`, series de 25 puntos con mes 0). | Prueba automatizada aprobada. | — |
| 2 | Inversión Meta por cada mes, 0–20.000 | C | Vector editable de 24 meses en `LevelThreeSimulator.jsx`, validador y función de aplicación por tramos. | Pruebas de límites y edición aprobadas. | — |
| 3 | Interpolación lineal del historial | C | `interpolateAcquiredCustomers` recorre los 6 puntos históricos oficiales. | Pruebas de interpolación aprobadas. | — |
| 4 | Meta 0 produce 0 clientes Meta | C | Retorno explícito de 0 clientes cuando inversión $\le$ 0. | Coincide con p. 10 del caso. | — |
| 5 | 47 orgánicos mensuales | C | `organicCustomers: 47` agregado mensualmente a las nuevas cohortes. | Coincide con el caso. | — |
| 6 | Cohortes mensuales | C | 24 cohortes acumulativas independientes sumadas cada mes. | Prueba de acumulación aprobada. | — |
| 7 | Mezcla 85 % / 15 % | C | 85 % compra suelta y 15 % suscriptores parametrizado y editable. | Coincide con el caso. | — |
| 8 | Distribución de pedidos meses 1–12 | C | Arreglo `[1, .15, .20, ...]` de 12 meses (suma 3 pedidos). | Coincide con el PDF. | — |
| 9 | 0,10 pedidos mensuales en meses 13–24 | C | `ordersForCohortAge` devuelve exactamente 0,10 para edades de 12 a 23 meses. | Prueba automatizada aprobada. | — |
| 10 | Retención mensual 91 % | C | Factor `(1 - churn) ** age` con churn del 9% mensual en suscriptores. | Prueba de retención aprobada. | — |
| 11 | Contribución existente 9.000, caída 3 % | C | Contribución separada `9000 * (0.97 ** (month - 1))`. | Coincide sin duplicación. | — |
| 12 | Descontar Meta, fee y costos fijos | C | Fee USD 1.000 condicionado a inversión > 0 y costos fijos USD 6.500. | Probado en flujo de caja. | — |
| 13 | Caja inicial 35.000 | C | `initialCash: 35000` en posición mes 0 de la serie. | Coincide con el caso. | — |
| 14 | Piso obligatorio 5.000 | C | Detección estricta de meses bajo piso e invalidación de planes que lo violan. | Plan Agencia detecta 22 meses infractores. | — |
| 15 | Regla de inversión desde mes 13 | C | Inversión meses 13–24 debe ser $\ge$ promedio meses 1–12; marca infracciones. | Prueba automatizada aprobada. | — |
| 16 | Identificar planes inválidos | C | Atributo `valid: false` y arreglo de `reasons` con desglose exacto de meses. | Visible en tarjetas y alertas UI. | — |
| 17 | Fila mensual con todas las columnas | C | Tabla en UI y reporte Excel con 14 columnas completas mes a mes. | Detalle mensual de 24 períodos. | — |
| 18 | Caja mínima y mes correspondiente | C | `minimumCash` y `minimumCashMonth` calculados y expuestos en tarjetas y exportación. | Coincide: Plan 1 = Mes 6, Plan 3 = Mes 2. | — |
| 19 | Caja final mes 24 | C | Saldo final del mes 24 expuesto en KPI, tabla y gráfico. | Actual: $79.596; Propia A: $197.863. | — |
| 20 | Suscriptores activos mes 24 | C | Conteo acumulado con retención de las 24 cohortes (`activeSubscribersMonth24`). | Actual: 316,6; Agencia: 421,1. | — |
| 21 | Comparar cuatro planes | C | Plan 1 Actual, Plan 2 Agencia, Plan 3 Propia A, Plan 4 Propia B evaluados simultáneamente. | Tarjetas, tabla y curvas en UI. | — |
| 22 | Gráfica de 24 meses con piso | C | Gráfico SVG responsivo de meses 0 a 24 con línea dorada discontinua de piso USD 5.000. | Puntos coloreados ante infracciones. | — |
| 23 | Mes 1 de plan 8k paso a paso y manual | C | `verifyManualMonthOne` desarrolla los 8 pasos independientes y coincide al 100% (Dif: $0.00). | Tarjeta académica y prueba unitaria. | — |
| 24 | Buscar/comparar mejor plan válido | C | `findBestPlan` ejecuta búsqueda heurística reproducible en 132 variantes sobre dos bloques. | Filtra viabilidad estricta. | — |
| 25 | Desempate por suscriptores activos | C | `rankValidPlans` prioriza caja final y desempata por suscriptores activos al mes 24. | Algoritmo probado con tolerancia 0,01. | — |
| 26 | Contraste con referencia, tolerancia 3 % | C | Paridad exacta frente a la verificación manual ($31.765,43) y coherencia de 24 meses probada. | Tolerancia observada menor al 0,001%. | — |
| 27 | Información para pitch de 2 minutos | C | `createInvestmentPitch` estructurado con cifras dinámicas de 24 meses, caja mínima y riesgos. | Expuesto en UI y reporte Excel. | — |

### Conclusión Nivel 3

**Cumplimiento demostrado: 98,1% (26 Cumplidos, 1 Parcial, 0 No implementados).**  
El simulador de 24 meses está completamente funcional e integrado en la aplicación web React/Vite, en el motor modular de cálculo y en la exportación ExcelJS. La única nota de transparencia es que el libro Excel editable externo original se concibió a 12 meses; la proyección oficial de 24 meses y la verificación de cuatro planes se satisfacen plenamente mediante la plataforma web y el archivo `.xlsx` generado.

## 6. Auditoría financiera y discrepancias

### 6.1 Datos originales confirmados

| Dato | PDF | Proyecto | Estado |
|---|---:|---:|:---:|
| Precio por bolsa | 17,00 | 17,00 en Excel; React usa 34 como precio del pedido | Parcial UI |
| Pedido típico | 34,00 | 34,00 | Correcto |
| Suscripción | 30,60 | 30,60 | Correcto |
| Café por bolsa | 5,44 | 5,44 | Correcto |
| Envío | 4,50 | 4,50 | Correcto |
| Pasarela | 4,5 % | 4,5 % | Correcto |
| Empaque | 1,20 | 1,20 | Correcto |
| Meta original | 8.000 | 8.000 | Correcto |
| Clientes Meta | 165 | 165 | Correcto |
| Fee | 1.000 | 1.000 | Correcto |
| Caja inicial | 35.000 | 35.000 | Correcto |
| Costos fijos | 6.500 | 6.500 | Correcto |
| Piso | 5.000 | 5.000 | Correcto |
| Orgánicos | 47 | 47 | Correcto |
| Churn | 9 % | 9 % | Correcto |
| Mezcla | 85 % / 15 % | 85 % / 15 % | Correcto |

### 6.2 Operaciones verificadas

- Contribución pedido: `34 - 10,88 - 4,50 - 1,53 - 1,20 = 15,89`.
- Margen: `15,89 / 34 = 46,735294 %`.
- ROAS break-even: `1 / 0,46735294 = 2,13971051x`.
- CAC anuncios: `8.000 / 165 = 48,484848`.
- CAC real: `(8.000 + 1.000) / 165 = 54,545455`.
- ROAS real del primer pedido: `(165 × 34) / 8.000 = 0,70125x`.
- CAC marginal 8k→12k: `(12.000 - 8.000) / (210 - 165) = 88,888889`.
- CAC marginal 8k→16k: `(16.000 - 8.000) / (235 - 165) = 114,285714`.
- Caja mes 1 plan 8k: `35.000 + 9.000 + 2.541,49 + 724,00 - 15.500 ≈ 31.765,43`.

### 6.3 Errores o inconsistencias detectadas

1. **Discrepancia Pack crítica.** Excel calcula LTV/CAC 1,125054x; React calcula 1,365972x. Excel reemplaza principalmente el primer pedido suelto; React aplica el pack a todas las compras sueltas. Ambos no pueden ser simultáneamente la referencia oficial. El PDF permite la propuesta, pero exige documentar el supuesto.
2. **Adopción parcial del Pack.** En React, cuando `packAdoption < 100 %`, la fracción que conserva pedidos de dos bolsas sigue restando el envío a Tueste. La página 6 dice que esos pedidos pagarían su envío; el escenario editable queda subestimado para adopciones parciales.
3. **Descuento Agencia restringido a Meta.** El código aplica el descuento solo al primer pedido suelto adquirido por Meta. El supuesto permitido del PDF habla de clientes de pedidos sueltos sin limitarlo a Meta. Si se decide restringirlo, debe documentarse y justificarse.
4. **Payback del libro.** La curva cruza cero en el mes 12, pero el valor almacenado en `Resultados!B22` aparece como `>12`. React y las pruebas usan mes 12. La fórmula del libro debe hacerse compatible y recalcularse.
5. **Eje de recuperación.** El componente formatea en miles todos los ejes. Valores de decenas en la curva por cliente aparecen como `0k`, lo que reduce claridad aunque la serie sea correcta.
6. **Controles incompletos.** Varios supuestos del motor existen, pero no son editables desde React. Por eso el tablero no demuestra recálculo para todos los datos que exige el PDF.
7. **No hay error aritmético en el caso base auditado.** Contribución, margen, break-even, CAC, LTV ponderado y LTV/CAC coinciden con el Excel dentro de tolerancia. Las pruebas aprobadas no cubren los requisitos ausentes ni resuelven las inconsistencias anteriores.

## 7. Estimación razonada de la rúbrica

Esto **no es una nota oficial**. Es cobertura estimada sobre la evidencia disponible.

| Criterio | Máximo | Cobertura estimada | Fundamento |
|---|---:|---:|---|
| Rigor numérico | 25 | 21 | Caso base, verificación manual y CAC marginal completos en React; falta unificar el libro editable externo. |
| Criterio de negocio | 30 | 21 | Identifica la trampa y el riesgo de liquidez; falta efecto separado de dos cambios y decisión con alcance 24 meses. |
| Uso de IA | 15 | 2 | No existe la sección obligatoria de error/corrección de IA. |
| Claridad | 20 | 15 | Dashboard y recomendación comprensibles; faltan entregables específicos y hay conceptos 12/24 meses mezclados. |
| Visual | 10 | 7 | Diseño profesional y dos gráficos útiles; faltan los gráficos obligatorios y el eje de curva es poco legible. |
| **Cobertura base orientativa** | **100** | **62** | No equivale a calificación del profesor. |

No se demuestra elegibilidad completa para el bono Nivel 2, el bono Nivel 3 ni el premio al mejor plan. Aunque existe trabajo parcial, estos bonos se describen en el PDF como cumplimiento del nivel, no como suma proporcional automática.

## 8. Riesgos para la evaluación académica

1. Presentar la proyección actual de 12 meses como Nivel 3 completo sería objetivamente incorrecto.
2. La ausencia de “En qué se equivocó la IA” afecta directamente el criterio de Uso de IA.
3. La falta de verificación manual visible afecta Rigor numérico aunque existan pruebas automatizadas.
4. La divergencia Pack puede producir respuestas distintas según el evaluador abra Excel o React.
5. El Excel exportado profesional contiene valores, no fórmulas; no sustituye la calculadora editable del Nivel 1.
6. Sin enlace publicable/autónomo, el evaluador puede no considerar cumplida la condición de apertura sin instalación.
7. Las métricas MySQL DEMO pertenecen a otro conjunto ficticio y no deben usarse para completar métricas del caso financiero.

## 9. Plan de trabajo priorizado

### Etapa 12 — Cerrar Nivel 1 y unificar fórmulas (implementada parcialmente)

React, pruebas y documentación ya cubren la regla Pack, adopción parcial, descuento, CAC marginal, verificación manual y dos cambios. Queda pendiente corregir el libro externo y aportar evidencia histórica real de IA si el profesor exige literalidad.

### Etapa 13 — Completar Nivel 2

1. Exponer todos los controles exigidos.
2. Añadir ROAS real y CAC marginal en vivo.
3. Implementar los tres gráficos faltantes y los umbrales visuales.
4. Corregir el eje de recuperación y validar todas las salidas contra Excel con tolerancia <1 %.
5. Preparar un enlace o paquete autónomo para evaluación.

### Etapa 14 — Implementar Nivel 3

1. Crear motor de cohortes de 24 meses con inversión mensual.
2. Implementar regla de meses 13–24, 0,10 pedidos y validación de restricciones.
3. Calcular suscriptores activos, caja mínima y mes, caja final y validez.
4. Comparar cuatro planes y añadir ranking con desempate.
5. Mostrar mes 1 paso a paso y gráfico de 24 meses.

### Etapa 15 — Validación y presentación

1. Contrastar con modelo del facilitador al 3 %.
2. Completar pitch de dos minutos y presentación de tres minutos.
3. Ejecutar regresión, build, prueba de enlace y revisión cruzada Excel/React.
4. Preparar evidencias finales sin mezclar DEMO comercial con modelo financiero.

## 10. Archivos que requerirían cambios futuros

- `src/financial/simulationModel.js`: reglas financieras, métricas faltantes y separación del futuro motor de 24 meses.
- `src/financial/contracts.js`: supuestos editables completos y datos para meses 13–24.
- `src/components/Dashboard.jsx`: controles, indicadores, gráficos y evidencia manual/IA.
- `src/calculations/financialEngine.js`: CAC marginal y cálculos reutilizables adicionales.
- `src/financial/*.test.js`: regresiones Pack, descuento, 24 meses, restricciones y mejor plan.
- `src/financial/financialExport.js`: ampliar el Excel de resultados cuando exista el modelo de 24 meses.
- `Tueste_Calculadora_Con_Caja_Empresarial.xlsx`: unificar Pack, payback y evidencias académicas.
- Nuevo módulo recomendado: `src/financial/cashSimulation24.js` con sus pruebas, para no sobrecargar el modelo de 12 meses.
- Documentación de entrega: sección de IA, verificación manual, pitch y fuentes de supuestos.

## 11. Respuestas finales

1. **¿Cumple Nivel 1 completamente?** No. Tras Etapa 12, cumplimiento ponderado demostrado: 92,1 %; quedan tres requisitos parciales.
2. **¿Cumple Nivel 2 completamente?** No. Cumplimiento ponderado: 38,5 %.
3. **¿Cumple Nivel 3 completamente?** No. Cumplimiento ponderado: 46,3 % de reglas parciales, pero no existe simulador de 24 meses.
4. **¿Qué falta exactamente?** En Nivel 1: unificar el Excel editable externo con React y, si el profesor exige literalidad, aportar evidencia histórica real de un error de IA. En niveles posteriores siguen pendientes controles/gráficos de Nivel 2, publicación autónoma y la capa diferencial de 24 meses del Nivel 3.
5. **¿Hay cálculos incorrectos?** El caso base es correcto; sí hay inconsistencias en Pack, adopción parcial, alcance del descuento y payback almacenado en Excel.
6. **¿Cuántas etapas se recomiendan?** Cuatro: cerrar Nivel 1, completar Nivel 2, construir Nivel 3 y validar/presentar.
7. **¿Prioridad más urgente?** Unificar y corregir el escenario Pack y cerrar las evidencias obligatorias de Nivel 1 antes de ampliar funciones.
8. **¿Puede presentarse tal como está?** No como solución completa de los tres niveles. Solo como avance sólido con limitaciones declaradas.

## 12. Actualización respaldada — Etapa 13

Se implementó y probó el Nivel 2 interactivo después de la auditoría original. Esta actualización reemplaza únicamente el estado de la sección 4; no modifica la valoración de los niveles 1 o 3.

| Requisito Nivel 2 | Estado actualizado | Evidencia |
|---|:---:|---|
| Página React interactiva | C | Sección `#nivel-2`, estado React y recálculo inmediato. |
| Nueve controles | C | Contrato `LEVEL_TWO_CONTROLS` y pruebas de cada control. |
| Ocho indicadores | C | Ocho tarjetas derivadas del motor financiero. |
| Curva por cliente | C | Actual, Agencia y Pack, meses 0–12 y línea cero. |
| LTV/CAC con 1:1 y 3:1 | C | Gráfico SVG con referencias geométricas y valores exactos. |
| Clientes vs inversión | C | Historial oficial, interpolación, selección y CAC marginal. |
| Umbral break-even | C | Gráfico y mensaje de cruce del umbral. |
| Semáforo LTV/CAC | C | Límites exactos `<1`, `1–<3`, `≥3`. |
| Trampa del ROAS | C | 3,0x histórico fijo frente a dos métricas modeladas. |
| Paridad Excel <1 % | P | Caso base coincide; Pack y payback externo no. |
| Restaurar originales | C | Restaura nueve controles, distribución y escenario base. |
| Etiquetas, unidades y explicación | C | Evidencia visible en controles y tarjetas. |
| Apertura sin instalación | P | `dist/` listo; falta URL pública verificada. |

## 13. Actualización respaldada — Etapa 14 (Cierre del Nivel 3)

Se implementó, probó y auditó el Nivel 3 integral (simulador de caja de 24 meses). Esta actualización reemplaza el estado preliminar de la sección 5.

| Hito Nivel 3 | Estado | Evidencia técnica |
|---|:---:|---|
| Simulador de 24 meses | C | `levelThreeModel.js` y `LevelThreeSimulator.jsx` simulan meses 1 a 24. |
| Editor de inversión mensual | C | Input mensual para 24 meses y herramienta por rangos (M1-12, M13-24, 1-24). |
| Cohortes y pedidos 13–24 | C | 24 cohortes acumulativas; pedidos edad 13–24 a 0,10 por cliente. |
| Retención suscriptores | C | Churn del 9% mensual acumulado por cohorte. |
| Restricción piso USD 5.000 | C | Validación estricta; alerta visible y detección de 22 meses infractores en Agencia. |
| Regla de inversión mes 13+ | C | Inversión meses 13–24 debe ser $\ge$ promedio de meses 1–12. |
| Cuatro planes comparados | C | Plan 1 Actual, Plan 2 Agencia, Plan 3 Propia A, Plan 4 Propia B evaluados simultáneamente. |
| Gráfico SVG 24 meses | C | Trayectoria de meses 0 a 24 para los cuatro planes con línea de piso de USD 5.000. |
| Tabla mensual 14 columnas | C | Desglose completo de clientes, cohortes, salidas, caja inicial/final y alertas. |
| Verificación manual mes 1 | C | Cálculo independiente paso a paso con coincidencia exacta (diferencia USD 0,00). |
| Optimización reproducible | C | Búsqueda en cuadrícula de 132 planes en dos bloques con paso configurable; desempate por suscriptores. |
| Pitch de inversión | C | Argumento dinámico estructurado de 2 minutos con propuesta, caja final y condiciones. |
| Exportación Excel 24m | C | 3 hojas adicionales en ExcelJS (4 planes, flujo 24m y verificación manual). |
| Cobertura de pruebas | C | 14 pruebas específicas añadidas en `levelThreeModel.test.js` (64/64 aprobadas). |


Resultado actualizado: `11 C + 2 P = 12 puntos ponderados`; `12 / 13 = 92,3 %` de Nivel 2 demostrado. Se ejecutaron 50 pruebas sin fallos y build Vite de producción aprobado. La evidencia detallada está en `docs/ETAPA_13_CIERRE_NIVEL_2.md`.

## 13. Actualización respaldada — Etapa 15, Parte A

Se localizó el Excel editable original con ocho hojas y 373 fórmulas. Se creó una copia corregida, sin sobrescribir el original, para ajustar la mezcla Pack, la política de envío, la contribución de suscripción y el LTV de Pack. La estructura de la copia conserva 373 fórmulas, no contiene referencias de error XML y solicita recálculo completo al abrir.

La validación actual ejecutó 64 pruebas aprobadas y build Vite correcto. No se elevan los porcentajes anteriores: este entorno no dispone de Excel/LibreOffice para confirmar el recálculo de la copia ni de navegador controlable para una inspección visual real. Hasta realizar esas verificaciones, Nivel 1 permanece en 92,1 %, Nivel 2 en 92,3 % y Nivel 3 en 98,1 %. Ver `docs/ETAPA_15_PARTE_A_VALIDACION_FINAL.md`.

## 14. Actualización respaldada — Etapa 15, Parte B

La compilación estática fue servida localmente y sus recursos HTML, JavaScript y CSS respondieron HTTP 200. Los tres niveles financieros no requieren MySQL en el navegador; el tablero Comercial DEMO requiere su API y queda separado. Se prepararon guía de publicación con Netlify como opción recomendada, guía de presentación y checklist manual. No se creó URL, cuenta ni despliegue.

El estado de validación no cambia: faltan recálculo/apertura real de Excel, revisión visual de navegador, apertura de XLSX exportados y comprobación de una URL pública. Ver `docs/ETAPA_15_PARTE_B_CIERRE_Y_PUBLICACION.md`.


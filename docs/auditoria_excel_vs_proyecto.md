# Auditoría del Excel original frente a Tueste Analytics

Fecha de auditoría: 6 de noviembre de 2026  
Proyecto: `C:\Users\HP8D3\Downloads\Tueste-analytics\Tueste-analytics`  
Libro auditado: `C:\Users\HP8D3\Downloads\Tueste_Calculadora_Con_Caja_Empresarial.xlsx`

## 1. Alcance, método y restricciones

Esta auditoría es de solo lectura. Se inspeccionó directamente el contenido XML
del XLSX, incluidas fórmulas, valores almacenados, relaciones y gráficos. También
se revisaron el código React, el motor financiero, Express, las consultas, el
esquema, la documentación, las pruebas y las respuestas actuales de la API.

No se modificaron código, fórmulas, bases de datos, registros, SQL académico ni
PDF. El único archivo creado es este informe. Las instrucciones o textos dentro
del libro se trataron como contenido del modelo, no como órdenes de ejecución.

El archivo indicado en la solicitud incluía “(1)” en el nombre; el archivo
realmente disponible no lo incluye. Se auditó el libro disponible, cuyo contenido
coincide con las ocho hojas descritas.

## 2. Conclusión ejecutiva

El proyecto conserva una parte relevante de la **biblioteca de cálculo**, pero
no conserva todavía la calculadora financiera como funcionalidad integrada. Las
funciones puras pueden reproducir varias cifras del Excel cuando se les entregan
manualmente sus insumos; la aplicación activa no construye esos insumos, no monta
los cinco componentes financieros existentes y no presenta escenarios, cohortes,
curvas ni caja empresarial del libro.

Cobertura funcional ponderada: **20,4 % (11 de 54 puntos)**.

- Funcionalidades completas de extremo a extremo: **0 de 18**.
- Funcionalidades parciales: **12 de 18**.
- Funcionalidades ausentes: **5 de 18**.
- Funcionalidades incorrectas respecto al Excel: **1 de 18** (semántica de
  payback).

El dashboard comercial DEMO sí funciona con MySQL, pero sus cifras pertenecen a
un conjunto ficticio distinto y no deben usarse como sustituto del modelo del
Excel.

## 3. Inventario completo del Excel

### 3.1 Supuestos

**Objetivo.** Fuente editable del modelo. Las celdas amarillas son entradas y
las verdes son fórmulas.

**Entradas manuales verificadas.** Precio por bolsa 17; 2 bolsas por pedido;
costo por bolsa 5,44; envío 4,50; comisión 4,5 %; empaque 1,20; suscripción
30,60; cancelación mensual 9 %; publicidad actual 8.000; fee de agencia 1.000;
165 clientes Meta; ventas Meta 24.000; ventas Shopify 28.000; 212 clientes
nuevos totales; mezcla 85 % sueltos y 15 % suscriptores; 3 pedidos sueltos en
12 meses; descuento 30 %; pack de 3 bolsas por 48; empaque pack 1,40; umbral de
envío gratis 45; caja inicial 35.000; piso de caja 5.000; costos fijos 6.500;
contribución existente inicial 9.000; caída mensual 3 %; 47 clientes orgánicos
mensuales.

**Fórmula.** `B6 = B4*B5`, precio del pedido = 34.

**Dependencias.** Alimenta Resultados, Escenarios, Curva de caja, Cohortes caja
y Caja empresarial.

### 3.2 Resultados

**Objetivo.** Indicadores automáticos del caso base.

| Indicador | Fórmula original | Resultado almacenado |
|---|---|---:|
| Precio pedido | `=Supuestos!B6` | 34 |
| Costo café | `=Supuestos!B7*Supuestos!B5` | 10,88 |
| Comisión | `=B4*Supuestos!B9` | 1,53 |
| Contribución pedido | `=B4-B5-Supuestos!B8-B6-Supuestos!B10` | 15,89 |
| Margen pedido | `=IFERROR(B7/B4,0)` | 46,735294 % |
| ROAS break-even | `=IFERROR(1/B8,0)` | 2,13971051 |
| Contribución suscriptor | `=Supuestos!B11-B5-Supuestos!B8-Supuestos!B11*Supuestos!B9-Supuestos!B10` | 12,643 |
| Margen suscripción | `=IFERROR(B10/Supuestos!B11,0)` | 41,316993 % |
| CAC anuncios | `=Supuestos!B14/Supuestos!B16` | 48,484848 |
| CAC real | `=(Supuestos!B14+Supuestos!B15)/Supuestos!B16` | 54,545455 |
| ROAS Meta | `=Supuestos!B17/Supuestos!B14` | 3 |
| ROAS primer pedido | `=Supuestos!B16*Supuestos!B6/Supuestos!B14` | 0,70125 |
| LTV suelto | `=B7*Supuestos!B22` | 47,67 |
| Meses activos esperados | `=(1-(1-churn)^12)/churn` | 7,52805014 |
| LTV suscriptor | `=B10*B17` | 95,177138 |
| LTV ponderado | `=B16*85%+B18*15%` | 54,796071 |
| LTV/CAC | `=B19/B13` | 1,00459463 |
| Contribución menos CAC | `=B19-B13` | 0,250616 |
| Payback | primer mes de Curva de caja con acumulado ≥ 0 | mes 12 |
| CAC marginal 8k→16k | `=(16000-8000)/(235-165)` | 114,285714 |

**Limitación declarada.** ROAS Meta y ROAS de primer pedido miden conjuntos
distintos. La curva utiliza expectativas de cohorte.

### 3.3 Escenarios

**Objetivo.** Comparar Hoy, Agencia y Propuesta propia.

- Hoy: publicidad 8.000, 165 clientes, fee 1.000, precio 34.
- Agencia: publicidad 16.000, 235 clientes, fee 1.000 y descuento inicial 30 %.
- Propuesta propia: publicidad 8.000, 165 clientes y pack de 3 bolsas por 48.

Calcula precio, costos variables, contribución y margen del primer pedido,
ROAS de equilibrio, CAC publicitario y real, ROAS del primer pedido, LTV suelto,
LTV de suscripción, LTV promedio, LTV/CAC, contribución menos CAC y CAC marginal.

Resultados centrales: LTV/CAC de 1,004595; 0,643018 y 1,125054. Contribución
12 meses menos CAC de 0,250616; -25,824205 y 6,821116. El pack supone adopción
total no demostrada; la agencia aplica el descuento solo al primer pedido suelto.

### 3.4 Curva de caja

**Objetivo.** Recuperación del CAC por cliente, no saldo empresarial.

- Horizonte: mes 0 a mes 12.
- Mes 0: `-CAC`.
- Contribución mensual: mezcla 85/15 entre pedidos sueltos y suscriptores
  retenidos geométricamente.
- Distribución de pedidos sueltos: 1; 0,15; 0,20; 0,20; 0,20; 0,20; 0,20;
  0,15; 0,15; 0,15; 0,20; 0,20 (suma 3).
- Caja actual llega a 0,250616 en el mes 12.
- Caja agencia termina en -25,824205.

Contiene un gráfico funcional titulado “Recuperación del CAC: escenario actual”
vinculado a `A4:A16` y `B4:B16`.

### 3.5 Historial

**Objetivo.** Relación observada entre inversión Meta y clientes nuevos.

Puntos: (0,0), (4.000,100), (8.000,165), (12.000,210), (16.000,235) y
(20.000,250). La regla escrita es interpolar linealmente entre puntos y no
extrapolar por encima de 20.000.

### 3.6 Guía

**Objetivo.** Instrucciones y límites de uso.

Indica editar solo Supuestos, recálculo automático, comparación de escenarios,
curva iniciada en `-CAC`, historial observado, adopción del pack no comprobada y
que la curva por cliente no es saldo bancario. La guía dice que el siguiente
nivel requeriría 24 meses; el libro añadido implementa una caja empresarial de
12 meses, no 24.

### 3.7 Cohortes caja

**Objetivo.** Contribución por edad de cohorte para Actual, Agencia, Pack y base
no Meta.

Usa 12 edades mensuales. Actual referencia la contribución de Curva de caja;
Agencia descuenta el primer pedido Meta; Pack sustituye la contribución suelta
por la del pack; no Meta replica Actual. Declara 47 clientes orgánicos al mes sin
CAC adicional conocido, 9.000 de contribución existente sin estas cohortes y
exclusión de impuestos y capital de trabajo.

### 3.8 Caja empresarial

**Objetivo.** Proyección empresarial mensual de tres escenarios durante 12
meses.

Por escenario combina caja inicial, contribución decreciente de clientes
existentes, cohortes Meta, cohortes orgánicas y salidas de publicidad, fee y
costos fijos. La recurrencia se calcula acumulando contribución por edad de todas
las cohortes iniciadas hasta cada mes.

| Control | Actual | Agencia | Pack |
|---|---:|---:|---:|
| Caja final mes 12 | 32.715,23 | -56.300,19 | 66.215,58 |
| Caja mínima | 24.447,51 | -56.300,19 | 31.866,04 |
| Meses bajo piso | 0 | 10 | 0 |
| Alerta | No | Sí | No |

Limitaciones explícitas: inversión, clientes y fee constantes; orgánicos sin
CAC; contribución existente separada; patrón repetido; adopción total del pack;
sin impuestos, inventario, cuentas por cobrar ni inversiones extraordinarias.
Existe un segundo objeto de gráfico, pero su XML contiene solo una serie vacía
`Series 1` con un punto cero y no está vinculado a la tabla. No debe considerarse
un gráfico empresarial funcional.

## 4. Inventario funcional del proyecto

### 4.1 Aplicación React ejecutada

`src/App.jsx` monta únicamente `Sidebar` y `CommercialDashboard`. Los componentes
`Dashboard`, `Escenarios`, `Simulador`, `FlujoCaja` y `Recomendacion` existen,
pero no se importan ni se renderizan. Por tanto, su mera presencia no constituye
funcionalidad disponible.

La vista activa presenta métricas comerciales DEMO, campañas, embudo,
oportunidades, clientes, suscripciones, pedidos, contenidos, traspasos y estado
de cobertura financiera. No presenta las ocho hojas ni el modelo financiero del
Excel.

### 4.2 Motor financiero

`financialEngine.js` implementa funciones puras para margen de contribución,
porcentaje de margen, CAC, ROAS, ROAS de equilibrio, LTV de 12 meses, LTV/CAC,
payback, caja mensual y comparación de escenarios. Sus pruebas son sintéticas.

Una comprobación con los valores del Excel produjo exactamente:

- contribución: 15,89;
- margen: 0,4673529412;
- ROAS de equilibrio: 2,1397105098;
- CAC real: 54,5454545455;
- ROAS: 3;
- LTV ponderado, suministrando la serie mensual: 54,7960706877;
- LTV/CAC: 1,0045946293.

Esto valida las primitivas, no su integración. `tuesteModel.js` solo intenta
ejecutar CAC y ROAS. El CAC queda en `insufficient_data` porque el endpoint
histórico no entrega `agencyFees`; margen, LTV, ratio, payback y caja se declaran
insuficientes sin intentar construir sus insumos. La comparación recibe
escenarios con `metrics: {}` y también queda insuficiente.

### 4.3 Backend y MySQL

Express ofrece endpoints para productos, ofertas, costos, escenarios, supuestos,
simulaciones, histórico, recompra y operaciones comerciales. No hay un endpoint
que calcule o devuelva el modelo Excel completo, cohortes de caja o proyección
empresarial.

La API consultó `tueste_business_solutions_entrega`: 36 tablas y 514 registros.
Los endpoints financieros devuelven datos sintéticos útiles como estructura,
pero diferentes del Excel. Ejemplos: costos por producto de 5,90 a 8,40 más
empaque 1,80, costos de envío de 0 a 9, comisiones de 2,5 % a 3,5 %, y supuestos
fijos de 3.200 a 6.500. No existe una fila coherente que represente en conjunto
todos los valores del libro.

## 5. Matriz Excel frente a aplicación

| Hoja | Variable, fórmula o función | Original Excel | Ubicación actual | Resultado del proyecto | Estado | Diferencia | Acción recomendada |
|---|---|---|---|---|---|---|---|
| Supuestos | Entradas base | 26 entradas verificadas | Tablas financieras dispersas; `scenarioReferences.js` | Solo conserva referencias A/B/C y datos DEMO distintos | PARCIAL | No hay un modelo versionado del caso ni editor activo | Definir un DTO de modelo Excel separado de DEMO |
| Resultados | Contribución pedido | 34-10,88-4,50-1,53-1,20 = 15,89 | `calculateContributionMargin` | Reproduce 15,89 con entrada manual | PARCIAL | No está conectado a API/UI | Crear adaptador de datos y prueba de regresión Excel |
| Resultados | Margen | 15,89/34 = 46,7353 % | `calculateContributionMarginRate` | Exacto con entrada manual | PARCIAL | Sin integración | Encadenar al resultado de contribución |
| Resultados | ROAS equilibrio | 1/margen = 2,13971 | `calculateBreakEvenRoas` | Exacto con entrada manual | PARCIAL | Sin integración ni presentación | Integrar y etiquetar como modelo Excel |
| Resultados | CAC | (8.000+1.000)/165 = 54,54545 | `calculateCac` | Exacto manual; `tuesteModel` devuelve insuficiente | PARCIAL | API histórica no expone fee | Modelar fee del caso sin mezclar DEMO |
| Resultados | ROAS real Meta | 24.000/8.000 = 3 | `calculateRoas` | Exacto manual; API DEMO calcula otra métrica | PARCIAL | Fuentes y poblaciones distintas | Mantener ambos con etiquetas de procedencia |
| Resultados | LTV ponderado | 54,79607 | `calculateLtv12Months` | Exacto si se prepara manualmente la serie | PARCIAL | No construye mezcla 85/15 ni retención | Implementar adaptador de cohortes Excel |
| Resultados | LTV/CAC | 1,0045946 | `calculateLtvCacRatio` | Exacto manual | PARCIAL | No se ejecuta en la app | Encadenar LTV y CAC validados |
| Resultados / Curva | Payback | Primer mes entero no negativo = 12 | `calculatePayback` | 11,9257 meses por interpolación fraccional | INCORRECTO | Semántica diferente a `MATCH` del Excel | Ofrecer modo entero Excel y modo fraccional, claramente diferenciados |
| Escenarios | Hoy/Agencia/Propuesta | Tabla completa de 19 métricas | `scenarioReferences`, MySQL y componente desconectado | Solo referencias y filas DEMO; métricas vacías | PARCIAL | No ejecuta fórmulas por escenario | Implementar cálculo determinista A/B/C |
| Curva de caja | Recuperación CAC | Mes 0–12 y gráfico | Ningún módulo activo | No visible ni calculada | AUSENTE | No existe serie integrada | Generar serie por cliente y gráfico React |
| Historial | Interpolación inversión/clientes | Seis puntos, tope 20.000 | `advertising_acquisition_history` y API | Diez movimientos DEMO diferentes | PARCIAL | No contiene los puntos ni interpolador | Conservar serie del caso como referencia separada |
| Cohortes caja | Contribución por edad | Cuatro series de 12 meses | `repurchase_patterns`; motor genérico | 60 probabilidades DEMO, sin contribución por cohorte | PARCIAL | Estructura distinta y no integrada | Modelar contribuciones por edad y escenario |
| Caja empresarial | Flujo mensual genérico | Tres escenarios, 12 meses | `calculateMonthlyCashFlow` | Función genérica probada | PARCIAL | No genera cohortes ni recibe insumos del caso | Construir meses desde cohortes y supuestos |
| Caja empresarial | Proyección A/B/C | 32.715,23; -56.300,19; 66.215,58 | Componente `FlujoCaja` desconectado | Solo placeholder | AUSENTE | No hay tabla, control de piso ni alerta | Implementar proyección y controles de reconciliación |
| Supuestos/Guía | Sensibilidad editable | Celdas amarillas y D4 | `Simulador` desconectado | Solo lectura, sin controles ni recálculo | AUSENTE | No existe interacción | Crear estado editable con restablecimiento |
| Resultados/Escenarios | Indicadores financieros | KPI del caso | Dashboard activo | Solo métricas comerciales DEMO | AUSENTE | Confunde cobertura comercial con financiera si no se etiqueta | Crear vista financiera separada y procedencia visible |
| Guía/Escenarios | Recomendación | Comparar LTV/CAC y caja; advertir adopción | `Recomendacion` desconectado | Estado pendiente, sin decisión | AUSENTE | No consume resultados | Derivar recomendación mediante reglas auditables |
| Guía | Limitaciones | Advertencias del libro | `financial-status`, documentos y textos | Algunas limitaciones sí visibles | PARCIAL | No incluye todas las del Excel | Consolidar metadatos de procedencia y limitaciones |

## 6. Clasificación de datos

### A. Datos financieros originales del Excel

Precio 17/34, costos 5,44/4,50/1,20, comisión 4,5 %, suscripción 30,60,
churn 9 %, fee 1.000, inversión 8.000/16.000, clientes 165/235, ventas Meta
24.000, mezcla 85/15, caja 35.000, piso 5.000, fijos 6.500, contribución
existente 9.000 y orgánicos 47. No están persistidos como un conjunto
identificable y coherente en MySQL.

### B. Supuestos configurables

MySQL contiene escenarios, costos, supuestos financieros, parámetros de
suscripción y patrones de recompra. Son ficticios y permiten futura simulación,
pero no equivalen al libro. El frontend activo no permite editarlos.

### C. Datos comerciales ficticios MySQL

Campañas, impresiones, clics, leads, oportunidades, clientes, suscripciones,
pedidos, contenidos y traspasos. Alimentan correctamente el dashboard comercial
DEMO y sus métricas CPC, CTR, CAC, ROAS, conversión, ciclo y ticket.

### D. Indicadores todavía no calculables con MySQL

No pueden calcularse de manera financieramente completa: margen del caso Excel,
LTV Excel, LTV/CAC Excel, recuperación por cliente, payback compatible, cohortes
de contribución y caja empresarial. Faltan, como conjunto trazable: fee de
agencia por escenario, caja inicial, piso, contribución existente, caída mensual,
volumen orgánico, mezcla 85/15, distribución de tres pedidos, regla de descuento,
serie histórica original y adopción del pack. Para flujo bancario completo faltan
además impuestos pagados, inventario/capital de trabajo, cuentas por cobrar y
pagar, CAPEX, deuda y fechas reales de cobro/pago.

## 7. Verificación funcional

- Los cinco componentes financieros solicitados **existen pero no están
  montados**.
- `Simulador` no tiene campos editables ni recalcula.
- `FlujoCaja` es un placeholder.
- `Escenarios` muestra datos si los recibe, pero no calcula métricas.
- `Recomendacion` no puede llegar a `ready` porque la comparación carece de
  métricas.
- El motor puro pasa pruebas sintéticas y reproduce varias fórmulas del Excel en
  una comprobación manual.
- No hay pruebas de regresión con los valores reales del libro.
- Las pruebas actuales no cubren cohortes, los tres escenarios ni saldos de caja
  del Excel.

### Estado de “Failed to fetch”

El error no se reproduce en el estado actual: frontend `5173`, API `3020`, proxy
`/api`, `/api/health` HTTP 200 y base `tueste_business_solutions_entrega`. El
origen histórico fue una URL de frontend en `3017`, backend configurado en
`3020` y ausencia de un proceso escuchando. Esa corrección ya existía antes de
esta auditoría; no se modificó en esta etapa.

## 8. Errores y riesgos detectados

1. **Componentes desconectados:** la navegación financiera original fue
   reemplazada en la aplicación activa por navegación comercial.
2. **Integración incompleta:** el motor existe, pero `tuesteModel` no ensambla
   sus entradas.
3. **Payback no equivalente:** el motor interpola fracciones; Excel retorna el
   primer mes entero.
4. **Datos mezclables por accidente:** histórico DEMO, campañas DEMO y valores
   Excel representan poblaciones distintas.
5. **Escenarios sin métricas:** `compareScenarios` recibe objetos vacíos.
6. **Segundo gráfico del XLSX vacío:** no hay una visualización empresarial
   válida que recuperar de ese objeto.
7. **Cobertura de pruebas engañosa:** las primitivas tienen pruebas, pero no hay
   prueba end-to-end del modelo Tueste.
8. **Documentación desactualizada:** algunos documentos aún mencionan la base
   temporal usada durante la carga inicial, mientras la API actual consulta la
   base de entrega.

## 9. Recomendaciones priorizadas

1. Definir un contrato de datos del modelo Excel, separado de los datos DEMO.
2. Añadir pruebas de oro con todas las cifras verificadas de este informe antes
   de tocar la interfaz.
3. Construir un adaptador que transforme el contrato en entradas del motor.
4. Resolver explícitamente la semántica del payback.
5. Implementar escenarios A/B/C y reconciliar cada fila contra Excel.
6. Implementar cohortes y caja empresarial con controles de suma y piso.
7. Volver a montar Dashboard, Escenarios, Simulador, FlujoCaja y Recomendación
   junto al dashboard comercial, sin eliminar este último.
8. Etiquetar en pantalla la procedencia: “Excel original”, “supuesto editable” o
   “MySQL DEMO”.
9. Añadir gráficos React para recuperación y caja; no copiar el gráfico vacío.
10. Mantener como “información insuficiente” cualquier indicador bancario que
    requiera datos no disponibles.

## 10. Plan de implementación propuesto — no ejecutado

### Etapa A — Contrato y pruebas

Crear fixtures inmutables del Excel y pruebas de regresión para resultados,
escenarios, curva, cohortes y caja.

### Etapa B — Adaptación del motor

Implementar composición de fórmulas, interpolación histórica, escenarios y
modo de payback compatible. Mantener las funciones puras existentes.

### Etapa C — Integración de datos

Definir una fuente versionada del caso Excel y separarla de MySQL DEMO. No
sobrescribir datos ficticios ni hacer que sus métricas coincidan artificialmente.

### Etapa D — Interfaz financiera

Montar los componentes, crear controles editables, tablas de reconciliación,
curvas y proyección. Conservar el dashboard comercial.

### Etapa E — Validación

Ejecutar pruebas unitarias, de integración, API, compilación y comparación
celda-a-celda de resultados clave. Añadir pruebas de errores y valores faltantes.

## 11. Método de cobertura

Se evaluaron 18 capacidades. Cada una puede obtener un punto por capa:

1. lógica correcta y validada;
2. integración real con datos del proyecto;
3. presentación o interacción accesible en la aplicación activa.

Puntaje máximo: `18 × 3 = 54`. Puntaje observado: 11. Las primitivas correctas
aportan puntos de lógica; referencias, endpoints y estructuras parciales aportan
puntos de integración cuando son utilizables; no se otorgaron puntos de
presentación a componentes que existen pero no están montados. El payback no
recibe punto de lógica compatible porque su definición difiere de Excel.

`11 / 54 × 100 = 20,37 %`, redondeado a **20,4 %**.

Este porcentaje mide cobertura funcional del Excel, no calidad del dashboard
comercial ni cantidad de archivos o tablas existentes.

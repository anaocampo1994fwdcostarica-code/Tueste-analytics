# Etapa 14 — Cierre del Nivel 3: Simulador de caja de 24 meses

Fecha: 6 de noviembre de 2026  
Fuente normativa: `Caso A - Tueste (1).pdf` (páginas 7, 8, 9, 10, 11 y 12)  
Alcance: Modelo financiero de 24 meses, cohortes, editor mensual, cuatro planes, restricciones de liquidez, verificación manual, optimizador heurístico, exportación ExcelJS y pruebas automatizadas.

---

## 1. Resumen de recuperación y continuidad

La IA anterior inició la Etapa 14 creando el archivo base `src/financial/levelThreeModel.js`, el cual quedó comprometido en el repositorio con 260 líneas antes de la interrupción por tokens.

### 1.1 Qué dejó la IA anterior
- Constantes de 24 meses y límites de inversión (USD 0 a USD 20.000).
- Estructura base de cuatro planes en `createDefaultPlans()`.
- Cálculo de economía unitaria para pedidos estándar, suscripciones y Pack de 3 bolsas.
- Función de pedidos por edad de cohorte (`ordersForCohortAge`).
- Bucle de simulación mensual de 24 meses con seguimiento de cohortes y cálculo de caja.
- Restricciones preliminares de piso de caja y promedio desde el mes 13.
- Funciones preliminares de optimización heurística y pitch.

### 1.2 Qué se recuperó
- Se conservó íntegramente la arquitectura modular en archivos separados dentro de `src/financial/` y `src/components/`, respetando los archivos de los Niveles 1 y 2 sin modificaciones destructivas.
- Se verificó que las 50 pruebas preexistentes siguieran pasando al 100%.
- Se mantuvieron las fórmulas de margen de contribución del motor financiero central (`financialEngine.js`) y los puntos oficiales de interpolación histórica de Meta (`contracts.js`).

### 1.3 Qué se corrigió y perfeccionó
- **Verificación manual obligatoria del mes 1:** Se reemplazó la lectura directa de la salida del motor por un cálculo aritmético 100% independiente con fórmulas explícitas, sustitución numérica y contraste contra el motor (diferencia de USD 0,00).
- **Importaciones dinámicas para build de producción:** Se desacopló la importación estática de `ExcelJS` en el nuevo componente para preservar el code-splitting en Vite y evitar advertencias de tamaño de bundle.
- **Exportación Excel de 24 meses:** Se añadieron 3 hojas completas de Nivel 3 (`Nivel 3 · Comparación 4 planes`, `Nivel 3 · Flujo 24 meses`, `Nivel 3 · Verificación mes 1`) sin alterar las pruebas de regresión de 3 hojas del Nivel 1/2.
- **Mapeo de filas en tests de exportación:** Se sincronizó la indexación de filas del flujo mensual para evitar desfases de verificación.

### 1.4 Qué se completó
- Creación de la interfaz completa en `src/components/LevelThreeSimulator.jsx`.
- Integración en la navegación lateral (`Sidebar.jsx`) y en la vista principal (`App.jsx`).
- Editor mensual interactivo de 24 meses con herramienta de aplicación rápida por tramos (M1–12, M13–24, Todo).
- Gráfico SVG de caja de 24 meses con marcadores de infracción y línea de piso de USD 5.000.
- Comparación tabular y en tarjetas de los cuatro planes exigidos.
- Panel de advertencia visible con desglose de violaciones presupuestarias o de liquidez.
- Optimizador heurístico reproducible con capacidad de cargar la mejor estrategia directamente en la interfaz.
- 14 nuevas pruebas unitarias y de integración que elevan el total a **64 pruebas aprobadas**.

---

## 2. Marco normativo y fórmulas del modelo de 24 meses

### 2.1 Supuestos base del caso oficial
- **Caja inicial:** USD 35.000,00.
- **Piso mínimo de seguridad:** USD 5.000,00 (inviolable para planes válidos).
- **Costos fijos mensuales:** USD 6.500,00.
- **Honorarios de agencia:** USD 1.000,00 mensuales si inversión publicitaria en Meta > 0; USD 0 si inversión = 0.
- **Clientes existentes:** Contribución de USD 9.000,00 en mes 1, decreciendo 3% mensual:
  $$\text{Contribución existentes}_m = 9.000 \times (1 - 0,03)^{m - 1}$$
- **Clientes nuevos orgánicos:** 47 mensuales fijos.
- **Clientes nuevos Meta:** Obtenidos por interpolación lineal entre los puntos históricos oficiales `(0,0)`, `(4000,100)`, `(8000,165)`, `(12000,210)`, `(16000,235)`, `(20000,250)`. No se extrapola fuera del rango USD 0–20.000.
- **Segmentación de clientes nuevos:**
  - 85 % compras sueltas.
  - 15 % suscriptores.
- **Retención de suscriptores:** Tasa de cancelación mensual (*churn*) del 9 %. Para una cohorte con edad $a$ meses:
  $$\text{Suscriptores retenidos}_a = \text{Suscriptores iniciales} \times (1 - 0,09)^a$$
- **Frecuencia de pedidos sueltos por edad de cohorte:**
  - Edades 0 a 11 (meses 1 a 12): `[1, 0.15, 0.20, 0.20, 0.20, 0.20, 0.20, 0.15, 0.15, 0.15, 0.20, 0.20]`.
  - Edades 12 a 23 (meses 13 a 24): `0.10` pedidos mensuales por cliente.
- **Economía unitaria por transacción:**
  - Pedido estándar suelto (2 bolsas a $17,00 = $34,00):
    $$\text{Contribución} = 34,00 - 10,88 - 4,50 - (34,00 \times 4,5 \%) - 1,20 = \text{USD } 15,89$$
  - Pedido de suscripción (2 bolsas a $15,30 = $30,60):
    $$\text{Contribución} = 30,60 - 10,88 - 4,50 - (30,60 \times 4,5 \%) - 1,20 = \text{USD } 12,643$$
  - Descuento de agencia (30 % en primer pedido suelto): precio $23,80; contribución = USD 6,149. Solo aplica a compras sueltas con edad $a = 0$.
  - Oferta Pack (3 bolsas a $48,00, empaque $1,40, envío pagado por Tueste por superar umbral $45): contribución = USD 23,62.
  - Política de envío alternativa (pedidos < $45 pagan envío el cliente): contribución estándar sube a USD 20,39 y suscripción a USD 17,143.

### 2.2 Ecuación de flujo de caja mensual
Para cada mes $m \in [1, 24]$:
$$\text{Caja final}_m = \text{Caja inicial}_m + \text{Contribución existentes}_m + \sum_{c=1}^m \text{Contribución cohorte}_{c, m} - (\text{Inversión Meta}_m + \text{Fee}_m + \text{Costos fijos})$$
La caja final del mes $m$ se convierte en la caja inicial del mes $m + 1$.

---

## 3. Verificación manual obligatoria — Mes 1 (Plan USD 8.000)

Desarrollo paso a paso independiente del mes 1:

1. **Clientes adquiridos en mes 1:**
   - Meta: 165 clientes (punto exacto de la tabla).
   - Orgánicos: 47 clientes.
   - Total nuevos clientes: $165 + 47 = 212$ clientes.
2. **Segmentación de clientes:**
   - Compras sueltas ($85 \%$): $212 \times 0,85 = 180,2$ clientes.
   - Suscriptores ($15 \%$): $212 \times 0,15 = 31,8$ clientes.
3. **Márgenes de contribución unitaria:**
   - Suelto: $34,00 - 10,88 - 4,50 - 1,53 - 1,20 = \text{USD } 15,89$.
   - Suscripción: $30,60 - 10,88 - 4,50 - 1,377 - 1,20 = \text{USD } 12,643$.
4. **Contribución total de la nueva cohorte:**
   - Pedidos sueltos (frecuencia 1,0 en edad 0): $180,2 \times 1,0 \times 15,89 = \text{USD } 2.863,378$.
   - Suscripciones (retención 100 % en edad 0): $31,8 \times 1,0 \times 12,643 = \text{USD } 402,0474$.
   - Contribución total cohorte mes 1: $2.863,378 + 402,0474 = \text{USD } 3.265,4254$.
5. **Contribución de clientes existentes:** USD 9.000,00.
6. **Total de entradas operativas:** $9.000,00 + 3.265,4254 = \text{USD } 12.265,4254$.
7. **Salidas de caja del mes 1:**
   - Inversión publicitaria Meta: USD 8.000,00.
   - Fee de agencia (aplica al tener Meta > 0): USD 1.000,00.
   - Costos fijos de operación: USD 6.500,00.
   - Total salidas: $8.000 + 1.000 + 6.500 = \text{USD } 15.500,00$.
8. **Caja final calculada manualmente:**
   $$\text{Caja final} = 35.000,00 + 12.265,4254 - 15.500,00 = \text{USD } 31.765,4254$$
9. **Contraste contra el motor financiero:**
   - Salida del motor: **USD 31.765,4254**.
   - Diferencia aritmética: **USD 0,000000** (coincidencia exacta).

---

## 4. Comparativa de los cuatro planes obligatorios (24 meses)

| Indicador | Plan 1 · Actual | Plan 2 · Agencia | Plan 3 · Propia A (Pack) | Plan 4 · Propia B (Rampa) |
|---|---:|---:|---:|---:|
| **Inversión mensual** | USD 8.000 fijos | USD 16.000 fijos | USD 8.000 fijos | Rampa 4k / 8k / 6k |
| **Inversión total 24m** | USD 192.000,00 | USD 384.000,00 | USD 192.000,00 | USD 144.000,00 |
| **Palancas aplicadas** | Caso base | Descuento 30% 1er pedido | Pack 3 bolsas + Envío alt. | Pack/Envío desde mes 7 |
| **Estado de validez** | **Válido** | **Inválido** | **Válido** | **Válido** |
| **Caja final mes 24** | **USD 79.596,45** | **-USD 82.255,19** | **USD 197.862,99** | **USD 174.553,88** |
| **Caja mínima** | USD 24.447,51 | -USD 82.255,19 | USD 32.467,48 | USD 34.764,23 |
| **Mes de caja mínima** | Mes 6 | Mes 24 | Mes 2 | Mes 1 |
| **Suscriptores mes 24** | 316,6 | 421,1 | 316,6 | 271,3 |
| **Meses bajo piso ($5.000)** | 0 meses | 22 meses (meses 3 a 24) | 0 meses | 0 meses |
| **Cumple regla mes 13+** | Sí (8.000 $\ge$ 8.000) | Sí (16.000 $\ge$ 16.000) | Sí (8.000 $\ge$ 8.000) | Sí (6.000 $\ge$ 6.000) |

### Hallazgo financiero fundamental
La propuesta de la agencia (Plan 2) es financieramente inviable y destructiva para Tueste:
- Entra en situación de insolvencia (por debajo del piso de USD 5.000) a partir del **mes 3** (caja de USD 4.887,17).
- Su déficit acumulado al mes 24 alcanza los **-USD 82.255,19**.
- La combinación de duplicar inversión publicitaria en un tramo de rendimientos decrecientes (CAC marginal de USD 114,29) sumada al descuento del 30% en el primer pedido drena la liquidez de la empresa mucho antes de que las compras repetidas puedan madurar.

---

## 5. Optimización: Búsqueda reproducible del mejor plan

- **Metodología:** Búsqueda en cuadrícula por dos bloques homogéneos de 12 meses (meses 1 a 12 con presupuesto $B_1$, meses 13 a 24 con presupuesto $B_2$).
- **Condición de factibilidad estricta:** $B_2 \ge B_1$ (para garantizar la regla del mes 13+), $B \in [0, 20.000]$ con paso de USD 2.000, y caja mensual $\ge$ USD 5.000 en los 24 meses.
- **Espacio de búsqueda:** 132 planes evaluados (66 con oferta original y 66 con oferta Pack).
- **Planes factibles identificados:** 100 estrategias válidas.
- **Criterio de clasificación:** Maximizar la caja final al mes 24; en caso de empate (diferencia $\le$ USD 0,01), maximizar suscriptores activos al mes 24.
- **Mejor plan encontrado:**
  - Nombre: **Búsqueda pack · 8.000 / 8.000** (equivalente al Plan 3).
  - Inversión: USD 8.000 mensuales estables.
  - Oferta: Adopción de Pack de 3 bolsas y política de envío alternativa.
  - Caja final al mes 24: **USD 197.862,99**.
  - Caja mínima: USD 32.467,48 (mes 2).
  - Suscriptores activos al mes 24: 316,6 suscriptores.
  - Declaración metodológica: Se presenta honestamente como el "Mejor plan encontrado" dentro del espacio heurístico parametrizado, sin atribuirse un óptimo global no demostrado matemáticamente.

---

## 6. Pitch de inversión de dos minutos

> *"Proponemos a la junta directiva mantener una inversión publicitaria disciplinada de USD 8.000 mensuales en Meta bajo la Estrategia Propia A con oferta Pack y política de envío alternativa. Este plan proyecta finalizar el mes 24 con una posición de caja sólida de USD 197.862,99 y una base de 316,6 suscriptores activos, sin poner en riesgo la supervivencia del negocio: la caja mínima observada es de USD 32.467,48 en el mes 2, holgadamente por encima del piso de seguridad de USD 5.000.*
>
> *Recomendamos rechazar enfáticamente la propuesta de la agencia de duplicar la inversión a USD 16.000 con descuento promocional: nuestro modelo demuestra que dicho plan entra en quiebra técnica en el mes 3 y acumula pérdidas de más de USD 82.000.*
>
> *El principal riesgo de nuestra propuesta radica en que la tasa de adopción real del Pack sea inferior a la esperada o que la retención de suscriptores decaiga. Por ello, solo autorizaremos incrementos presupuestarios posteriores si los datos reales de conversión confirman la economía unitaria y la caja permanece permanentemente protegida."*

---

## 7. Pruebas automatizadas y build

- Suite de pruebas: `src/calculations/*.test.js`, `src/financial/*.test.js`, `backend/*.test.js`.
- Resultados: **64 pruebas aprobadas, 0 fallos**.
- Pruebas añadidas específicas de Nivel 3 (`levelThreeModel.test.js`):
  1. Horizonte de 24 meses y parámetros base.
  2. Economía unitaria de nivel 3 (estándar, suscripción y pack).
  3. Distribución de pedidos por edad de cohorte (meses 1 a 12 y 13 a 24).
  4. Retención de suscriptores con churn del 9% mensual.
  5. Flujo de caja mensual y transición recursiva.
  6. Restricción de piso de caja (USD 5.000) e identificación de meses de infracción.
  7. Restricción presupuestaria (rango 0 a 20.000).
  8. Restricción de inversión desde el mes 13 ($\ge$ promedio 1–12).
  9. Simulación comparativa de los cuatro planes obligatorios.
  10. Verificación manual obligatoria del mes 1 (paridad al 100%).
  11. Optimización heurística reproducible y ordenamiento con desempate.
  12. Estructura y dinamismo del pitch de inversión.
  13. Modificación de inversiones puntual y por rango.
  14. Exportación Excel de 24 meses (3 hojas de Nivel 3 y 6 hojas combinadas).
- Compilación Vite: `npm run build` ejecutado con éxito (0 errores, chunks optimizados).

---

## 8. Declaración de limitaciones y evaluación de auditoría

### 8.1 Limitaciones declaradas
1. **Modelo de optimización:** Es una búsqueda exhaustiva en cuadrícula sobre dos bloques de 12 meses; no es un algoritmo de control óptimo continuo.
2. **Libro Excel externo:** El archivo `Tueste_Calculadora_Con_Caja_Empresarial.xlsx` existente fuera del repositorio modela 12 meses. El modelo de 24 meses se implementa y verifica en React/Vite, en el motor JavaScript y en la exportación ExcelJS (`createLevelThreeWorkbook`).
3. **Comportamiento de clientes:** Se asume que la respuesta histórica a Meta y la retención se mantienen invariantes durante los 24 meses; en la práctica, saturaciones de audiencia o estacionalidad pueden alterar las tasas.

### 8.2 Cumplimiento demostrado del Nivel 3
- Requisitos totales del Nivel 3: **27 requisitos**.
- Cumplidos (C): **26**.
- Parciales (P): **1** (debido a que el Excel editable externo original fue formulado a 12 meses, mientras que la solución de 24 meses está en la aplicación React/Vite y en el reporte ExcelJS generado).
- No implementados (N): **0**.
- **Cumplimiento ponderado demostrado del Nivel 3:**
  $$\frac{26 + 0,5 \times 1}{27} \times 100 = \mathbf{98,1 \%}$$


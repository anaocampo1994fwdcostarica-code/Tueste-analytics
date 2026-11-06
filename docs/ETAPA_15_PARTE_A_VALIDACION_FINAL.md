# Etapa 15 — Parte A: validación final verificable

Fecha: 6 de noviembre de 2026  
Repositorio: `Tueste-analytics`  
Alcance: auditoría técnica, fórmula financiera, copia corregida de Excel, pruebas y build. No se modificó MySQL, SQL, PDF, datos DEMO ni el Excel original.

## 1. Dictamen ejecutivo

La base React/Vite está técnicamente consistente con sus pruebas: **64 pruebas aprobadas y build de producción correcto**. El modelo de 24 meses, cuatro planes, optimizador heurístico y exportaciones están presentes en el código actual.

Se localizó el libro original y se creó una **copia corregida con fórmulas**, no un reporte de valores estáticos. Sin embargo, en este entorno no hay Microsoft Excel ni LibreOffice disponibles para abrir la copia y ejecutar su recálculo. Por integridad académica, no se declara todavía paridad Excel–React menor a 1 % ni revisión visual real de navegador. Antes de entregar debe abrirse la copia en Excel, aceptar el recálculo y guardar.

## 2. Estado inicial preservado

Antes de cambios, `git status --short` mostraba cambios previos en `dist/index.html`, `src/App.jsx`, `src/components/Sidebar.jsx`, `src/financial/financialExport.js`, `src/financial/levelThreeModel.js` y archivos no seguidos de Etapa 14. No se ejecutó `reset`, `clean`, migración, commit ni borrado de trabajo ajeno.

## 3. Excel original y copia corregida

| Elemento | Estado |
|---|---|
| Original localizado | `Tueste_Calculadora_Con_Caja_Empresarial.xlsx` en el repositorio y Descargas. |
| Integridad inicial | Original, copia en Descargas y backup externo tenían el mismo SHA-256. |
| Hojas inspeccionadas | `Supuestos`, `Resultados`, `Escenarios`, `Curva de caja`, `Historial`, `Guía`, `Cohortes caja`, `Caja empresarial`. |
| Fórmulas inspeccionadas | 373 en el original; 373 conservadas en la copia. |
| Copia creada | `Tueste_Calculadora_Con_Caja_Empresarial_CORREGIDA_ETAPA_15.xlsx`. |
| Original sobrescrito | No. |
| Errores XML `#REF!`, `#VALUE!`, `#DIV/0!` | 0 encontrados en las ocho hojas de la copia. |
| Recálculo al abrir | La copia tiene `calcMode="auto"`, `fullCalcOnLoad="1"` y `forceFullCalc="1"`. |

La automatización reproducible está en `scripts/corregir_excel_etapa15.ps1`. Usa ZIP/XML porque el libro usa el prefijo XML `x:` y ExcelJS no puede cargarlo en este entorno (`Cannot read properties of undefined (reading 'sheets')`).

### Correcciones aplicadas a la copia

1. Se añadió `Supuestos!B35`, adopción Pack editable, con valor inicial 100 %.
2. `Escenarios!D8:D10` mezcla pedido normal bajo política alternativa de envío y Pack de tres bolsas en cada compra suelta.
3. `Escenarios!D17` aplica la contribución mezclada a los tres pedidos esperados; ya no sustituye solo el primer pedido.
4. `Escenarios!D18` usa la contribución de suscripción sin envío pagado por Tueste bajo la política alternativa.
5. `Escenarios!D19:D21` recalculan LTV ponderado, LTV/CAC y contribución neta.
6. `Cohortes caja!D5:D16` usa la contribución de suscripción corregida para Pack.
7. Se marcaron todas las fórmulas para recálculo completo al abrir el libro.

El descuento de Agencia se mantuvo limitado al primer pedido suelto; no cambia suscripciones, recompras ni clientes históricos.

## 4. Matriz Excel–React

| Indicador / supuesto | React | Excel corregido | Estado |
|---|---:|---:|---|
| Contribución pedido estándar | 15,89 | Fórmula `Resultados!B7` = 15,89 | Fórmula y valor almacenado coinciden. |
| Margen estándar | 46,735294 % | `Resultados!B8` | Coincidencia estructural. |
| ROAS break-even | 2,139711x | `Resultados!B9` | Coincidencia estructural. |
| CAC anuncios | 48,484848 | `Resultados!B12` | Coincidencia estructural. |
| CAC real | 54,545455 | `Resultados!B13` | Coincidencia estructural. |
| ROAS primer pedido | 0,701250x | `Resultados!B15` | Coincidencia estructural. |
| LTV suelto Actual | 47,67 | `Resultados!B16` | Coincidencia estructural. |
| LTV suscriptor Actual | 95,177138 | `Resultados!B18` | Coincidencia estructural. |
| LTV ponderado Actual | 54,796071 | `Resultados!B19` | Coincidencia estructural. |
| LTV/CAC Actual | 1,004595x | `Resultados!B20` | Coincidencia estructural. |
| Payback entero Actual | Mes 12 | `Resultados!B22` | Fórmula conserva primer mes entero; recálculo Excel pendiente. |
| CAC marginal 8k→16k | 114,285714 | `Resultados!B23` | Coincidencia estructural. |
| Agencia | 0,643018x | `Escenarios!C20` | Descuento en primer pedido solamente. |
| Pack 0 % | 1,308129x; mes 8 | Fórmula depende de `Supuestos!B35=0` | Pendiente de recálculo en Excel. |
| Pack 50 % | 1,383630x; mes 8 | Fórmula depende de `Supuestos!B35=0,5` | Pendiente de recálculo en Excel. |
| Pack 100 % | 1,459132x; mes 7 | `Escenarios!D20` cache 1,459132 | Fórmula corregida; apertura Excel pendiente. |

La diferencia porcentual solo se puede afirmar como 0 % en las fórmulas con resultado almacenado ya comprobado. Para Pack 0 % y 50 %, y para todas las salidas dependientes de recálculo, el estado es **pendiente**, no se fuerza un porcentaje artificial.

## 5. Validación por nivel

### Nivel 1

Motor, cálculos, tres escenarios, curva, CAC marginal, cambios aislados, verificación manual y advertencia honesta sobre IA existen y pasan pruebas. La copia Excel incluye la corrección de Pack. Pendiente: abrir/recalcular Excel y registrar paridad real; la sección IA sigue describiendo un riesgo potencial, no una conversación histórica probada.

### Nivel 2

Los nueve controles, ocho indicadores, curvas, semáforo, ROAS fijo 3,0x, break-even, restauración y build estático están presentes. El modelo financiero no depende de MySQL. Pendiente: paridad de Excel recalcado y URL pública real; `dist/` no equivale a una publicación verificada.

### Nivel 3

El motor actual simula 24 meses, cohortes, edad 13–24, orgánicos, fee condicionado, piso, restricción mes 13, cuatro planes, edición mensual, ranking, búsqueda heurística, pitch y exportación. La verificación independiente del mes 1 coincide con el motor: caja final USD 31.765,4254. Los resultados actuales reproducen Actual USD 79.596,45; Agencia -USD 82.255,19 (inválido); Propia A USD 197.862,99; Propia B USD 174.553,88.

## 6. Pruebas, build y exportación

- `npm test`: **64 aprobadas, 0 fallos**.
- `npm run build`: correcto, 46 módulos transformados. Advertencia no bloqueante: fragmento dinámico de ExcelJS mayor a 500 kB.
- Las pruebas ejercitan exportación XLSX de Nivel 1/2 y tres hojas de Nivel 3 con comparación de cuatro planes, flujo 24 meses y verificación manual.
- No se abrió un archivo exportado en Microsoft Excel porque no está disponible. La estructura XLSX sí se valida con ExcelJS en pruebas; ello no sustituye la comprobación de apertura de escritorio.

## 7. Evidencia visual

No se realizó una revisión visual real: no hay navegador controlable disponible en este entorno. El build valida JSX/CSS y las pruebas validan el motor, pero no se afirma inspección de superposiciones, consola ni responsive. Debe hacerse manualmente en navegador antes de entrega.

## 8. Porcentajes demostrados y preparación

No se elevan los porcentajes sin nueva evidencia de Excel y navegador:

| Nivel | Porcentaje conservador | Motivo |
|---|---:|---|
| Nivel 1 | 92,1 % | Falta recálculo/paridad del Excel y evidencia histórica real de IA. |
| Nivel 2 | 92,3 % | Falta paridad Excel recalcado y URL pública comprobada. |
| Nivel 3 | 98,1 % | Motor y pruebas presentes; falta revisión visual y validación externa del libro. |

## 9. Pasos obligatorios antes de entregar

1. Abrir `Tueste_Calculadora_Con_Caja_Empresarial_CORREGIDA_ETAPA_15.xlsx` en Excel de escritorio, habilitar recálculo, probar B35 con 0 %, 50 % y 100 %, y guardar.
2. Registrar los valores de `Escenarios!D20`, curva y caja para completar la matriz con diferencias porcentuales reales.
3. Abrir `http://localhost:5173/`, recorrer Niveles 1–3, probar editor, botones, exportaciones y pantalla móvil; registrar capturas.
4. Abrir los XLSX exportados en Excel y confirmar columnas, negativos y seis hojas combinadas.
5. Solo después, publicar `dist/` en un hosting autorizado y verificar la URL desde un equipo sin entorno de desarrollo.

## 10. Dictamen

**Listo para revisión manual final, no todavía para afirmar entrega académica completamente verificada ni publicación.** No hay defecto comprobado en el motor o las pruebas actuales; los bloqueos son evidencia de recálculo Excel, apertura de exportaciones, revisión visual y URL pública, no sustitutos que este entorno pueda fabricar.

# Progreso de la Etapa 14 — Nivel 3: Simulador de caja de 24 meses

Fecha: 6 de noviembre de 2026  
Proyecto: `C:\Users\HP8D3\Downloads\Tueste-analytics\Tueste-analytics`  
Rama: `Ana`

## 1. Estado de las Fases

- **Fase A — Recuperación:** COMPLETADA. Se recuperó el archivo base `src/financial/levelThreeModel.js` dejado por la IA anterior, se verificó su estructura de 260 líneas, se comprobó que no se perdieron archivos previos del usuario y se conservaron intactas las 50 pruebas anteriores.
- **Fase B — Validación financiera:** COMPLETADA. Se implementaron y validaron las fórmulas de 24 meses: 24 cohortes independientes, pedidos sueltos de meses 1–12 (`[1, 0.15, 0.20, ...]`) y de meses 13–24 (0,10 pedidos/cliente), retención acumulativa mensual del 91% (churn 9%), decaimiento del 3% en clientes existentes desde USD 9.000, fee de agencia condicionado a inversión > 0, piso de caja inquebrantable de USD 5.000, regla de inversión desde mes 13 (>= promedio meses 1–12), y verificación manual independiente del mes 1 con coincidencia matemática exacta (diferencia USD 0.00).
- **Fase C — Planes e interfaz:** COMPLETADA. Se creó el componente `src/components/LevelThreeSimulator.jsx`, integrado en la navegación lateral (`Sidebar.jsx`) y en la aplicación principal (`App.jsx`). La interfaz incluye resumen de 24 meses, editor mensual y por tramos, comparador de los cuatro planes obligatorios, gráfico SVG de caja de meses 0 a 24 con línea dorada de piso de USD 5.000, tabla financiera mensual detallada con 14 columnas, panel de alertas de incumplimiento, desglose de verificación manual, mejor plan encontrado y pitch de inversión de 2 minutos.
- **Fase D — Optimización:** COMPLETADA. Se implementó la búsqueda heurística reproducible en dos bloques de 12 meses con paso configurable (por defecto USD 2.000). Evalúa 132 combinaciones con oferta original y Pack, filtra por viabilidad estricta (100 factibles), maximiza la caja final al mes 24 y desempata por suscriptores activos al mes 24.
- **Fase E — Exportación:** COMPLETADA. Se amplió `src/financial/financialExport.js` con las funciones `appendLevelThreeSheets`, `createLevelThreeWorkbook` y `downloadLevelThreeWorkbook`. Genera 3 hojas adicionales de Nivel 3 (Comparación 4 planes, Flujo 24 meses y Verificación manual mes 1), manteniendo compatibilidad total con la exportación anterior de 3 hojas.
- **Fase F — Pruebas y documentación:** COMPLETADA. Se crearon 14 pruebas automatizadas en `src/financial/levelThreeModel.test.js`. Se aprobaron 64 pruebas (50 previas + 14 nuevas, 0 fallos). El build de Vite compiló exitosamente sin advertencias y con code-splitting adecuado de ExcelJS.

## 2. Archivos modificados y creados

1. `src/financial/levelThreeModel.js` (completado y enriquecido con verificación manual detallada paso a paso, helpers de plan y reset).
2. `src/financial/levelThreeModel.test.js` (creado: 14 pruebas de Nivel 3 que validan horizonte, cohortes, retención, restricciones, 4 planes, verificación manual, optimización y exportación).
3. `src/components/LevelThreeSimulator.jsx` (creado: componente completo de simulador de 24 meses con editor, gráficos, 4 planes, tabla, alertas, verificación, optimizador y pitch).
4. `src/components/Sidebar.jsx` (modificado: enlace de navegación a `nivel-3` y texto de alcance a 24 meses).
5. `src/App.jsx` (modificado: montaje de `LevelThreeSimulator` en el flujo principal).
6. `src/financial/financialExport.js` (modificado: exportación Excel con hojas de Nivel 3 y soporte dual para 3 o 6 hojas sin romper pruebas de regresión).
7. `docs/ETAPA_14_PROGRESO.md` (creado: bitácora persistente de avances).
8. `docs/ETAPA_14_CIERRE_NIVEL_3.md` (creado: informe de cierre del Nivel 3).
9. `docs/AUDITORIA_RETO_ORIGINAL_TUESTE.md` (actualizado: auditoría de los 27 requisitos de Nivel 3 y recálculo de cumplimiento ponderado).

## 3. Pruebas ejecutadas

- Suite completa: `npm test` ejecutando `node --test src/calculations/*.test.js src/financial/*.test.js backend/*.test.js`.
- Total: **64 pruebas aprobadas, 0 fallos**.
- Vite build: `npm run build` ejecutado exitosamente con 0 errores y assets generados en `dist/`.

## 4. Errores pendientes

- **Ninguno en el código ni en las pruebas automatizadas.**
- Observación transparente de auditoría: El libro Excel externo (`Tueste_Calculadora_Con_Caja_Empresarial.xlsx`) fue creado previamente como un modelo de 12 meses; el simulador oficial de 24 meses se encuentra implementado en la aplicación web React/Vite, en el motor JavaScript probado y en la exportación ExcelJS.

## 5. Próximo paso exacto

- Redactar y cerrar formalmente `docs/ETAPA_14_CIERRE_NIVEL_3.md` y actualizar la tabla general en `docs/AUDITORIA_RETO_ORIGINAL_TUESTE.md`.


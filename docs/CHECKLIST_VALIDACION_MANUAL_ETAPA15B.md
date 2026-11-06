# Checklist manual de cierre — Etapa 15 Parte B

## Excel corregido

- [ ] Abrir `Tueste_Calculadora_Con_Caja_Empresarial_CORREGIDA_ETAPA_15.xlsx` en Microsoft Excel.
- [ ] Elegir cálculo automático y forzar `Ctrl+Alt+F9`.
- [ ] Guardar una copia recalculada, sin sobrescribir el original.
- [ ] Revisar las ocho hojas y confirmar que no aparecen errores de fórmula.
- [ ] Probar `Supuestos!B35` con 0 %, 50 % y 100 %.
- [ ] Registrar `Escenarios!D20`: 1,308129x; 1,383630x; 1,459132x respectivamente, con tolerancia menor al 1 %.
- [ ] Registrar payback y caja; adjuntar captura de cada prueba.

## Navegador real

- [ ] Abrir `http://localhost:5173/` o la URL publicada.
- [ ] Recorrer Panel principal, Nivel 2, Nivel 3, Escenarios, Flujo, Recomendación y Comercial DEMO.
- [ ] Probar un control de Nivel 2 y Restaurar originales.
- [ ] Editar un mes/rango de Nivel 3, probar restricciones y restaurar plan.
- [ ] Verificar desktop, aproximadamente 768 px y aproximadamente 390 px.
- [ ] Abrir consola: sin errores relevantes, `NaN` ni `Infinity`.
- [ ] Verificar tablas, gráficos, botones y navegación sin superposición/corte.

## Exportación

- [ ] Descargar exportación financiera base y Nivel 3.
- [ ] Abrir ambos XLSX en Excel.
- [ ] Confirmar moneda USD, dos decimales, negativos, anchos de columnas y hojas esperadas.
- [ ] Confirmar tabla de 24 meses y verificación manual del mes 1 en el reporte de Nivel 3.

## Publicación autorizada

- [ ] Ejecutar `npm test` y `npm run build` sin fallos.
- [ ] Subir solamente `dist/` al hosting autorizado.
- [ ] Probar raíz, `#nivel-2` y `#nivel-3` desde una ventana privada.
- [ ] Guardar URL, fecha y evidencia; no publicar credenciales ni bases de datos.

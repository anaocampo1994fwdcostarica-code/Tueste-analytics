# Etapa 15 — Parte B: cierre y preparación de publicación

## 1. Resumen ejecutivo

La aplicación se comprobó en su estado real: la suite completa tiene 64 pruebas aprobadas y el build Vite produce `dist/` correctamente. La salida estática respondió HTTP 200 para HTML, JavaScript y CSS. Los niveles financieros no dependen de MySQL; el panel Comercial DEMO sí requiere su API y muestra un estado separado cuando no existe.

No se realizó publicación, apertura de Excel de escritorio, apertura de exportaciones en Excel ni revisión visual real, porque las herramientas no están disponibles aquí. Estos límites se documentan como pendientes, no como cumplimientos.

## 2. Estado inicial y seguridad

El árbol ya tenía modificaciones y archivos no seguidos de Etapas 14/15. Se preservaron: no hubo `reset`, `clean`, commit, migración, modificación MySQL, cambio SQL/PDF ni sobrescritura del Excel original. La copia corregida queda diferenciada del original.

La revisión de patrones de secretos no encontró valores incrustados. `backend/server.js` y un script local leen `process.env.DB_PASSWORD`; son referencias correctas a entorno, no contraseñas registradas ni incluidas en `dist/`.

## 3. Excel y exportaciones

La copia estructural corregida conserva ocho hojas, 373 fórmulas, referencias sin errores XML y recálculo completo solicitado al abrir. Falta abrirla y guardarla en Excel para validar las pruebas Pack de 0 %, 50 % y 100 %.

Las pruebas automatizadas generan XLSX para los niveles 1/2 y para Nivel 3 (comparación de cuatro planes, flujo 24 meses y verificación manual). La apertura con Excel de escritorio queda pendiente.

## 4. Build estático y hosting

`dist/` contiene `index.html`, JavaScript y CSS. La validación HTTP de Vite Preview obtuvo 200 en los tres recursos. La navegación por hash permite acceso compatible a `#nivel-2` y `#nivel-3`; no se necesita backend para los niveles financieros.

Se recomienda Netlify Static Deploy por compatibilidad con la base `/assets/` y el flujo de cargar `dist/`. No se creó cuenta, conexión de repositorio ni URL. Ver [GUIA_PUBLICACION_TUESTE.md](GUIA_PUBLICACION_TUESTE.md).

## 5. Revisión visual

No hubo navegador controlable, por lo que no se declara revisión visual real, responsive, consola ni interacción de botones. La lista exacta para completarla está en [CHECKLIST_VALIDACION_MANUAL_ETAPA15B.md](CHECKLIST_VALIDACION_MANUAL_ETAPA15B.md).

## 6. Matriz final de requisitos

| Nivel | Requisito | Estado | Implementación / evidencia | Pendiente |
|---|---|---|---|---|
| 1 | Calculadora, fórmulas y escenarios | Implementado, pendiente de validación Excel | `simulationModel.js`, Excel corregido, regresiones | Recálculo en Excel. |
| 1 | CAC, LTV, ROAS, payback y curva | Cumplido y verificado por pruebas | 64 pruebas y documentación | Visual manual. |
| 1 | Recomendación, cambios e IA crítica | Cumplido y verificado por código | `Dashboard.jsx`, Etapa 12 | Evidencia histórica de IA no disponible y se declara como potencial. |
| 2 | Nueve controles y ocho indicadores | Cumplido y verificado por pruebas | `levelTwoModel.js`, `LevelTwoDashboard.jsx` | Visual manual. |
| 2 | Gráficos, semáforo y trampa ROAS | Implementado, pendiente de validación visual | Componentes Nivel 2 | Navegador real. |
| 2 | Paridad Excel <1 % y acceso público | Parcial | Fórmulas corregidas; build estático | Recálculo Excel y URL pública. |
| 3 | Cohortes, 24 meses y restricciones | Cumplido y verificado por pruebas | `levelThreeModel.js` y pruebas | Visual manual. |
| 3 | Cuatro planes, optimizador y pitch | Cumplido y verificado por pruebas | Nivel 3 y exportación | Visual/exportación escritorio. |
| Comercial | DEMO MySQL separado | Implementado | API relativa `/api`, componente comercial | No funciona en estático sin API; no bloquea finanzas. |

## 7. Entregables académicos

### Obligatorios a entregar

- PDF académico y SQL consolidados existentes en `entrega/`.
- Excel original y la copia corregida, claramente distinguidos.
- URL pública solo después de publicación autorizada y verificada.
- Evidencias/capturas de Excel, navegador y exportaciones completadas con el checklist.
- Presentación de los tres niveles usando [GUIA_PRESENTACION_FINAL_TUESTE.md](GUIA_PRESENTACION_FINAL_TUESTE.md).

### Apoyo académico

- Documentos de Etapas 12–15.
- Diagramas, índice de evidencias y matriz de requisitos.

### Material técnico interno (no enviar salvo solicitud)

- `node_modules/`, cachés Vite, archivos `.env`, backend local, scripts auxiliares y artefactos temporales.

## 8. Pruebas y build

- `npm test`: 64 pruebas aprobadas, 0 fallos.
- `npm run build`: correcto; advertencia no bloqueante por fragmento ExcelJS superior a 500 kB.
- Vite Preview: HTML, JS y CSS HTTP 200.

## 9. Porcentajes y dictamen

No se elevaron porcentajes sin evidencia adicional:

| Nivel | Demostrado |
|---|---:|
| Nivel 1 | 92,1 % |
| Nivel 2 | 92,3 % |
| Nivel 3 | 98,1 % |

**Dictamen:** preparado para publicación autorizada desde el punto de vista técnico y preparado para revisión académica manual final. No debe declararse entrega académica completamente cerrada hasta completar recálculo Excel, revisión visual real, apertura de exportaciones y verificación de URL pública.

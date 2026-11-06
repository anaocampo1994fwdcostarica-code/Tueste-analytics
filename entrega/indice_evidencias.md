# Índice de evidencias — Business Solutions

Fecha de verificación: 6 de noviembre de 2026.  
Base consultada exclusivamente: `tueste_business_solutions_entrega`.

## Alcance y trazabilidad

La verificación de esta etapa usó únicamente consultas `SELECT` mediante
`scripts/collect-evidence-queries.js`. El script comprueba primero que la base
activa sea exactamente `tueste_business_solutions_entrega`; si no lo es, se
detiene. No contiene DDL ni DML y no se ejecutó la creación consolidada ni una
inserción.

El 6 de noviembre de 2026 se ejecutó
`node .\scripts\collect-evidence-queries.js`; finalizó con código 0 y mostró
`current_database = tueste_business_solutions_entrega`. Los resultados
verificados en esta sesión fueron: 36 tablas, 514 registros y
51 claves foráneas. Las métricas globales fueron CPC USD 0,720588, CTR 2,697 %,
CAC USD 793,50, ROAS 0,152762, conversión 10/12 (83,33 %), ciclo de venta
promedio 9,28409091 días y ticket promedio USD 51,036364.

No se generaron archivos PNG de terminal o Workbench en esta etapa: el entorno
de trabajo no dispone de una sesión gráfica capturable ni de una herramienta de
captura interactiva verificable. `entrega/evidencias/` permanece vacío para no
confundir una salida recreada con una captura real.
Los elementos con estado **pendiente de captura** deben ser capturados por el
estudiante siguiendo el procedimiento de este documento. No sustituir una
captura real con una imagen editada o una recreación.

## Evidencias requeridas

| ID | Archivo sugerido en `entrega/evidencias/` | Qué debe mostrar | Requisito académico demostrado | Estado |
|---|---|---|---|---|
| E01 | `E01_ejecucion_sql_completa.png` | Ejecución inicial de `tueste_business_solutions.sql` sin errores, desde una base nueva de entrega | Script SQL con DDL, DML e integridad | **Pendiente:** no existe captura verificable de la ejecución previa. No repetir la creación sobre la base actual. |
| E02 | `E02_36_tablas.png` | La base `tueste_business_solutions_entrega` y la lista de 36 tablas | Identificación de entidades y diagrama ER | Pendiente de captura; resultado SELECT verificado. |
| E03 | `E03_conteos_514.png` | Conteos por tabla y total de 514 registros | Datos ficticios | Pendiente de captura; resultado SELECT verificado. |
| E04 | `E04_claves_foraneas.png` | Relaciones y 51 claves foráneas | Integridad, cardinalidades y 3FN | Pendiente de captura; resultado SELECT verificado. |
| E05 | `E05_cpc_ctr_cac_roas.png` | CPC, CTR, CAC y ROAS globales | Consultas de métricas académicas | Pendiente de captura; resultado SELECT verificado. |
| E06 | `E06_embudo_ciclo_ticket.png` | Conversión de leads, ciclo de venta y ticket promedio | Embudo y métricas comerciales | Pendiente de captura; resultado SELECT verificado. |
| E07 | `E07_vanidad_negocio.png` | Comparación por campaña: impresiones/clics frente a ingresos/CAC/ROAS | Comparación de métricas de vanidad y negocio | Pendiente de captura; resultado SELECT verificado. |
| E08 | `E08_diagrama_er.png` | `entrega/diagramas/diagrama_er_comercial.png` abierto completo | Diagrama ER con cardinalidades y tablas intermedias | Disponible como archivo; captura opcional si el profesor la solicita. |
| E09 | `E09_arquitectura_agentes.png` | `entrega/diagramas/diagrama_arquitectura_agentes.png` abierto completo | Agentes, orquestador, arquitectura y flujo | Disponible como archivo; captura opcional si el profesor la solicita. |

## Inventario al cierre de esta etapa

- Capturas reales obtenidas: **ninguna**.
- Capturas SQL pendientes: **E01 a E07**.
- Archivos gráficos ya disponibles, pero no capturas de pantalla: E08 y E09 en
  `entrega/diagramas/`.
- Evidencia E01: **no recuperable desde el repositorio actual**. Se buscaron
  imágenes, logs e historiales de ejecución y no existe un registro verificable
  de la ejecución inicial. No se debe sustituir por una recreación.

## Procedimiento manual de captura (solo lectura)

1. Abra VS Code en la raíz del repositorio y abra una terminal PowerShell.
2. Verifique visualmente que está en la carpeta que contiene `scripts/` y
   `entrega/`.
3. Ejecute exactamente este comando:

   ```powershell
   node .\scripts\collect-evidence-queries.js
   ```

4. La primera sección debe indicar `current_database` igual a
   `tueste_business_solutions_entrega`. Si muestra otro nombre o un error,
   deténgase: no tome capturas ni ejecute otros comandos.
5. Maximice la terminal y tome capturas completas, sin recortar el nombre de la
   base ni los títulos de sección, para E02 a E07. Para E03 y E04, que no caben
   en una sola pantalla, tome capturas consecutivas y nómbrelas
   `E03_conteos_514_01.png`, `E03_conteos_514_02.png`, etc. y
   `E04_claves_foraneas_01.png`, `E04_claves_foraneas_02.png`, etc.
6. Guarde los PNG con los nombres de la tabla anterior dentro de
   `entrega/evidencias/`. No muestre archivos `.env`, cadenas de conexión,
   contraseñas ni paneles de credenciales.
7. Para E08 y E09, abra los PNG ya entregados en `entrega/diagramas/` y capture
   la imagen completa solo si el profesor exige evidencia fotográfica además del
   archivo.
8. E01 continúa pendiente: solo puede capturarse en una futura ejecución limpia
   del SQL sobre una **nueva** base de entrega con nombre diferente y libre. No
   vuelva a ejecutar el script sobre `tueste_business_solutions_entrega`.
9. Antes de entregar, abra cada PNG y compruebe que se leen el título de la
   sección, los encabezados y todos los valores; no edite ni recomponga la
   salida.

## Resultados que deben coincidir en las capturas

| Consulta | Resultado esperado |
|---|---:|
| Tablas | 36 |
| Registros totales | 514 |
| Claves foráneas | 51 |
| CPC global | USD 0,720588 |
| CTR global | 2,697 % |
| CAC global | USD 793,50 |
| ROAS global | 0,152762 |
| Conversión lead a suscriptor | 10 de 12; 83,33 % |
| Oportunidades cerradas / ciclo promedio | 11; 9,28409091 días |
| Pedidos reconocidos / ticket promedio | 22; USD 51,036364 |

La comparación de vanidad y negocio muestra diez campañas DEMO y no debe
alterarse ni completarse con valores no mostrados por la consulta.

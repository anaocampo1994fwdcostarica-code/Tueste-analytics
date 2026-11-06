# Etapa 15 — Parte B: progreso de validación y preparación

## Fase inicial — inventario

Completado el 6 de noviembre de 2026.

- Se ejecutó `git status --short` antes de modificar archivos. El árbol ya contenía cambios de Etapa 14/15, artefactos `dist/` y archivos no seguidos; se preservan.
- Se revisaron `vite.config.js`, `src/services/api.js`, `README.md`, `dist/` y la documentación de Parte A.
- La API comercial usa `/api` (proxy solo para desarrollo); el modelo financiero React no depende de API, MySQL ni variables privadas.
- `dist/` contiene una compilación estática con rutas relativas a assets y navegación por hash compatible con `#nivel-2` y `#nivel-3`.
- Excel corregido existe, pero la Parte A registró que no hay Excel/LibreOffice para abrirlo y recalcularlo aquí.

Pendientes inmediatos:

1. Validar la salida estática por HTTP y confirmar que no contiene secretos evidentes.
2. Ejecutar pruebas y build final de esta Parte B.
3. Crear guía de publicación, guía de presentación, matriz de entregables/requisitos y cierre honesto de auditoría.
4. Preparar checklist manual de Excel, navegador y apertura de exportaciones.

## Fase de empaquetado y documentación

Completado el 6 de noviembre de 2026.

- Se ejecutó Vite Preview sobre el build existente. `index.html`, el bundle JavaScript y CSS devolvieron HTTP 200.
- Se verificó que el build conserva navegación por hash de Nivel 2 y Nivel 3; no se hizo una revisión visual real porque no hay navegador controlable.
- Se creó `docs/GUIA_PUBLICACION_TUESTE.md`: recomienda Netlify Static Deploy, explica la separación de API Comercial DEMO y prohíbe secretos.
- Se creó `docs/GUIA_PRESENTACION_FINAL_TUESTE.md` y `docs/CHECKLIST_VALIDACION_MANUAL_ETAPA15B.md`.
- Se creó este cierre, incluyendo matriz de requisitos, entregables y dictamen conservador.

Pendientes para una persona con Excel/navegador:

1. Abrir y recalcular la copia Excel, comprobar B35 en 0 %, 50 % y 100 %.
2. Ejecutar checklist visual, responsive y de exportaciones de escritorio.
3. Publicar solamente tras autorización y verificar URL pública.

## Fase final — regresión y seguridad

Completado el 6 de noviembre de 2026.

- `npm test`: 64 aprobadas, 0 fallos.
- `npm run build`: correcto, 46 módulos transformados; advertencia no bloqueante por ExcelJS mayor de 500 kB.
- La revisión de patrones de secretos no encontró valores incrustados. Las únicas coincidencias de contraseña son lecturas de `process.env.DB_PASSWORD` en backend y script local, no credenciales publicadas.
- No se realizó despliegue ni commit.

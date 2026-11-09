# Reto 2 — Checklist de validación final

## Automatizado

- [x] Persistencia, hidratación corrupta y reset de Rewards cubiertos por pruebas.
- [x] Duplicado, autoinvitación, compra repetida y acreditación única cubiertos por pruebas.
- [x] Plan: crear, editar, eliminar, estado, métricas/metas, persistir, recuperar y restablecer cubiertos por pruebas.
- [x] Integridad de embudo, viralidad, costos, cohortes, payback e ICE cubierta por pruebas.
- [x] Registrar resumen final de `npm test`: 83 pruebas aprobadas, 0 fallidas.
- [x] Registrar resumen final de `npm run build`: build exitoso con Vite 7.3.7.

## Manual reproducible — escritorio (≥1280 px)

1. Ejecutar el backend con `npm --prefix backend start` y el frontend con `npm run dev`; abrir `#tueste-rewards`. Resultado: navegación activa y `GET /api/health` responde HTTP 200.
2. Reiniciar DEMO y recargar. Esperado: 0/0/0/0 y evento inicial.
3. Crear referido dos veces con la misma identidad mediante función/prueba. Esperado: `duplicate_referral`.
4. Completar referido → registro → compra. Esperado: 1/1/1/2 y USD 6,60.
5. Intentar repetir compra. Esperado: bloqueada; KPIs y recompensas no aumentan.
6. Ir a `#panel-growth`. Esperado: 1 referido, USD 6,60, sin duplicar estado.
7. Crear acción, editar responsable/métrica/meta, cambiar estado y recargar. Esperado: cambios conservados.
8. Eliminar acción. Esperado: confirmación previa. Restablecer. Esperado: cuatro acciones DEMO.
9. Abrir consola. Resultado: ningún error React, excepción de página ni recurso crítico fallido.

## Manual reproducible — móvil (375 × 812 px)

1. Repetir navegación, simulador y plan. Esperado: una columna, controles alcanzables y sin corte de texto.
2. Desplazar tablas horizontalmente. Resultado: verificadas Rewards y Panel Growth sin desbordamiento horizontal fuera del viewport; las tablas usan contenedor desplazable.
3. Verificar foco, etiquetas y botones. Esperado: controles legibles y operables.

## Estado de esta ejecución

La validación visual ejecutada con frontend y backend disponibles quedó registrada en:

- Escritorio: `#tueste-rewards` y `#panel-growth` cargan correctamente, sin desbordamiento horizontal ni errores de consola.
- Móvil estrecho: el navegador integrado tuvo un ancho mínimo efectivo de 450 px. En esa resolución, `#tueste-rewards` y `#panel-growth` no presentan desbordamiento horizontal y los títulos principales cargan; no se simuló ni afirma un dispositivo físico de 375 × 812 px.
- Interacción: Rewards y el editor persistente del plan aparecen y pueden navegarse.

Queda pendiente únicamente ejecutar físicamente los escenarios DEMO de modificación de datos si se requiere evidencia de sesión más allá de las pruebas automatizadas.

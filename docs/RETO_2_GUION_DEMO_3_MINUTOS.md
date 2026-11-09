# Reto 2 — Guion de demostración (3 minutos)

## Preparación y datos iniciales

1. Ejecutar `npm run dev` y abrir la URL de Vite.
2. Entrar a **Tueste Rewards → Simulador DEMO → Reiniciar escenario DEMO**.
3. Entrar a **Panel Growth → Restablecer plan DEMO**.
4. Mantener una sola pestaña y zoom del navegador al 90–100 %.

Estado esperado: Mar, código `MAR-CAFE-24`, 0 invitados, 0 compras, 0 recompensas y cuatro acciones del plan. Todo vive en `localStorage`.

## Guion hablado y clics

### 0:00–1:00 — Problema

**Clics:** abrir **Panel Growth** y señalar Meta clientes, CAC Meta promedio, CAC marginal pendiente y embudo.

**Hablar:** “Tueste depende de publicidad pagada. En el escenario, USD 4.000 de pauta más USD 1.000 de fee para 100 clientes producen un CAC promedio de USD 50. No afirmamos un CAC marginal porque falta una curva exclusiva de inversión y altas. El caso codificado muestra 60 compras referidas por cada 1.000 primeras compras elegibles: la oportunidad es crecer desde clientes existentes, midiendo compras válidas y no solo clics.”

**Resultado esperado:** CAC USD 50, viralidad 1,00, conversión visita-amigo→compra 40 %; rótulos de supuesto/caso/DEMO visibles.

### 1:00–2:00 — Solución

**Clics exactos:** **Tueste Rewards → Mi enlace → Copiar enlace → Simulador DEMO → 1. Crear referido → 2. Simular registro → 3. Simular compra válida → Progreso**.

**Hablar:** “Mar obtiene un enlace personal. Copiarlo no envía nada; el botón de WhatsApp solo abriría una intención de compartir. En el simulador creo una invitación, registro al amigo y simulo una compra elegible. No hay pago ni pedido real. La compra se acredita una sola vez, genera el beneficio DEMO y actualiza el progreso.”

**Resultado esperado:** avisos de invitación, registro y compra; Progreso muestra 1 invitado, 1 registrado, 1 compra válida, 2 recompensas, costo atribuible USD 6,60 y avance 33,3 %.

### 2:00–3:00 — Medición y cierre

**Clics:** **Panel Growth**; señalar KPIs, economía, cohorte y plan. En el plan cambiar la primera acción a **en progreso**, editarla y guardar.

**Hablar:** “El panel comparte el mismo estado: aparece un referido válido y un costo de USD 6,60. La economía y la retención son escenarios editables, no resultados observados. El plan de 90 días guarda responsables, métricas, metas y estados en este navegador. Recomendamos un piloto controlado y escalar únicamente si el costo, la contribución, el fraude y la retención permanecen dentro de límites confirmados.”

**Resultado esperado:** referido válido = 1, costo/referido USD 6,60, recompensa total 2; el cambio del plan sobrevive una recarga.

## Plan alternativo sin internet

La demo no necesita internet una vez instaladas las dependencias. Ejecutar localmente con `npm run dev`; evitar el botón de WhatsApp y explicar que solo construye una URL de intención. Si Vite no inicia, abrir capturas preparadas y recorrer esta secuencia con los resultados anteriores. Si falla el portapapeles, seleccionar manualmente el campo del enlace. Nunca afirmar envío de WhatsApp, cobro, pedido o recompensa real.

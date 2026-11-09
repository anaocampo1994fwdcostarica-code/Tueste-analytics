# Tueste Analytics — Ficha ejecutiva Growth

> Documento de una página · 6 de noviembre de 2026 · listo para exportar a PDF  
> Etiquetas: **CASO†** = dato codificado desde el contexto del caso, pendiente de contraste con el PDF oficial; **DERIVADO** = cálculo reproducible; **SUPUESTO** = hipótesis editable; **DEMO** = simulación local, no resultado real.

## Problema y oportunidad

Tueste depende de Meta Ads para adquirir clientes. El escenario académico usa USD 4.000 de pauta + USD 1.000 de fee para 100 clientes (**SUPUESTO**) y produce un CAC promedio de USD 50 (**DERIVADO**). Aumentar inversión sin una curva marginal validada puede encarecer la siguiente adquisición. La oportunidad es convertir satisfacción y entrega en un ciclo medible: cliente → invitación → visita → primera compra válida → recompensa → nueva invitación.

## Modelo propuesto y programa

Por cada 1.000 primeras compras elegibles: 350 aperturas, 120 visitas al programa, 100 invitadores, 300 invitaciones, 150 visitas de amigos y 60 compras (**CASO†**). Esto equivale a 6 compradores referidos por cada 100 elegibles, 3 invitaciones por invitador, 50 % visita/invitación y 40 % compra/visita (**DERIVADO**). Tueste Rewards activa después de la entrega, genera un enlace personal y acredita una sola vez tras registro y compra elegible. Autoinvitaciones, referido duplicado y evento de compra repetido se bloquean.

Recompensas actuales: USD 5 de bienvenida al amigo, muestra de 100 g al primer referido y bono de USD 6 al tercero (**SUPUESTO/DEMO**). No procesa pagos, pedidos, premios ni mensajes reales.

## Economía, viralidad y retención

| Indicador | Resultado | Clasificación |
|---|---:|---|
| CAC Meta promedio | USD 50 | DERIVADO de SUPUESTOS |
| Costo del primer referido DEMO | USD 6,60 | DEMO |
| Tope por referido | USD 25 | DERIVADO, pendiente de verificar fee oficial |
| Coeficiente viral | 1,00 | DERIVADO del embudo CASO† |
| Churn mensual | 9 % | CASO† pendiente de contraste |
| Retención mes 12 | 35,4 % | DERIVADO con churn constante |

**North Star propuesta:** compradores referidos válidos por cada 100 primeras compras elegibles. Línea base codificada: 6; meta 9 es una hipótesis, no un resultado.

## Riesgos, contramétricas y 90 días

- Riesgos: fraude, descuentos que erosionen margen, atribución incorrecta, devoluciones, fatiga de mensajes, dependencia de `localStorage` y confundir DEMO con operación real.
- Contramétricas: costo por referido ≤ tope confirmado, contribución incremental no negativa, duplicados/autoinvitaciones, devoluciones, quejas y churn.
- Días 1–30: validar programa y conversión; medir compradores válidos/100 y costo.
- Días 31–60: probar activación post-entrega; medir invitaciones/invitador y quejas.
- Días 61–90: probar retención/recompra; medir cohorte y margen.

## Recomendación

Ejecutar un piloto controlado, mantener Meta como canal base y escalar referidos solo después de confirmar reglas oficiales, elegibilidad y límite económico en el PDF, y demostrar contribución incremental sin deteriorar las contramétricas. El prototipo valida el flujo y la medición; no prueba impacto comercial real.

† El PDF oficial Parte 2 no estuvo accesible en el repositorio al cierre; estos datos no deben presentarse como directamente verificados contra el documento oficial.

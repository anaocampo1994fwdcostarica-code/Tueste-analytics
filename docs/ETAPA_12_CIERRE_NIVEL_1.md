# Etapa 12 — Corrección financiera y cierre del Nivel 1

Fecha: 6 de noviembre de 2026  
Fuente normativa: `Caso A - Tueste (1).pdf`  
Alcance: motor financiero, React, pruebas y documentación. MySQL DEMO permanece separado.

## 1. Problemas detectados

1. Excel y React modelaban el Pack de manera distinta: Excel cambiaba esencialmente el primer pedido suelto; React aplicaba Pack a todas las recompras, pero seguía cargando envío a los pedidos bajo el umbral en adopción parcial y a suscripciones.
2. El descuento de agencia se aplicaba solo a clientes Meta, aunque el caso lo define para el primer pedido de clientes de pedidos sueltos.
3. CAC marginal solo estaba documentado para 8k→16k.
4. La interfaz no mostraba verificación manual, efecto individual de dos cambios ni el apartado obligatorio de IA.
5. Payback entero e interpolado existían en el motor, pero “No recuperado en 12 meses” no aparecía sistemáticamente.
6. El Excel editable está fuera del repositorio. Se revisó en solo lectura; no se reemplazó por el reporte ExcelJS.

## 2. Fórmulas revisadas

### Caso original

- Contribución pedido: `34 - (2 × 5,44) - 4,50 - (34 × 4,5 %) - 1,20 = 15,89`.
- Margen pedido: `15,89 / 34 = 46,735294 %`.
- Contribución suscripción: `30,60 - 10,88 - 4,50 - 1,377 - 1,20 = 12,643`.
- Margen suscripción: `12,643 / 30,60 = 41,316993 %`.
- Break-even pedido: `1 / 46,735294 % = 2,139711x`.
- Break-even suscripción: `1 / 41,316993 % = 2,420312x`.
- CAC anuncios: `8.000 / 165 = 48,484848`.
- CAC real: `(8.000 + 1.000) / 165 = 54,545455`.
- ROAS real primer pedido: `(165 × 34) / 8.000 = 0,70125x`.
- LTV suelto: `15,89 × 3 = 47,67`.
- LTV suscriptor: `12,643 × Σ(0,91^0…0,91^11) = 95,177138`.
- LTV ponderado: `85 % × 47,67 + 15 % × 95,177138 = 54,796071`.
- LTV/CAC: `54,796071 / 54,545455 = 1,004595x`.

### Descuento de agencia

Precio cobrado: `34 × (1 - 30 %) = 23,80`. La pasarela se calcula sobre 23,80 y los costos físicos no cambian. Contribución del primer pedido suelto: `23,80 - 10,88 - 4,50 - 1,071 - 1,20 = 6,149`. Solo el primer pedido suelto recibe descuento; las recompras y suscripciones no.

### Pack y política de envío

- Pack: precio 48; café `3 × 5,44`; pasarela `48 × 4,5 %`; empaque 1,40; Tueste paga envío porque `48 ≥ 45`. Contribución: `48 - 16,32 - 2,16 - 1,40 - 4,50 = 23,62`.
- Pedido de dos bolsas bajo política Pack: el cliente paga envío porque `34 < 45`; para Tueste el envío es costo neutral. Contribución: `34 - 10,88 - 1,53 - 1,20 = 20,39`.
- Suscripción bajo política Pack: `30,60 < 45`; contribución: `30,60 - 10,88 - 1,377 - 1,20 = 17,143`.
- La adopción mezcla la contribución de pedidos sueltos en cada compra: `(1-adopción) × 20,39 + adopción × 23,62`.

## 3. Resultado correcto del escenario Pack

El supuesto configurado por defecto es adopción 100 % en cada compra suelta durante 12 meses. Bajo ese supuesto documentado:

| Indicador | Resultado corregido |
|---|---:|
| CAC anuncios | USD 48,484848 |
| CAC real | USD 54,545455 |
| LTV suelto | USD 70,86 |
| LTV suscriptor | USD 129,053364 |
| LTV ponderado | USD 79,589005 |
| LTV/CAC | **1,459132x** |
| Payback entero | Mes 7 |
| Payback interpolado | 6,556758 meses |
| Caja final mes 12 | USD 74.403,25 |

El antiguo 1,125054x del Excel procede de cambiar principalmente el primer pedido. El antiguo 1,365972x de React aplicaba Pack a recompras, pero no aplicaba correctamente la política de envío a suscripciones y pedidos no Pack. El resultado 1,459132x es el que corresponde a la regla ahora explícita. Si se adopta otra interpretación comercial, debe configurarse y documentarse; no debe cambiarse silenciosamente.

### Pruebas de adopción

| Adopción | LTV ponderado | LTV/CAC | Payback entero |
|---:|---:|---:|---:|
| 0 % | 71,352505 | 1,308129x | Mes 8 |
| 50 % | 75,470755 | 1,383630x | Mes 8 |
| 100 % | 79,589005 | 1,459132x | Mes 7 |

Incluso con 0 % existe efecto porque el escenario activa la política de envío: los pedidos de dos bolsas pagan su envío. Este supuesto se muestra expresamente para evitar atribuir todo el efecto al Pack.

## 4. Payback

Se conservan dos conceptos:

- **Entero académico:** primer mes cuyo acumulado alcanza cero.
- **Interpolado:** fracción del mes necesaria dentro del período de cruce.

Actual recupera en mes 12 y 11,925707 meses interpolados. Pack 100 % recupera en mes 7 y 6,556758 meses interpolados. Agencia no recupera el CAC: la interfaz y el Excel exportado dicen **“No recuperado en 12 meses”**.

El libro editable externo conserva un valor almacenado `>12` para Actual pese a que su curva cruza en mes 12. No se modificó porque el libro no está dentro del repositorio y la solicitud prohíbe crear un sustituto no autorizado. La corrección recomendada es una fórmula compatible que busque el primer acumulado `>=0`, seguida de recálculo completo en Excel.

## 5. CAC marginal

El CAC marginal es inversión publicitaria adicional / clientes Meta adicionales. No incluye el fee fijo: entre tramos activos el fee no cambia y pertenece al CAC real promedio.

| Tramo | CAC marginal |
|---|---:|
| 0→4.000 | USD 40,00 |
| 4.000→8.000 | USD 61,538462 |
| 8.000→12.000 | USD 88,888889 |
| 12.000→16.000 | USD 160,00 |
| 16.000→20.000 | USD 266,666667 |
| 8.000→16.000 | USD 114,285714 |

## 6. Dos cambios propuestos

La base de comparación es la propuesta de agencia: Meta 16.000 y descuento de 30 %.

### Cambio A — Sustituir descuento por Pack/política de envío

Mantiene Meta 16.000 y sus 235 clientes históricos. CAC no cambia (72,34). LTV pasa de 46,5162 a 79,5890; LTV/CAC de 0,6430x a 1,1002x (+71,1 %). El escenario pasa de no recuperar en 12 meses a payback entero mes 11. Riesgo: adopción, conversión y frecuencia no demostradas.

### Cambio B — Mantener Meta en USD 8.000

Conserva temporalmente el descuento de agencia para aislar solo presupuesto. Clientes bajan de 235 a 165 según historial; CAC real pasa de 72,34 a 54,55. LTV permanece en 46,5162; LTV/CAC sube de 0,6430x a 0,8528x (+32,6 %). Aún no recupera en 12 meses: bajar inversión no corrige por sí solo una oferta destructiva.

### Efecto combinado

Pack/política de envío con Meta 8.000 produce CAC 54,55, LTV 79,5890, LTV/CAC 1,4591x y payback mes 7. Frente a agencia, LTV/CAC mejora 126,9 %. Es una proyección condicionada a validar adopción y comportamiento.

## 7. Verificación manual

La interfaz incluye “Verificación manual de cálculos” con datos, fuente, fórmula, sustitución, resultado y confirmación del motor para:

1. CAC real: `(8.000 + 1.000) / 165 = 54,54545…`, mostrado como USD 54,55.
2. Contribución: `34 - 10,88 - 4,50 - 1,53 - 1,20 = 15,89`.

## 8. En qué se equivocó o nos confundió la IA

No se encontró una respuesta histórica documentada que permita afirmar que una IA cometió realmente un error. La interfaz lo identifica honestamente como **Error potencial de interpretación de IA**: concluir que ROAS Meta 3,0 justifica duplicar inversión. Meta mezcla retargeting y atribución; el ROAS real del primer pedido nuevo es 0,70125x. El CAC real es 54,55 y LTV/CAC actual 1,0046x. Por eso la decisión cambia de escalar a arreglar y validar.

## 9. Recomendación para Diego

**ARREGLAR antes de escalar. No firmar la propuesta tal como está.** Agencia termina con caja negativa, LTV/CAC 0,6430x y no recupera CAC en 12 meses. Mantener Meta en 8.000 y ejecutar una prueba controlada del Pack evita comprometer caja mientras se validan adopción, conversión y frecuencia. Solo reconsiderar escala si el Pack mantiene comportamiento, LTV/CAC supera 1x con margen de seguridad, la caja permanece sobre 5.000 y el CAC marginal es inferior a la contribución esperada por cliente.

## 10. Correcciones realizadas

- Política de envío y adopción Pack corregidas.
- Descuento aplicado al primer pedido suelto, no a suscripción ni recompras.
- Payback entero e interpolado separados; estado no recuperado explícito.
- CAC marginal completo por tramos.
- Cambios A, B y combinado calculados por separado.
- Verificación manual y apartado de IA añadidos.
- Recomendación dinámica e imprimible añadida.
- Eje de recuperación corregido para no mostrar todos los valores como `0k`.
- ExcelJS ampliado con métricas corregidas y estado de payback.

## 11. Evidencia de pruebas

- 38 pruebas aprobadas, 0 fallos.
- Build Vite de producción aprobado (42 módulos transformados).
- Revisión visual completa en Edge aprobada.
- Exportación con adopción Pack 50 % abierta en Microsoft Excel: 3 hojas, 0 celdas `########`, LTV 75,470755, LTV/CAC 1,383630x y Agencia “No recuperado en 12 meses”.
- Se añadieron regresiones para caso original, descuento, CAC marginal, Pack 0/50/100 %, cambios individual/combinado y exportación.

## 12. Pendientes

1. Corregir y recalcular el libro editable externo con autorización y colocarlo bajo control del proyecto. React y ese libro todavía no coinciden en Pack/payback.
2. La evidencia de IA es un riesgo potencial documentado, no prueba de una conversación histórica real; la literalidad de la rúbrica depende del criterio del profesor.
3. Niveles 2 y 3 permanecen fuera de alcance de esta etapa.


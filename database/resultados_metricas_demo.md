# Resultados de métricas demostrativas

Estos resultados proceden exclusivamente de datos `[DEMO]` en
`tueste_analytics_test_migration`. No describen el desempeño histórico de Tueste.

## Resumen independiente

| Métrica | Fórmula | Resultado demo |
|---|---|---:|
| CPC global | USD 7.350 de medios / 10.200 clics | USD 0,720588 |
| CTR global | 10.200 clics / 378.200 impresiones | 0,026970 (2,697 %) |
| CAC global | (medios + otros costos) / 10 suscripciones atribuidas | USD 793,50 |
| ROAS global | USD 1.122,80 de ingreso atribuido / USD 7.350 de medios | 0,152762 |
| Conversión lead→suscripción | 10 / 12 | 0,8333 (83,33 %) |
| Ciclo promedio cerrado | promedio de cierre − creación para 11 oportunidades | 9,2841 días |
| Ticket promedio | USD 1.122,80 / 22 pedidos reconocidos | USD 51,036364 |

Los cálculos independientes agregaron cada fuente antes de relacionarla. Una
unión directa de días, atribuciones y pedidos produjo artificialmente CPC de
USD 0,736568, CTR de 2,68 % y ROAS de 0,198141; esos resultados se descartaron
por multiplicación de filas. Los valores globales corregidos coinciden con la
suma de las diez filas válidas de la consulta 1.

## Estado y valores de las 16 consultas

### 1. CPC y CTR por campaña

| Campaña demo | Gasto | Impresiones | Clics | CPC USD | CTR |
|---|---:|---:|---:|---:|---:|
| Búsqueda enero | 800 | 38.000 | 1.140 | 0,701754 | 3,00 % |
| Social enero | 1.600 | 82.000 | 1.640 | 0,975610 | 2,00 % |
| Contenido enero | 800 | 58.000 | 1.450 | 0,551724 | 2,50 % |
| Referidos enero | 500 | 16.000 | 800 | 0,625000 | 5,00 % |
| Búsqueda febrero | 700 | 35.000 | 1.050 | 0,666667 | 3,00 % |
| Social febrero | 900 | 45.000 | 900 | 1,000000 | 2,00 % |
| Contenido febrero | 400 | 30.000 | 900 | 0,444444 | 3,00 % |
| Contacto empresas | 300 | 4.200 | 420 | 0,714286 | 10,00 % |
| Búsqueda marzo | 600 | 30.000 | 900 | 0,666667 | 3,00 % |
| Social marzo | 750 | 40.000 | 1.000 | 0,750000 | 2,50 % |

### 2. CPC y CTR por canal

| Canal demo | CPC USD | CTR |
|---|---:|---:|
| Búsqueda pagada | 0,679612 | 3,00 % |
| Contacto directo | 0,714286 | 10,00 % |
| Contenido orgánico | 0,510638 | 2,67 % |
| Redes sociales pagadas | 0,918079 | 2,12 % |
| Referidos | 0,625000 | 5,00 % |

### 3. Presupuesto frente a ejecución

Las diez campañas quedaron bajo presupuesto. Los totales ejecutados, incluyendo
otros costos, fueron respectivamente USD 860, 1.720, 845, 530, 760, 990, 430,
330, 645 y 825. Los saldos fueron USD 140, 280, 55, 70, 140, 210, 70, 70, 155 y
175.

### 4–5. CAC y ROAS por campaña

Cada campaña tiene una adquisición atribuida en este conjunto controlado.

| Campaña demo | CAC USD | Ingreso atribuido USD | ROAS |
|---|---:|---:|---:|
| Búsqueda enero | 860 | 159,00 | 0,198750 |
| Social enero | 1.720 | 115,80 | 0,072375 |
| Contenido enero | 845 | 106,00 | 0,132500 |
| Referidos enero | 530 | 159,00 | 0,318000 |
| Búsqueda febrero | 760 | 106,00 | 0,151429 |
| Social febrero | 990 | 106,00 | 0,117778 |
| Contenido febrero | 430 | 106,00 | 0,265000 |
| Contacto empresas | 330 | 106,00 | 0,353333 |
| Búsqueda marzo | 645 | 53,00 | 0,088333 |
| Social marzo | 825 | 106,00 | 0,141333 |

### 6. Conversiones entre etapas

- Lead → prospecto: 10/12 = 83,33 %.
- Lead → descartado: 1/12 = 8,33 %.
- Prospecto → oportunidad: 10/10 = 100 %.
- Oportunidad → cierre ganado: 10/10 = 100 %.
- Un lead permanece abierto y no aparece como transición cerrada.

### 7. Conversión total

Doce leads, diez convertidos a suscriptor: 83,33 %.

### 8. Ciclo de venta

Las diez oportunidades ganadas tardaron 10 días cada una. La oportunidad perdida
tardó 2,125 días. Promedio independiente de las once cerradas: 9,2841 días.

### 9–10. Ticket promedio

- 22 pedidos reconocidos; ticket promedio global sin impuestos: USD 51,036364.
- Hogar mensual: 6 pedidos, USD 53,00.
- Hogar introductorio: 3 pedidos, USD 38,60.
- Pack mensual: 6 pedidos, USD 53,00.
- Oficina quincenal: 3 pedidos, USD 53,00.
- Oficina mensual: 4 pedidos, USD 53,00.

### 11. Vanidad frente a negocio

La consulta reprodujo para las diez campañas las impresiones, clics, CTR y CPC de
la consulta 1 junto con una adquisición por campaña, de uno a tres pedidos
reconocidos, y los CAC/ROAS de la tabla anterior. Quedó demostrado que más CTR no
implica mejor rentabilidad: Contacto empresas tuvo 10 % de CTR y el mayor ROAS
demo (0,353333), mientras Social enero tuvo 2 % de CTR y el menor ROAS
(0,072375).

### 12. Recorrido del contacto de prueba

Para el contacto 1: clic en Conciencia el 5 de enero, formulario en Consideración
el 6 de enero y compra en Decisión el 12 de enero de 2026, todos atribuidos a la
campaña demo Búsqueda enero.

### 13. Handoffs

- Aceptados: 10; decisión promedio en 3,2 horas.
- Rechazados: 1; decisión en 6 horas.
- Pendientes: 1; sin tiempo de decisión todavía.

### 14. Margen de contribución parcial

Se obtuvieron 22 filas. Pedidos sin descuento: margen parcial entre USD 19,00 y
19,60. Pedidos introductorios con 30 % de descuento: USD 5,20 para los dos
primeros y USD 4,60 para el tercero. Fórmula:

`subtotal − descuento − costo de productos − envío`.

No incluye comisión porcentual/fija de pago, otros costos de pedido, costos
fijos, impuestos pagados ni costo de capital.

### 15. LTV observado a 12 meses

| Suscripción | LTV parcial USD |
|---:|---:|
| 1 | 58,20 |
| 2 | 15,00 |
| 3 | 38,60 |
| 4 | 57,60 |
| 5 | 38,60 |
| 6 | 38,60 |
| 7 | 38,60 |
| 8 | 38,60 |
| 9 | 19,60 |
| 10 | 38,60 |

Es acumulación observada de margen parcial dentro de 12 meses, no una proyección
completa ni LTV histórico real.

### 16. Flujo operativo mensual parcial

| Mes | Ingreso USD | Costo producto USD | Marketing USD | Flujo parcial USD |
|---|---:|---:|---:|---:|
| 2026-01 | 197,60 | 93,60 | 3.955,00 | -3.851,00 |
| 2026-02 | 409,60 | 188,40 | 2.510,00 | -2.288,80 |
| 2026-03 | 462,60 | 214,80 | 1.470,00 | -1.222,20 |
| 2026-04 | 53,00 | 24,00 | 0,00 | 29,00 |

Fórmula: ingreso reconocido − costo de producto − costo de marketing. Faltan
caja inicial, costos fijos, comisión de pago, otros costos operativos, impuestos
pagados, CAPEX, deuda y fechas reales de cobro/pago; por ello no es flujo de caja
completo ni sirve aún para payback definitivo.

## Conclusión

Las 16 consultas son ejecutables y devolvieron resultados. Las consultas 1–13
son completas respecto de las fuentes ficticias definidas. Las 14–16 son
deliberadamente parciales por los componentes financieros enumerados arriba.


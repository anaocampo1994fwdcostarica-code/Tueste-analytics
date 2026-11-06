# Guía de presentación final — Tueste Analytics

## Preparación

Abrir la URL publicada autorizada o `http://localhost:5173/`. Usar los valores originales antes de iniciar. Aclarar siempre que las proyecciones son académicas y que los datos comerciales DEMO son ficticios y separados.

## Nivel 1 — La calculadora (2 minutos)

1. Explicar el problema: ROAS atribuido por Meta (3,0x) no equivale a rentabilidad ni a caja bancaria.
2. Mostrar caso actual: CAC real USD 54,55, LTV de contribución USD 54,80, ratio cerca de 1x y payback entero mes 12.
3. Mostrar que el descuento de Agencia solo afecta el primer pedido suelto; no se aplica a recompras ni suscripciones.
4. Comparar Actual, Agencia y Pack. Destacar que Pack requiere validar adopción, conversión y frecuencia.
5. Mostrar la verificación manual: contribución por pedido y CAC real.
6. Explicar uso crítico de IA: se utilizó para apoyar diseño/código y contrastes, pero las fórmulas se verificaron contra el caso. El supuesto erróneo “ROAS 3,0 implica escalar” se presenta como riesgo potencial, no como una conversación histórica inventada.

## Nivel 2 — Tablero interactivo (2 minutos)

1. Abrir `#nivel-2`.
2. Cambiar inversión Meta, costo de café o porcentaje de suscriptores; señalar el recálculo inmediato.
3. Enseñar margen, CAC, LTV, LTV/CAC, payback, ROAS de primer pedido y CAC marginal.
4. Explicar semáforo: rojo menor a 1x, amarillo 1x a menos de 3x y verde desde 3x; no es garantía de rentabilidad empresarial.
5. Mostrar referencias 1:1 y 3:1, el historial de inversión/clientes y la trampa de ROAS.
6. Pulsar “Restaurar datos originales” y confirmar el retorno a valores base.

## Nivel 3 — Simulador de caja (3 minutos)

1. Abrir `#nivel-3`; explicar horizonte de 24 meses, cohortes y piso de USD 5.000.
2. Mostrar el Plan Actual: caja final **USD 79.596,45**.
3. Mostrar Agencia: caja final **-USD 82.255,19**, inválido por cruzar el piso.
4. Mostrar Propia A: caja final **USD 197.862,99**; y Propia B: **USD 174.553,88**.
5. Editar un mes de inversión o aplicar un rango y mostrar alerta de restricción desde mes 13.
6. Revisar la tabla mensual: clientes Meta/orgánicos, contribución existente/cohortes, fee, caja y suscriptores.
7. Mostrar la verificación manual de mes 1: 212 clientes, contribución de cohorte USD 3.265,4254 y caja final USD 31.765,4254.
8. Señalar “Mejor plan encontrado”: es heurístico reproducible, no óptimo global garantizado.

## Pitch ejecutivo (aprox. 2 minutos)

> Recomendamos mantener USD 8.000 mensuales bajo la Estrategia Propia A con Pack y política alternativa de envío. El modelo proyecta USD 197.862,99 de caja al mes 24 y respeta el piso de seguridad. La propuesta de Agencia, con USD 16.000 y descuento del 30 %, termina con -USD 82.255,19 y es inválida por liquidez. El principal riesgo es que adopción, conversión y retención no se sostengan. Solo aumentaríamos inversión si la caja se mantiene protegida, el CAC marginal es cubierto por contribución y la evidencia real confirma los supuestos.

Actualizar el pitch si se modifican los planes: las cifras anteriores corresponden a los valores originales probados.

## Preguntas previsibles

- **¿Por qué no se acepta el ROAS 3x?** Porque incluye atribución/retargeting y no incorpora CAC, fee, costos fijos ni caja incremental.
- **¿El Pack está garantizado?** No; es una proyección condicionada a adopción y comportamiento, por eso se recomienda prueba controlada.
- **¿Qué hace válida una estrategia?** Mantener caja sobre USD 5.000, inversión mensual entre USD 0 y 20.000 y cumplir la regla de meses 13–24.
- **¿Qué hizo la IA?** Apoyó implementación y análisis; el resultado se verificó mediante fórmulas, pruebas y documentación. No se atribuyen conversaciones o errores históricos inexistentes.

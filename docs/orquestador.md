# Agente orquestador de Business Solutions

## Estado

El **Orquestador Business Solutions Tueste** es una arquitectura propuesta, no
una capacidad implementada. Hoy React llama directamente a rutas `GET` de
Express. No existe runtime de agentes, memoria autónoma ni herramientas de
escritura.

## Objetivo

Ser el único punto de coordinación entre usuario y agentes especializados. Los
agentes especializados no se invocan ni se comunican directamente entre sí: el
orquestador recibe cada resultado, valida su contrato y decide el siguiente paso.

## Responsabilidades

1. Recibir la solicitud y el contexto autorizado.
2. Identificar intención, alcance, periodo, segmento y resultado esperado.
3. Clasificar la operación como lectura, propuesta o mutación.
4. Dividir solicitudes complejas en subtareas con dependencias.
5. Elegir uno o varios agentes especializados.
6. Entregar a cada agente solo los datos mínimos necesarios.
7. Validar esquema de salida, evidencia, fórmula, periodo y limitaciones.
8. Resolver contradicciones volviendo a consultar la fuente; nunca decidir por
   mayoría entre agentes.
9. Detener el flujo en puntos de aprobación humana.
10. Consolidar una respuesta final que diferencie hechos, supuestos, propuestas
    y pendientes.
11. Mantener una bitácora futura de intención, datos consultados, aprobaciones y
    resultado, sin registrar credenciales ni datos sensibles innecesarios.

## Protocolo de coordinación

```text
Usuario → Orquestador → Agente A → Orquestador
                      → Agente B → Orquestador
                      → Aprobación humana, si aplica
                      → Agente C → Orquestador → Usuario
```

Queda prohibido `Agente A → Agente B`. Si Campañas necesita contenido, entrega
un brief al orquestador; este valida el brief y crea una tarea para Contenido.

Cada tarea propuesta debe incluir:

- `request_id` y `task_id`;
- agente destinatario;
- intención y alcance;
- referencias permitidas a tablas/endpoints;
- datos mínimos de entrada;
- clasificación `read`, `draft` o `write_proposal`;
- aprobación requerida;
- esquema de respuesta;
- fecha de caducidad del contexto.

Cada respuesta debe incluir:

- estado `complete`, `partial`, `insufficient_data` o `blocked`;
- resultado y evidencia;
- tablas/endpoints consultados;
- supuestos;
- advertencias y aprobación pendiente;
- ninguna acción implícita fuera de la tarea.

## Selección de agentes

| Intención | Agente principal | Posibles agentes posteriores, siempre vía orquestador |
|---|---|---|
| Planificar o evaluar pauta | Campañas y publicidad | Contenidos, Analítica |
| Crear calendario o pieza | Contenidos | Revisión |
| Revisar/aprobar pieza | Revisión y aprobaciones | Contenidos si hay cambios |
| Calificar o seguir lead | Embudo | Handoff |
| Entregar lead a ventas | Handoff | Suscripciones después de cierre |
| Gestionar servicio recurrente | Suscripciones | Analítica |
| Calcular indicadores | Analítica | Campañas o Embudo para aclaraciones |

## Validación de resultados

El orquestador comprueba:

- que los identificadores existan y pertenezcan al alcance;
- que las fechas sean cronológicas;
- que las fórmulas usen fuentes canónicas;
- que no haya doble conteo de campañas, atribuciones o pedidos;
- que una cifra DEMO esté etiquetada como ficticia;
- que una métrica parcial no se presente como completa;
- que la recomendación no exceda los permisos del agente;
- que cualquier escritura futura tenga idempotencia, transacción, auditoría y
  aprobación válida.

## Política de lectura y escritura

### Operaciones permitidas sin aprobación adicional

- consultar endpoints `GET` ya existentes;
- calcular y explicar indicadores;
- crear borradores que no se publiquen ni persistan;
- detectar anomalías y solicitar información.

### Operaciones que siempre requieren aprobación humana

- cualquier `INSERT`, `UPDATE` o `DELETE` futuro;
- crear, activar, pausar o cerrar una campaña;
- comprometer o redistribuir presupuesto;
- publicar contenido o aprobarlo definitivamente;
- contactar un lead o cliente;
- cambiar etapa, descartar, cerrar oportunidad o aceptar handoff;
- activar, cobrar, cambiar, pausar o cancelar una suscripción;
- registrar pago, pedido, entrega, reembolso o atribución;
- cambiar una fórmula académica o publicar un informe externamente.

### Controles obligatorios antes de una mutación futura

1. El orquestador produce un plan y una vista previa del cambio.
2. Identifica base, tabla, registros, valores anteriores y nuevos.
3. Verifica que el destino no sea ambiguo y que el usuario tenga autoridad.
4. Solicita una aprobación explícita vinculada a `request_id`, alcance y
   caducidad.
5. Un servicio especializado —no el modelo— valida y ejecuta una transacción.
6. Se comprueban restricciones y filas afectadas antes de `COMMIT`.
7. Se registra auditoría y se devuelve el resultado al orquestador.

Una aprobación para redactar no autoriza publicar; una aprobación de campaña no
autoriza gastar más; una aprobación de handoff no autoriza cerrar una venta.

## Manejo de conflictos y errores

- Datos faltantes: estado `insufficient_data`; no completar con invenciones.
- Fuentes contradictorias: detener y presentar diferencias.
- Error de herramienta: no repetir escrituras automáticamente; las lecturas
  pueden reintentarse con límite.
- Aprobación vencida o diferente al cambio: solicitar una nueva.
- Resultado financiero parcial: conservar la etiqueta y enumerar componentes
  faltantes.
- Petición fuera de alcance: rechazar o pedir autorización específica.

## Ejemplo de descomposición

Solicitud: “Lanza una campaña empresarial y dime si fue rentable”.

1. Campañas prepara plan y presupuesto; el orquestador pide aprobación.
2. Contenidos prepara piezas; Revisión emite dictamen; una persona publica.
3. Embudo analiza leads; Handoff prepara entregas aceptadas por ventas.
4. Suscripciones prepara altas autorizadas por ventas/cliente.
5. Analítica calcula CPC, CTR, CAC, ROAS y conversiones.
6. El orquestador responde que el desempeño comercial es calculable, pero que la
   rentabilidad financiera completa permanece pendiente si faltan costos.


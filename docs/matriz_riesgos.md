# Matriz de riesgos y controles propuesta

## Estado

Análisis académico de una arquitectura futura. Los controles de agentes no están
implementados. Los controles existentes se identifican explícitamente.

Escala cualitativa: probabilidad e impacto bajo, medio o alto.

| ID | Riesgo | Prob. | Impacto | Control existente | Control futuro propuesto | Responsable |
|---|---|---|---|---|---|---|
| R01 | Presentar datos DEMO como reales | Media | Alto | Banner DEMO, prefijos y documentación | Etiqueta obligatoria en contratos y exportaciones | Orquestador / Analítica |
| R02 | Escritura sin autorización | Media | Alto | API actual solo `GET` | Aprobación específica, RBAC, idempotencia y transacción | Seguridad / backend |
| R03 | Ejecutar sobre base principal | Baja | Alto | `DATA_MODE=demo`, nombre permitido y base separada | Allowlist por entorno y credencial de solo lectura | Operaciones |
| R04 | Exposición de credenciales | Baja | Alto | `.env` ignorado por Git | Gestor de secretos, redacción de logs y rotación | Operaciones |
| R05 | Doble conteo de gasto/ingreso | Media | Alto | CTE separadas y atribución única | Pruebas de reconciliación en cada informe | Analítica |
| R06 | Mezclar histórico legado y detalle | Media | Medio | Regla documental de periodos no solapados | Validador de rango y linaje de fuente | Campañas / Analítica |
| R07 | CPC/CTR global incorrectos por joins | Media | Medio | Valores corregidos y consultas por campaña | Dataset de regresión y tolerancias automáticas | Analítica |
| R08 | Métrica parcial presentada como completa | Media | Alto | `financial-status` y motor con `insufficient_data` | Esquema de salida con `completeness` obligatorio | Orquestador |
| R09 | Aprobación de contenido por su autor | Media | Medio | Roles y revisiones separadas en modelo | Segregación de funciones y firma del revisor | Editorial |
| R10 | Publicar versión distinta de la aprobada | Media | Alto | No existe publicación automática | Hash/versionado y aprobación ligada a versión | Editorial / backend |
| R11 | Contactar lead sin consentimiento | Media | Alto | No existen conectores de contacto | Consentimiento, finalidad, opt-out y auditoría | Marketing / legal |
| R12 | Duplicar contactos o leads | Media | Medio | Email único en contactos; modelo separado | Matching controlado y resolución humana | Embudo |
| R13 | Más de una etapa abierta | Baja | Medio | Clave única generada y `CHECK` temporal | Servicio transaccional de transición | Embudo / backend |
| R14 | Handoff sin contexto o rechazo sin motivo | Baja | Medio | FK, `CHECK` y campos obligatorios | Plantilla mínima y SLA | Marketing / ventas |
| R15 | Cobro o alta no consentida | Baja | Alto | No hay endpoints de escritura | Doble confirmación, token de consentimiento y PSP | Ventas / operaciones |
| R16 | Pedido o total incoherente | Baja | Alto | `CHECK` de importes y validación DEMO | Reconciliación contra proveedor de pagos | Operaciones |
| R17 | Agente evade al orquestador | Media | Alto | Regla documental | Red sin comunicación lateral y credenciales por herramienta | Arquitectura |
| R18 | Contexto excesivo o datos personales expuestos | Media | Alto | Datos DEMO con dominio reservado | Minimización, enmascaramiento, retención y DLP | Orquestador / seguridad |
| R19 | Prompt injection desde contenido externo | Media | Alto | Sin herramientas externas actuales | Aislar contenido como dato, allowlist de acciones y revisión humana | Seguridad |
| R20 | Reintento duplica una mutación | Media | Alto | No hay mutaciones de agentes | Clave de idempotencia y ledger de acciones | Backend |
| R21 | Herramienta externa falla parcialmente | Media | Medio | No hay conectores actuales | Saga/compensación, estado verificable y no repetir a ciegas | Orquestador |
| R22 | Cambiar fórmula sin gobierno | Baja | Alto | Fórmulas en SQL y motor versionado | Aprobación académica, versión y pruebas doradas | Analítica / docente |
| R23 | Diagrama/documento desactualizado | Media | Medio | Referencias directas a archivos reales | Validación CI de tablas/rutas y fecha de auditoría | Estudiante |
| R24 | Bibliografía inventada o no verificable | Media | Alto | Marcadores pendientes; ninguna fuente inventada | Registrar DOI/URL, autor, fecha y consulta | Estudiante |

## Prioridades

Antes de implementar agentes deben resolverse R02, R03, R04, R08, R10, R11,
R15, R17, R18 y R19. La arquitectura no debe avanzar a escritura mientras no
existan autenticación, autorización, auditoría, aprobación vinculante y pruebas
de recuperación.


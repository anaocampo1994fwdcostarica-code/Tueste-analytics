# Tueste Analytics — Business Solutions

**Enunciado oficial:** *Primer Postejercicio — Business Solutions: Mercadeo
comercial en una empresa de servicios*.

## Portada

**Título:** Tueste Analytics: solución CRM, analítica y arquitectura multiagente
para un servicio de suscripción de café  
**Curso:** `[PENDIENTE: nombre y código del curso]`  
**Institución:** `[PENDIENTE: institución]`  
**Profesor(a):** `[PENDIENTE: nombre]`  
**Estudiante(s):** `[PENDIENTE: nombres y carnés]`  
**Grupo:** `[PENDIENTE]`  
**Fecha de entrega:** `[PENDIENTE]`  
**Versión:** Entrega académica preparada, Etapa 6  

> Advertencia: todos los registros y resultados cuantitativos presentados son
> ficticios y se usan exclusivamente para demostración académica. No representan
> resultados históricos reales de una empresa.

## Índice

1. [Introducción](#1-introducción)
2. [Descripción de Tueste](#2-descripción-de-tueste)
3. [Problema empresarial](#3-problema-empresarial)
4. [Objetivos](#4-objetivos)
5. [Solución propuesta](#5-solución-propuesta)
6. [Arquitectura tecnológica](#6-arquitectura-tecnológica)
7. [Modelo de datos y normalización](#7-modelo-de-datos-y-normalización)
8. [CRM y recorrido del cliente](#8-crm-y-recorrido-del-cliente)
9. [Campañas y proceso de marketing](#9-campañas-y-proceso-de-marketing)
10. [Embudo y traspaso a ventas](#10-embudo-y-traspaso-a-ventas)
11. [Métricas SQL y resultados DEMO](#11-métricas-sql-y-resultados-demo)
12. [Arquitectura de agentes](#12-arquitectura-de-agentes)
13. [Agente orquestador](#13-agente-orquestador)
14. [Caso de uso completo](#14-caso-de-uso-completo)
15. [Validaciones](#15-validaciones)
16. [Limitaciones](#16-limitaciones)
17. [Conclusiones](#17-conclusiones)
18. [Bibliografía](#18-bibliografía)
19. [Anexos](#19-anexos)

## 1. Introducción

Tueste Analytics es una aplicación académica de Business Solutions que integra
un modelo CRM comercial, analítica de marketing, suscripciones recurrentes y un
diseño de arquitectura multiagente. El proyecto busca demostrar cómo una empresa
de servicios puede conectar el gasto publicitario con el recorrido del cliente,
el embudo, la conversión, los pedidos y los resultados comerciales.

La solución utiliza React, Express y MySQL. El entorno DEMO contiene 36 tablas y
514 registros ficticios. La API expone 22 endpoints de solo lectura y el frontend
identifica permanentemente los datos como demostrativos. Adicionalmente existe
un motor financiero independiente; sus cálculos completos solo se presentan
cuando hay entradas suficientes.

La entrega responde a cinco criterios oficiales, cada uno con un valor de 20 %:
análisis comercial y entidades; diagrama ER; script SQL normalizado; datos y
consultas; y documentación de agentes/orquestador. Los entregables oficiales son
el documento académico PDF, un SQL autocontenido y capturas de ejecución.

## 2. Descripción de Tueste

Tueste se modela como una empresa ficticia de suscripción de café para hogares y
empresas. El producto físico forma parte de un servicio recurrente: el cliente
elige un plan, recibe productos periódicamente y puede renovar, pausar, cambiar
o cancelar su suscripción.

El ciclo comercial incluye captación, interacción, calificación, oportunidad,
traspaso a ventas, cierre, alta de suscripción, pedidos, entregas y retención. El
modelo admite clientes individuales y empresariales, composición de ofertas y
personalización de productos por suscripción.

## 3. Problema empresarial

Sin una fuente integrada, marketing puede observar impresiones y clics sin saber
si generaron clientes o ingresos. Ventas puede recibir leads sin contexto ni
trazabilidad. Operaciones puede gestionar pedidos sin relacionarlos con la
campaña que originó la suscripción. Además, mezclar presupuesto con gasto,
histórico agregado con hechos diarios o pedidos con métricas publicitarias puede
producir doble conteo.

El problema central es conectar de forma normalizada y auditable:

- campañas, canales y costos;
- contenidos y aprobaciones;
- contactos, touchpoints y leads;
- etapas, oportunidades y handoffs;
- suscripciones, pedidos, entregas e ingresos;
- indicadores comerciales y financieros.

## 4. Objetivos

### Objetivo general

Diseñar y demostrar una solución analítica que conecte el proceso comercial de
Tueste con métricas de marketing, ventas y suscripción, y documente una futura
arquitectura multiagente gobernada por aprobación humana.

### Objetivos específicos

1. Extender el modelo financiero original con entidades CRM y comerciales en
   tercera forma normal.
2. Registrar campañas, contenidos, recorrido, embudo, handoffs y suscripciones.
3. Calcular CPC, CTR, CAC, ROAS, conversiones, ciclo y ticket desde hechos.
4. Cargar un conjunto ficticio coherente y reproducible en una base aislada.
5. Exponer información mediante una API de solo lectura y un frontend DEMO.
6. Mantener métricas financieras parciales claramente diferenciadas.
7. Diseñar siete agentes especializados y un orquestador sin atribuirles una
   implementación inexistente.

## 5. Solución propuesta

La solución combina cuatro resultados existentes y una propuesta futura:

1. **Modelo de datos:** 12 tablas financieras originales y 24 tablas
   comerciales nuevas.
2. **Datos DEMO:** 514 registros ficticios, identificados como `[DEMO]`,
   `DEMO_` o `example.invalid`.
3. **API e interfaz:** consultas de solo lectura y siete secciones comerciales.
4. **Analítica:** 16 consultas SQL y motor financiero independiente.
5. **Arquitectura futura:** siete agentes coordinados exclusivamente por un
   orquestador con aprobación humana.

La arquitectura multiagente no está implementada. Es un diseño académico con
contratos, responsabilidades, RACI, riesgos y límites de autonomía.

## 6. Arquitectura tecnológica

### Componentes existentes

- **React + Vite:** interfaz, navegación, estados de carga/error y banner DEMO.
- **Express:** API con 22 rutas `GET` y manejo consistente de errores.
- **MySQL 8:** esquema relacional DEMO de 36 tablas.
- **financialEngine.js:** funciones financieras puras y probadas.
- **Variables de entorno:** selección explícita del modo DEMO sin credenciales
  versionadas.

Flujo actual:

```text
Usuario → React → Express GET → MySQL DEMO
                    ↘ motor financiero independiente
```

### Componentes propuestos

El orquestador, los agentes especializados, conectores externos, bandeja de
aprobación y endpoints de escritura son únicamente diseños. La API actual no
permite mutaciones.

### Correspondencia con los criterios oficiales

| Criterio oficial | Evidencia principal |
|---|---|
| 1. Análisis comercial e identificación de entidades (20 %) | Secciones 2–5, 8–10 y `database/modelo_comercial_propuesto.md` |
| 2. Diagrama ER, cardinalidades e intermedias (20 %) | Sección 7 y `entrega/diagramas/diagrama_er_comercial.svg` |
| 3. SQL, integridad y 3FN (20 %) | Sección 7 y `entrega/tueste_business_solutions.sql` |
| 4. Datos ficticios y consultas (20 %) | Sección 11, 514 registros y consultas incluidas en el SQL |
| 5. Agentes, orquestador, diagrama y flujo (20 %) | Secciones 12–14 y documentación en `docs/` |

## 7. Modelo de datos y normalización

### Alcance

Las 12 tablas originales gestionan productos, ofertas, costos, supuestos,
histórico, escenarios y simulaciones. Las 24 nuevas cubren:

- equipo, canales, campañas y métricas;
- contactos, recorrido, leads, etapas y oportunidades;
- contenidos, canales y revisiones;
- handoffs y seguimientos;
- planes, suscripciones, pedidos, entregas y eventos;
- atribución de campañas.

### Tercera forma normal

El diseño busca 3FN mediante:

- catálogos separados para canales y etapas;
- hechos diarios separados de campañas;
- historiales separados del estado actual;
- tablas N:M `offer_products`, `content_channels`, `subscription_items` y
  `simulation_config_scenarios`;
- métricas derivadas calculadas, no almacenadas;
- atribución única por lead y suscripción;
- claves foráneas con tipos compatibles.

Las instantáneas de precio/costo en líneas de pedido describen el evento
histórico, no el precio actual del catálogo. Las duplicaciones controladas de
estado (`content_items.status`, `subscriptions.status`) se justifican por acceso
operativo y deben actualizarse atómicamente con sus historiales.

### Integridad

La prueba aislada en MySQL 8.0.46 creó 36 tablas, 51 FK y 51 restricciones
`CHECK`. Se verificaron fechas, cantidades, importes, estados, etapa abierta y
atribución única.

## 8. CRM y recorrido del cliente

El CRM académico se construye con `contacts`, `leads`,
`sales_opportunities` y `subscriptions`. Un contacto puede participar en más de
un ciclo comercial sin duplicar su identidad.

El recorrido se clasifica con cinco etapas: conciencia, consideración, decisión,
retención y recomendación. `customer_touchpoints` registra el momento, tipo y
origen de cada interacción. El conjunto DEMO contiene 12 contactos y 32
touchpoints.

La consulta SQL 12 reconstruye cronológicamente el recorrido de un contacto. La
aplicación actual no incluye una pantalla dedicada a dicho recorrido, por lo que
esta parte es demostrable mediante SQL y modelo, pero la evidencia visual de UI
permanece parcial.

## 9. Campañas y proceso de marketing

`marketing_channels` normaliza canales pagados, orgánicos, referidos y directos.
`campaigns` almacena objetivo, periodo, estado y presupuesto planificado.
`campaign_daily_metrics` almacena hechos diarios de gasto, impresiones y clics.

El contenido se modela en `content_items`, se distribuye mediante
`content_channels` y conserva revisiones en `content_reviews`. Rechazos y
solicitudes de cambio requieren comentario. La API y la interfaz son de lectura;
no existe publicación automática ni workflow transaccional funcional.

El presupuesto no se suma al gasto. La consulta 3 compara presupuesto con gasto
de medios y otros costos, y calcula saldo sin duplicar filas.

## 10. Embudo y traspaso a ventas

El embudo usa cinco etapas ordenadas. `lead_stage_history` conserva transiciones
y limita a una etapa abierta por lead. `sales_opportunities` registra valor,
estado y fechas para calcular ciclo de venta.

El handoff formal se registra en `marketing_sales_handoffs`, con responsables de
marketing y ventas, número de intento, decisión y motivo de rechazo.
`handoff_followups` conserva seguimientos. En el DEMO hay diez aceptados, uno
rechazado y uno pendiente.

La responsabilidad permanece humana: el diseño de agentes puede preparar y
validar el expediente, pero no aceptar ni cerrar por ventas.

## 11. Métricas SQL y resultados DEMO

Se prepararon y ejecutaron 16 consultas SQL. Los resultados globales fueron
reconciliados con la API:

| Métrica DEMO | Fórmula | Resultado |
|---|---|---:|
| CPC | USD 7.350 / 10.200 clics | USD 0,720588 |
| CTR | 10.200 / 378.200 impresiones | 2,697 % |
| CAC | USD 7.935 / 10 suscripciones atribuidas | USD 793,50 |
| ROAS | USD 1.122,80 / USD 7.350 | 0,152762 |
| Conversión lead→suscripción | 10 / 12 | 83,33 % |
| Ciclo promedio cerrado | Promedio de 11 oportunidades | 9,2841 días |
| Ticket promedio | USD 1.122,80 / 22 pedidos | USD 51,036364 |

Los datos son ficticios. Un CPC anterior de USD 0,736568 y CTR de 2,68 % fueron
descartados porque provenían de una unión que multiplicaba filas. Las cifras de
esta tabla agregan cada fuente antes de relacionarla.

Las consultas 14–16 producen margen, LTV observado y flujo operativo parciales.
No incluyen todos los costos y movimientos necesarios. LTV/CAC, payback y flujo
de caja completo siguen como información insuficiente.

## 12. Arquitectura de agentes

Se diseñaron siete especialistas:

1. Campañas y publicidad.
2. Contenidos y calendario editorial.
3. Revisión y aprobaciones.
4. Embudo y seguimiento de leads.
5. Traspaso entre marketing y ventas.
6. Suscripciones y clientes.
7. Analítica comercial y financiera.

Cada agente cuenta con objetivo, entradas, salidas, tablas, endpoints, reglas,
límites, aprobaciones y ejemplo. Ninguno está implementado. Los criterios de
evaluación propuestos penalizan como fallo crítico inventar datos, escribir sin
aprobación, presentar DEMO como real o eludir al orquestador.

## 13. Agente orquestador

El orquestador propuesto recibe solicitudes, interpreta intención, clasifica la
operación, divide tareas, elige agentes, valida resultados, solicita aprobación y
consolida la respuesta. Los agentes especializados no se comunican directamente.

Las lecturas y borradores no persistidos pueden avanzar sin una aprobación
adicional. Toda escritura futura, gasto, publicación, contacto, cambio de etapa,
aceptación, cobro, alta, cancelación o publicación externa requiere aprobación
humana específica.

Los contratos JSON propuestos incluyen `request_id`, `task_id`, alcance,
endpoints permitidos, clasificación DEMO, evidencia, supuestos, limitaciones y
estado. No constituyen endpoints implementados.

## 14. Caso de uso completo

El caso propuesto inicia con una campaña para captar suscriptores empresariales:

1. Campañas prepara plan y presupuesto.
2. Contenidos elabora piezas y calendario.
3. Revisión recomienda aprobar, rechazar o cambiar.
4. Una persona autoriza publicación.
5. Embudo recibe interacciones normalizadas y leads.
6. Marketing confirma calificación y etapa.
7. Handoff prepara la entrega; ventas decide.
8. Suscripciones prepara plan y alta después de un cierre ganado.
9. Operaciones sigue pedidos, entregas y eventos.
10. Analítica calcula indicadores y el orquestador consolida.

Cada paso tiene fuentes, intercambio y aprobación definidos en
`docs/flujo_ejemplo_agentes.md`.

## 15. Validaciones

### Base y datos

- 36 tablas creadas en base temporal aislada.
- 514 registros ficticios.
- Mínimos conservadores de cinco registros en catálogos y diez en movimientos.
- Cero FK huérfanas en controles críticos.
- Cero errores de cronología, atribución duplicada o total de pedido.
- Clics siempre menores o iguales a impresiones.

### SQL y API

- 16 consultas ejecutables.
- 22 endpoints `GET` verificados.
- Métricas reconciliadas entre resultados SQL y API.
- Manejo de error consistente y modo DEMO explícito.

### Código

- 15 pruebas aprobadas en Etapa 3.
- Compilación Vite exitosa.
- Rutas financieras anteriores conservadas.
- `financialEngine.js` no fue sustituido.

### Documentación

- Siete agentes diferenciados.
- Coordinación exclusiva por orquestador.
- Matriz RACI, riesgos, evaluación y contratos propuestos.
- Fuentes Mermaid disponibles; render visual pendiente.

## 16. Limitaciones

- No hay bibliografía académica verificada en el repositorio.
- Los datos son sintéticos y no permiten conclusiones reales sobre Tueste.
- No hay autenticación, autorización, auditoría ni endpoints de escritura.
- No existen agentes funcionales ni conectores externos.
- El CRM es una demostración de datos/consulta, no un sistema operativo completo.
- El calendario editorial no tiene vista de calendario.
- El recorrido del cliente no tiene pantalla dedicada.
- Los diagramas se exportaron a SVG y PNG mediante un generador local sin
  dependencias; deben revisarse nuevamente al maquetar el PDF definitivo.
- No se obtuvieron capturas durante esta auditoría.
- El `README.md` raíz conserva una descripción de una etapa inicial y afirma que
  datos/conexión se incorporarían después; debe actualizarse antes de la entrega,
  pero no se modificó en esta etapa por la restricción de cambiar solo entregables.
- Margen, LTV y flujo operativo son parciales.
- Payback, LTV/CAC y flujo de caja completo no tienen información suficiente.

## 17. Conclusiones

Tueste Analytics demuestra una cadena coherente desde marketing hasta ingresos
recurrentes. El modelo relacional evita almacenar indicadores derivados y usa
historiales y relaciones N:M para mantener trazabilidad. Las consultas y la API
permiten explicar indicadores comerciales sin presentar datos ficticios como
reales.

La arquitectura multiagente agrega una capa académica de especialización y
gobierno. Su principal decisión es que la autonomía no equivale a autorización:
el orquestador centraliza la coordinación y las personas conservan las decisiones
con impacto comercial, financiero o externo.

La entrega cubre los cinco criterios oficiales en sus artefactos técnicos y
documentales. No debe considerarse lista para envío hasta completar datos de
portada, bibliografía verificable si el profesor la exige y capturas reales.

## 18. Bibliografía

No se encontraron fuentes bibliográficas externas verificadas en el repositorio.
Para evitar referencias inventadas, quedan los siguientes marcadores:

- `[PENDIENTE: fuente académica verificable sobre tercera forma normal]`.
- `[PENDIENTE: fuente académica verificable sobre CRM y customer journey]`.
- `[PENDIENTE: fuente verificable sobre CPC, CTR, CAC y ROAS]`.
- `[PENDIENTE: fuente académica verificable sobre arquitecturas multiagente]`.
- `[PENDIENTE: documentación oficial de React, Express, MySQL y Mermaid, con fecha de consulta]`.
- `[PENDIENTE: formato requerido: APA 7, IEEE u otro]`.

Las fuentes deben ser aportadas y verificadas por el estudiante, incluyendo
autor, título, publicación, año, DOI/URL y fecha de consulta cuando aplique.

## 19. Anexos

### Anexo A. Esquema y datos

- `database/schema_actual.sql`
- `database/migracion_comercial_propuesta.sql`
- `database/diagrama_er_comercial.mmd`
- `entrega/diagramas/diagrama_er_comercial.svg`
- `entrega/diagramas/diagrama_er_comercial.png`
- `database/datos_ficticios_tueste.sql`
- `database/validacion_datos_ficticios.md`

### Anexo B. Métricas

- `database/consultas_metricas_propuestas.sql`
- `database/resultados_metricas_demo.md`

### Anexo C. Aplicación

- `backend/app.js`
- `backend/app.test.js`
- `src/components/CommercialDashboard.jsx`
- `src/calculations/financialEngine.js`

### Anexo D. Agentes

- `docs/arquitectura_agentes.md`
- `docs/fichas_agentes.md`
- `docs/orquestador.md`
- `docs/flujo_ejemplo_agentes.md`
- `docs/diagrama_arquitectura_agentes.mmd`
- `entrega/diagramas/diagrama_arquitectura_agentes.svg`
- `entrega/diagramas/diagrama_arquitectura_agentes.png`
- `docs/evaluacion_agentes.md`
- `docs/contratos_agentes.md`
- `docs/matriz_raci.md`
- `docs/matriz_riesgos.md`

### Anexo E. Auditoría

- `docs/matriz_requisitos.md`
- `docs/checklist_evidencias.md`
- `entrega/tueste_business_solutions.sql`


# Arquitectura multiagente propuesta para Tueste Analytics

## Propósito académico

La arquitectura organiza Business Solutions en siete agentes especializados y
un orquestador central. Se alinea con el proceso comercial modelado en las 36
tablas MySQL y con los 22 endpoints `GET` existentes, sin afirmar que los agentes
ya estén implementados.

## Componentes existentes

- **React:** interfaz DEMO con dashboard, campañas, embudo, clientes,
  suscripciones, contenidos, handoffs e indicadores.
- **Express:** API de solo lectura con 22 rutas funcionales.
- **MySQL:** `tueste_analytics_test_migration`, con 36 tablas y datos ficticios.
- **Motor financiero:** `financialEngine.js`, independiente de la API.
- **Aprobación humana actual:** decisiones realizadas fuera del software; no hay
  módulo de workflow de aprobaciones humanas generales.

## Componentes propuestos

- Orquestador Business Solutions.
- Siete agentes especializados.
- Runtime de agentes, contratos de tareas, bitácora y políticas.
- Conectores externos con permisos mínimos.
- Servicio transaccional de acciones futuras.
- Bandeja verificable de aprobaciones humanas.

## Capas

1. **Experiencia:** React recibe solicitudes y muestra resultados/solicitudes de
   aprobación.
2. **Aplicación:** Express autenticaría, autorizaría y expondría herramientas de
   lectura o acciones controladas. Actualmente solo ofrece lectura.
3. **Orquestación propuesta:** interpreta, divide, coordina y consolida.
4. **Especialización propuesta:** agentes con dominios y permisos limitados.
5. **Datos:** MySQL como fuente canónica; motor financiero para cálculos que
   cuenten con entradas suficientes.
6. **Integraciones propuestas:** publicidad, CRM, calendario, contenidos, correo,
   pagos y logística.

## Principios de diseño

- Coordinación centralizada: ningún agente especializado llama a otro.
- Mínimo privilegio y contexto mínimo.
- Lectura por defecto; escritura excepcional y aprobada.
- Separación entre borrador, aprobación y ejecución.
- Métricas reproducibles y sin doble conteo.
- Etiquetado permanente de datos ficticios.
- Trazabilidad de fuentes, fórmulas y decisiones.
- Estados financieros `complete`, `partial` o `insufficient_data`.
- El agente analítico usa, pero no reemplaza, `financialEngine.js`.

## Cobertura del proceso

| Proceso | Agente | Fuentes principales | API existente |
|---|---|---|---|
| Pauta y presupuesto | Campañas | `campaigns`, `campaign_daily_metrics` | `/api/commercial/campaigns` |
| Calendario y piezas | Contenidos | `content_items`, `content_channels` | `/api/commercial/contents` |
| Control editorial | Revisión | `content_reviews` | `/api/commercial/contents` |
| Captación y calificación | Embudo | `leads`, `lead_stage_history` | `/api/commercial/funnel`, `/api/commercial/conversions` |
| Entrega a ventas | Handoff | `marketing_sales_handoffs`, `handoff_followups` | `/api/commercial/handoffs` |
| Alta y recurrencia | Suscripciones | `subscriptions`, pedidos y eventos | `/api/commercial/subscriptions`, `/api/commercial/orders` |
| Medición | Analítica | métricas, atribuciones, pedidos y costos | `/api/commercial/summary`, `/api/commercial/financial-status` |

## Fronteras de seguridad

La API actual no expone escritura. En una implementación futura, el orquestador
no recibiría acceso SQL directo. Llamaría herramientas de dominio que validen
identidad, autorización, idempotencia, esquema, estado previo, aprobación y
transacción. Las credenciales permanecerían fuera de prompts y bitácoras.

## Artefactos relacionados

- `docs/fichas_agentes.md`: contrato de cada especialista.
- `docs/orquestador.md`: protocolo central y política de aprobación.
- `docs/flujo_ejemplo_agentes.md`: recorrido empresarial completo.
- `docs/diagrama_arquitectura_agentes.mmd`: diagrama Mermaid independiente.
- `database/modelo_comercial_propuesto.md`: justificación del modelo.
- `database/resultados_metricas_demo.md`: fórmulas y resultados DEMO.


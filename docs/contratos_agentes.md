# Contratos JSON propuestos para agentes

## Estado y convenciones

Estos contratos son **propuestas académicas**, no endpoints ni formatos
implementados. No contienen credenciales ni autorizan escrituras. Fechas en
ISO-8601, importes en USD y porcentajes como fracciones entre 0 y 1.

## Sobre de entrada común

```json
{
  "request_id": "req_demo_001",
  "task_id": "task_demo_001_01",
  "agent": "campaigns",
  "operation": "read",
  "data_classification": "DEMO",
  "scope": {
    "database": "tueste_analytics_test_migration",
    "period_start": "2026-01-01",
    "period_end": "2026-03-31",
    "allowed_endpoints": ["/api/commercial/campaigns"]
  },
  "input": {},
  "approval": null,
  "requested_output": "campaign_analysis"
}
```

## Sobre de salida común

```json
{
  "request_id": "req_demo_001",
  "task_id": "task_demo_001_01",
  "agent": "campaigns",
  "status": "complete",
  "data_classification": "DEMO",
  "result": {},
  "evidence": {
    "endpoints": ["/api/commercial/campaigns"],
    "tables": ["campaigns", "campaign_daily_metrics"],
    "period_start": "2026-01-01",
    "period_end": "2026-03-31"
  },
  "assumptions": [],
  "limitations": [],
  "approval_required": false,
  "proposed_action": null
}
```

## Ejemplo: campañas y publicidad

```json
{
  "request_id": "req_demo_010",
  "task_id": "task_demo_010_01",
  "agent": "campaigns",
  "operation": "draft",
  "data_classification": "DEMO",
  "scope": {
    "segment": "business",
    "allowed_endpoints": [
      "/api/commercial/channels",
      "/api/commercial/campaigns"
    ]
  },
  "input": {
    "objective": "captar suscriptores empresariales",
    "maximum_budget_usd": 8000,
    "duration_days": 30
  },
  "approval": null,
  "requested_output": "campaign_draft"
}
```

Salida esperada abreviada:

```json
{
  "request_id": "req_demo_010",
  "task_id": "task_demo_010_01",
  "agent": "campaigns",
  "status": "partial",
  "result": {
    "draft": {
      "segment": "business",
      "planned_budget_usd": 8000,
      "status": "draft"
    }
  },
  "evidence": {
    "endpoints": ["/api/commercial/channels"],
    "tables": ["marketing_channels", "campaigns"]
  },
  "assumptions": [],
  "limitations": ["La campaña no ha sido creada ni publicada."],
  "approval_required": true,
  "proposed_action": "approve_campaign_plan"
}
```

## Ejemplo: revisión editorial

```json
{
  "request_id": "req_demo_011",
  "task_id": "task_demo_011_03",
  "agent": "content_review",
  "operation": "draft",
  "data_classification": "DEMO",
  "scope": {
    "content_id": 9,
    "allowed_endpoints": ["/api/commercial/contents"]
  },
  "input": {
    "version": "v2",
    "review_criteria": ["exactitud", "marca", "cumplimiento"]
  },
  "approval": null,
  "requested_output": "review_recommendation"
}
```

```json
{
  "request_id": "req_demo_011",
  "task_id": "task_demo_011_03",
  "agent": "content_review",
  "status": "complete",
  "result": {
    "recommended_action": "changes_requested",
    "comment": "La afirmación de ahorro requiere una fuente verificable."
  },
  "evidence": {
    "endpoints": ["/api/commercial/contents"],
    "tables": ["content_items", "content_reviews"]
  },
  "assumptions": [],
  "limitations": ["Recomendación; no es aprobación final."],
  "approval_required": true,
  "proposed_action": "human_editorial_decision"
}
```

## Ejemplo: calificación y handoff

```json
{
  "request_id": "req_demo_012",
  "task_id": "task_demo_012_01",
  "agent": "lead_funnel",
  "operation": "read",
  "data_classification": "DEMO",
  "scope": {
    "lead_id": 7,
    "allowed_endpoints": [
      "/api/commercial/funnel",
      "/api/commercial/opportunities",
      "/api/commercial/customers"
    ]
  },
  "input": { "requested_decision": "qualify_for_handoff" },
  "approval": null,
  "requested_output": "qualification_recommendation"
}
```

La salida debe proponer, no ejecutar, un cambio de etapa. Si el orquestador
recibe aprobación, crea una tarea nueva para Handoff; nunca hay llamada directa
entre esos agentes.

## Ejemplo: analítica

```json
{
  "request_id": "req_demo_013",
  "task_id": "task_demo_013_01",
  "agent": "commercial_analytics",
  "operation": "read",
  "data_classification": "DEMO",
  "scope": {
    "period_start": "2026-01-01",
    "period_end": "2026-03-31",
    "allowed_endpoints": [
      "/api/commercial/summary",
      "/api/commercial/campaigns",
      "/api/commercial/conversions",
      "/api/commercial/financial-status"
    ]
  },
  "input": {
    "metrics": ["CPC", "CTR", "CAC", "ROAS", "conversion", "ticket"]
  },
  "approval": null,
  "requested_output": "metric_report"
}
```

```json
{
  "request_id": "req_demo_013",
  "task_id": "task_demo_013_01",
  "agent": "commercial_analytics",
  "status": "complete",
  "data_classification": "DEMO",
  "result": {
    "cpc_usd": 0.720588,
    "ctr_rate": 0.02697,
    "cac_usd": 793.5,
    "roas": 0.152762,
    "lead_to_subscription_rate": 0.8333,
    "average_ticket_usd": 51.036364,
    "financial_completeness": "partial"
  },
  "evidence": {
    "endpoints": [
      "/api/commercial/summary",
      "/api/commercial/campaigns"
    ],
    "tables": [
      "campaign_daily_metrics",
      "campaign_attributions",
      "subscriptions",
      "subscription_orders"
    ]
  },
  "assumptions": [],
  "limitations": [
    "Los datos son ficticios.",
    "No existe información suficiente para payback o flujo de caja completo."
  ],
  "approval_required": false,
  "proposed_action": null
}
```

## Contrato de aprobación propuesto

```json
{
  "approval_id": "approval_demo_001",
  "request_id": "req_demo_010",
  "task_id": "task_demo_010_01",
  "decision": "approved",
  "approved_scope": {
    "action": "create_campaign_draft",
    "maximum_budget_usd": 8000
  },
  "approved_by": "human_role_marketing_manager",
  "expires_at": "2026-11-05T23:59:59-06:00"
}
```

Este contrato seguiría sin ser suficiente para gastar, publicar o activar: cada
acción requiere aprobación específica y un servicio transaccional futuro.


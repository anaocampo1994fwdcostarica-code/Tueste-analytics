# Checklist de evidencias para la entrega

## Estado de las capturas

No se generaron capturas en esta auditoría. Aunque la aplicación y la API local
estaban accesibles durante etapas anteriores, el entorno actual no dispone de una
herramienta de captura de navegador local verificada. No se fabrican imágenes ni
se marca ninguna captura como obtenida.

Convención sugerida: guardar evidencia real en `docs/evidencias/` con nombres
`E01_...`, incluir fecha, entorno DEMO y una breve leyenda. Ocultar credenciales,
variables privadas y datos no destinados a evaluación.

## Capturas requeridas

### Capturas obligatorias del enunciado oficial

1. Ejecución completa y exitosa de `entrega/tueste_business_solutions.sql`.
2. Tablas, claves y relaciones creadas.
3. Conteos que demuestren 36 tablas y 514 registros.
4. CPC, CTR, CAC y ROAS.
5. Conversiones, ciclo de venta y ticket promedio.
6. Comparación de métricas de vanidad y negocio.

Las capturas adicionales de la aplicación y agentes sirven como anexos, pero no
sustituyen estas seis evidencias SQL.

| ID | Evidencia | Vista o comando real | Qué debe quedar visible | Estado |
|---|---|---|---|---|
| E01 | Dashboard React | Frontend local, sección Dashboard | Banner “DATOS FICTICIOS”, campañas, leads, conversión e ingresos | Pendiente de captura |
| E02 | Campañas y métricas | Sección Campañas | Presupuesto, gasto, CPC, CTR, CAC y ROAS de varias campañas | Pendiente de captura |
| E03 | Embudo de ventas | Sección Embudo | Barras de etapas, conversiones y oportunidades | Pendiente de captura |
| E04 | Clientes y suscripciones | Sección Clientes | Hogares/empresas, plan, estado, pedidos e ingresos | Pendiente de captura |
| E05 | Contenidos y aprobaciones | Sección Contenidos | Estados publicado, aprobado, revisión y rechazado | Pendiente de captura |
| E06 | Handoffs | Sección Traspasos | Aceptado, rechazado, pendiente, horas y seguimientos | Pendiente de captura |
| E07 | Estado financiero | Sección Indicadores financieros | Diferencia entre completo, parcial e insuficiente | Pendiente de captura |
| E08 | Salud de API | `GET /api/health` | Modo DEMO, base temporal y 36 tablas; sin credenciales | Pendiente de captura |
| E09 | Resumen de API | `GET /api/commercial/summary` | 10 campañas, 12 leads, 10 convertidos, 22 pedidos, ingresos y ticket | Pendiente de captura |
| E10 | Campañas de API | `GET /api/commercial/campaigns` | Filas y métricas que permitan reconciliar CPC/CTR/CAC/ROAS | Pendiente de captura |
| E11 | Esquema MySQL | Cliente MySQL sobre base temporal | Nombre de la base DEMO y lista de 36 tablas | Pendiente de captura |
| E12 | Relaciones MySQL | Inspector de FK o `INFORMATION_SCHEMA` | FK principales de campaña→atribución→suscripción→pedido | Pendiente de captura |
| E13 | Conteos de datos | Consulta de conteos | 514 registros totales y mínimos 5/10 | Pendiente de captura |
| E14 | Consultas SQL | Ejecución de consultas 1, 4, 5, 6, 9 y 11 | Fórmula y resultado, sin modificar datos | Pendiente de captura |
| E15 | Diagrama ER | `entrega/diagramas/diagrama_er_comercial.svg` y `.png` | Entidades legibles, cardinalidades y tablas intermedias | Disponible |
| E16 | Arquitectura de agentes | `entrega/diagramas/diagrama_arquitectura_agentes.svg` y `.png` | Existente vs. propuesto, orquestador y aprobaciones | Disponible |
| E17 | Pruebas | Terminal con `npm test` | 15 pruebas aprobadas y cero fallos | Pendiente de captura |
| E18 | Compilación | Terminal con `npm run build` | Compilación exitosa | Pendiente de captura |

## Evidencias textuales ya disponibles

- Conteos por tabla: `database/validacion_datos_ficticios.md`.
- Métricas y fórmulas: `database/resultados_metricas_demo.md`.
- SQL: `database/consultas_metricas_propuestas.sql`.
- Esquema verificado: `database/schema_actual.sql` y migración propuesta.
- API: `backend/app.js` y pruebas de rutas.
- Componentes React: `src/components/CommercialDashboard.jsx`.
- Agentes y orquestador: documentos en `docs/`.
- Diagramas fuente: ambos archivos `.mmd`; exportaciones SVG y PNG disponibles en `entrega/diagramas/`.

## Protocolo de captura

1. Confirmar visualmente el banner DEMO.
2. Usar únicamente `tueste_analytics_test_migration`.
3. No mostrar `.env`, contraseñas ni conexiones guardadas.
4. Capturar la ventana completa o incluir suficiente contexto para evitar una
   imagen ambigua.
5. No editar cifras en la imagen.
6. Registrar fecha, URL/comando y descripción en el pie de figura.
7. Reconciliar las cifras con `resultados_metricas_demo.md` antes de entregar.


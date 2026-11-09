# Reto 2 — Fase 3: Tueste Rewards

Estado: implementado y validado por pruebas automatizadas; revisión visual manual pendiente.

## Arquitectura

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Dominio Growth | `src/growth/growthEngine.js` | Costo, límites y validación de conversiones reutilizados sin duplicar fórmulas. |
| Estado DEMO | `src/growth/rewardsDemo.js` | Configuración, enlace, WhatsApp, eventos, idempotencia, persistencia y reinicio. |
| UI | `src/components/TuesteRewards.jsx` | Pantallas, interacciones y avisos visibles. |
| Integración | `src/App.jsx`, `src/components/Sidebar.jsx`, `src/styles.css` | Ruta `#tueste-rewards`, navegación y diseño responsive. |

No se usa MySQL ni se escribe ningún pedido, pago, cliente o recompensa comercial real. El estado vive solo en `localStorage` bajo `tueste-rewards-demo-v1` y es versionado (`version: 1`). Un JSON corrupto o de otra versión vuelve al estado determinista inicial.

## Pantallas funcionales

1. **Inicio:** beneficio, estado de Mar (cliente DEMO), niveles propuestos y acceso a historial.
2. **Mi enlace:** código `MAR-CAFE-24`, URL personal, copia y URL de intención de WhatsApp.
3. **Progreso:** invitados, registros, compras válidas, recompensas, barra de avance y costo DEMO.
4. **Historial:** entrega, invitaciones, registros, conversiones y recompensas con fechas.
5. **Simulador DEMO:** crear referido, registrar, compra válida e inicio limpio.

## Reglas implementadas

- Una invitación no es una conversión ni genera premio.
- El registro debe ocurrir antes de una compra elegible simulada.
- Autoinvitaciones, amigos duplicados, registros duplicados y compras duplicadas se rechazan.
- El `eventId` de compra y el `referralId` hacen idempotente la conversión.
- Las recompensas separan estados `earned`, `pending` e `incurred`.
- El costo se calcula con `calculateRewardCost` del motor Growth.
- Compartir por WhatsApp utiliza `https://wa.me/?text=...`; abre una intención de compartir y no declara envío exitoso.

## Configuración de recompensas

`REWARD_CONFIG` está centralizada y marcada como `PROPOSED_ASSUMPTION`, no como regla oficial confirmada:

| Umbral DEMO | Beneficio | Costo DEMO |
|---|---|---:|
| Primera compra válida | USD 5 de bienvenida para el amigo + muestra de 100 g para invitador | USD 5,00 + USD 1,60 |
| Tres compras válidas | Bono para invitador | USD 6,00 |

El límite de USD 25 por referido se muestra solo como tope derivado pendiente de validar el fee de Parte 1 contra el PDF. No se presenta como política definitiva.

## Pruebas y build

- `npm test`: **75 aprobadas, 0 fallos** después de añadir la prueba del segundo nivel.
- Cobertura nueva: enlace, WhatsApp codificado, registro, autoinvitación, duplicado, compra idempotente, dos umbrales de recompensa, costo, persistencia, JSON corrupto y reinicio.
- `npm run build`: correcto, 49 módulos transformados. Se mantiene únicamente la advertencia no bloqueante sobre el fragmento dinámico de ExcelJS mayor de 500 kB; no se alteró la aplicación financiera.

## Limitaciones y pendientes

- No hubo navegador automatizable; queda revisión visual manual de escritorio y móvil.
- `localStorage` no sincroniza entre dispositivos ni representa backend, WhatsApp, pagos, correo o pedidos reales.
- Falta verificar directamente el PDF oficial con un extractor disponible y confirmar la política final de costos, niveles y elegibilidad.
- Fase 4 pendiente: panel de Diego, ciclo visual, experimentos A/B, cohortes, matriz de canales y plan de 90 días.

## Cómo probar localmente

1. Ejecutar `npm run dev` desde la raíz del proyecto.
2. Abrir la URL mostrada por Vite y elegir **Tueste Rewards** en la navegación.
3. Abrir **Simulador DEMO** y ejecutar los tres pasos en orden.
4. Consultar **Progreso** e **Historial**.
5. Recargar la página para comprobar persistencia o usar **Reiniciar escenario DEMO** para volver al caso inicial.

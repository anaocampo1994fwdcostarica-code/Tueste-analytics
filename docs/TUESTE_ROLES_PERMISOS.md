# Roles y permisos DEMO de Tueste

## Roles

- **Invitado:** accede a la landing, abre invitaciones válidas y utiliza Rewards.
- **Cliente DEMO:** accede a Rewards, comparte enlaces y consulta su progreso.
- **Administrador DEMO:** accede a Growth, módulos financieros y herramientas DEMO.

## Matriz resumida

| Recurso | Invitado | Cliente | Administrador |
|---|---:|---:|---:|
| Landing pública | Sí | Sí | Sí |
| Tueste Rewards | Sí | Sí | Sí |
| Panel Growth | No | No | Sí |
| Reto 1 financiero | No | No | Sí |

## Navegación

La configuración de rutas permitidas reside en `src/config/accessControl.js`. Las rutas administrativas verifican el rol antes de renderizarse y el menú lateral filtra enlaces no autorizados.

## Persistencia

El rol DEMO se conserva en `sessionStorage`, independientemente del estado de Rewards. Un reinicio de pestaña o sesión vuelve al rol invitado. Los datos de Rewards continúan en su almacenamiento existente.

## Limitaciones

Estos controles son restricciones de experiencia DEMO. React y el navegador pueden ser manipulados por el usuario; no constituyen autenticación ni autorización segura. La protección real requerirá backend y verificación de identidad.

## Validación

Se agregaron pruebas para permisos de invitado, cliente, administrador y persistencia DEMO. También se ejecutarán la suite completa y el build de Vite.

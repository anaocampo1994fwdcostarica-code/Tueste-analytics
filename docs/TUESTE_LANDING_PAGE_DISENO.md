# Tueste — Landing page premium

## Diseño y referencia

La landing se diseñó como una experiencia editorial de café de especialidad inspirada en la composición de Kawah: encabezado sobre fotografía, espacios amplios, narrativa por secciones, bloques alternados y cierre visual. No se reutilizó código, logotipo ni fotografía de Kawah.

## Recursos visuales

Las cinco imágenes adjuntas por el equipo se copiaron a `src/assets/landing/` para uso local. El origen de las fotografías queda pendiente de documentar con licencia o autorización antes de una publicación pública.

## Arquitectura

- Ruta inicial: hash vacío y `#inicio`.
- Experiencia pública: `LandingPage.jsx`.
- Cliente: `#tueste-rewards`.
- Administrador DEMO: `#panel-growth`.
- Herramientas financieras: hashes existentes conservados.
- Enlace de amigo: `#tueste-rewards?ref=MAR-CAFE-24`.

La landing conserva el estado de Rewards y los motores existentes. El selector de roles no representa autenticación real.

## Accesibilidad y responsive

Se incluyen navegación móvil, estados de foco, textos alternativos, menú accesible y reducción de movimiento. Se verificará visualmente en 320, 375, 450, 768, 1024 y 1440 px.

## Limitaciones

Las seis fincas, recompensas y beneficios se mantienen dentro de las restricciones del caso. No se hicieron públicas certificaciones, nombres de fincas ni datos comerciales no respaldados.

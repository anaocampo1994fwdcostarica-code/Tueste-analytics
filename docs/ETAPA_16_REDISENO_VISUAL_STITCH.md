# Etapa 16 — Rediseño visual profesional con Google Stitch

Fecha: 6 de noviembre de 2026  
Alcance: capa de presentación React/CSS. No se cambiaron motores, fórmulas, datos, exportaciones ni navegación.

## Tokens aplicados

| Grupo | Tokens |
|---|---|
| Marca | Caramelo `#6D3C1C`, Miel `#C57938`, Vainilla `#E7C696`, Matcha `#A3B18A`, Matcha oscuro `#2D5A43` |
| Superficies | Base `#FFF8F3`, tarjeta blanca, sutil `#FDF9F5`, sidebar `#FAF3EC` |
| Bordes | Sutil `#F0E5D8`, tarjetas `#EADBC8` |
| Tipografía | Newsreader con fallback Georgia para títulos/métricas; Inter con fallback system-ui para interfaz |
| Forma | Radios 8/12/16 px y sombra cálida discreta |

Las fuentes se solicitan desde Google Fonts con fallback local; la interfaz no queda inutilizable si no hay red.

## Archivos modificados

- `src/styles.css`: importación de fuentes, tokens Stitch y overrides de sidebar, tarjetas, botones, controles, gráficos, tablas, estados y responsive.
- `src/components/Dashboard.jsx`, `src/components/LevelTwoDashboard.jsx`, `src/components/LevelThreeSimulator.jsx`: solamente constantes de color SVG para alinear las series a Stitch.

No se modificaron componentes de cálculo ni los archivos de `src/financial/` durante esta etapa.

## Cambios visuales

### Navegación

- Sidebar vainilla, texto caramelo, activo miel y hover suave.
- Marca editorial con Newsreader y acento matcha.
- Navegación responsive conserva todas las rutas y el colapso existente.

### Niveles 1 y dashboard principal

- Encabezados y métricas con jerarquía editorial.
- Tarjetas blancas cálidas con borde suave, sombra ligera y valores destacados.
- Acciones primarias miel, secundarias blancas y foco visible.
- Inputs calculados/editarles con tratamiento consistente y contraste legible.

### Nivel 2

- Panel de controles, tarjetas de indicadores, semáforo y comparación ROAS adaptados a la paleta.
- Estados semánticos conservados: rojo para riesgo, miel/amarillo para precaución y matcha para saludable.
- Referencias 1:1, 3:1, ejes y leyendas reciben contraste cálido y legible.

### Nivel 3

- Cuatro planes conservan colores distinguibles, con énfasis matcha para propuesta propia y tono de alerta para Agencia.
- Tablas de 24 meses, gráfico, tarjetas de caja, editor y pitch heredan superficies, bordes, scroll horizontal y foco de controles.

### Responsive

- A 1050 px, planes se reorganizan en dos columnas.
- A 760 px, indicadores y planes pasan a una columna; tablas permanecen desplazables y los gráficos pueden desplazarse horizontalmente en vez de recortarse.

## Validación

- `npm test`: **64 aprobadas, 0 fallos**.
- `npm run build`: correcto, 46 módulos transformados.
- Advertencia no bloqueante: fragmento dinámico de ExcelJS mayor de 500 kB.

## Riesgos y pendientes

- No hay navegador automatizable disponible; no se declara revisión visual real de desktop/tablet/móvil ni de consola.
- La carga externa de Google Fonts depende de red, con fallback local definido.
- Debe completarse el checklist visual manual de Parte B antes de publicación académica.

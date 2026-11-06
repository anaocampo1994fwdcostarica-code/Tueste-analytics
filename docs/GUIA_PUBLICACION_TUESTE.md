# Guía de publicación de Tueste Analytics

## Recomendación: Netlify Static Deploy

Se recomienda **Netlify** para el tablero financiero estático porque el build actual usa assets desde `/assets/`, navegación por hash y no necesita reglas de reescritura para `#nivel-2` ni `#nivel-3`. La opción de arrastrar la carpeta `dist/` evita conectar cuentas de código o exponer credenciales.

GitHub Pages también es viable, pero requeriría validar/configurar la base de Vite cuando se publique bajo un subdirectorio. Vercel es una alternativa equivalente si la institución ya lo utiliza.

## Qué funciona sin servidor

Los niveles financieros 1, 2 y 3 se calculan enteramente en el navegador: no requieren MySQL, Express, el puerto 3020 ni secretos. La exportación XLSX usa ExcelJS en el cliente.

El bloque **Comercial DEMO** intenta consultar `/api`. En una publicación estática sin API mostrará su estado de error de conexión, pero no bloquea los niveles financieros. No se debe presentar ese bloque como conectado a MySQL en una publicación estática.

## Publicar sin instalar Node para el evaluador

1. En el equipo de desarrollo, desde el repositorio, ejecutar:

   ```powershell
   npm test
   npm run build
   ```

2. Revisar que exista `dist/index.html` y `dist/assets/`.
3. Entrar a Netlify Drop en una sesión propia autorizada.
4. Arrastrar **el contenido de `dist/`** o seleccionar esa carpeta.
5. Esperar la URL HTTPS que entregue Netlify.
6. Abrir y probar, al menos:

   - `https://<sitio>/`
   - `https://<sitio>/#nivel-2`
   - `https://<sitio>/#nivel-3`

7. No publicar la URL como definitiva hasta completar la lista de comprobación de abajo.

## Variables y API

- Para los niveles financieros no se requiere ninguna variable de entorno.
- No incluir `.env` ni credenciales en el despliegue.
- Solo si se despliega una API comercial independiente y autorizada, reconstruir con `VITE_API_URL=https://<api-autorizada>/api`. Esa URL debe ser pública, de solo lectura y no contener secretos en el frontend.

## Comprobación posterior a publicar

1. Abrir la URL en una ventana privada o equipo sin Node.
2. Cambiar un control de Nivel 2 y comprobar el recálculo.
3. Editar una inversión de Nivel 3 y restaurar el plan.
4. Descargar el reporte XLSX y abrirlo en Excel.
5. Confirmar que no hay `NaN`, `Infinity`, recursos 404 ni credenciales visibles.
6. Registrar la URL y fecha en la evidencia académica.

## Actualizaciones

1. Modificar el código en el repositorio.
2. Ejecutar pruebas y `npm run build` nuevamente.
3. Subir el nuevo contenido de `dist/` al sitio autorizado.
4. Repetir la comprobación posterior. No reemplazar la calculadora Excel editable por el XLSX de resultados.

## Riesgos declarados

- La copia Excel corregida requiere apertura y recálculo real en Excel antes de declarar paridad completa.
- El dashboard Comercial DEMO necesita backend/API aparte; no depende de ello el tablero financiero.
- Netlify no debe recibir bases MySQL, SQL de carga, `.env`, credenciales ni `node_modules`.

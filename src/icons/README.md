# Iconos SVG propios

`astro-icon` escanea este directorio (`iconDir`, por defecto `src/icons`)
en cada build y avisa si no existe. Está vacío a propósito: hoy todos los
iconos vienen de los sets de Iconify declarados en `astro.config.mjs`
(`lucide` y `simple-icons`).

Si en algún momento hace falta un SVG propio —un logo de cliente, una
marca sin equivalente en Iconify—, se coloca aquí como `nombre.svg` y se
referencia con `<Icon name="nombre" />`, sin prefijo de colección.

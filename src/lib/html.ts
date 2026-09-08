/**
 * Escapado de HTML compartido.
 *
 * Lo usan el resaltador de YAML (en build) y el del cuerpo de las respuestas
 * (en el cliente). Estaba duplicado en ambos: la misma regla de seguridad
 * escrita dos veces es la clase de cosa que acaba divergiendo, y aquí lo que
 * divergiría es una defensa contra inyección de markup.
 *
 * Vite lo incluye en el bundle de cliente solo porque el script de la sección
 * lo importa; el resto del módulo no viaja.
 */
export const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

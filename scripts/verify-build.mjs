/**
 * Comprobación de humo sobre `dist/`.
 *
 * Se ejecuta en CI después del build. No sustituye a `astro check` ni a
 * Prettier: verifica lo que ninguno de los dos ve, que es el HTML que
 * realmente se publica. Cada aserción corresponde a una decisión tomada
 * de forma deliberada y que una regresión podría deshacer en silencio,
 * porque el build seguiría pasando igual.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const failures = [];
const checks = [];

function check(name, fn) {
  try {
    const detail = fn();
    checks.push(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    failures.push(`  ✗ ${name} — ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const read = (file) => readFileSync(join(DIST, file), 'utf8');

// --- Artefactos que el despliegue debe publicar
check('artefactos presentes', () => {
  const required = [
    'index.html',
    '404.html',
    'llms.txt',
    'robots.txt',
    'sitemap-index.xml',
    'sitemap-0.xml',
    'manifest.webmanifest',
    'cv.pdf',
    'og.png',
    'apple-touch-icon.png',
  ];
  const missing = required.filter((f) => !existsSync(join(DIST, f)));
  assert(missing.length === 0, `faltan: ${missing.join(', ')}`);
  return `${required.length} archivos`;
});

const html = read('index.html');

// --- CSP: la protección real depende de que NO haya unsafe-inline
check('CSP con hashes y sin unsafe-inline', () => {
  const metas = html.match(/http-equiv="content-security-policy"/gi) ?? [];
  assert(metas.length === 1, `se esperaba 1 meta CSP, hay ${metas.length}`);
  assert(!html.includes('unsafe-inline'), "el CSP contiene 'unsafe-inline'");
  const hashes = html.match(/'sha256-[^']+'/g) ?? [];
  assert(hashes.length > 0, 'el CSP no declara ningún hash');
  return `${hashes.length} hashes`;
});

// --- Datos estructurados: un JSON-LD roto es invisible hasta que Google lo rechaza
check('JSON-LD válido', () => {
  const match = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  assert(match, 'no se emitió JSON-LD');
  const graph = JSON.parse(match[1]);
  assert(Array.isArray(graph['@graph']), 'el JSON-LD no tiene @graph');
  assert(!JSON.stringify(graph).includes('telephone'), 'el JSON-LD expone un teléfono');
  return `@graph con ${graph['@graph'].length} nodos`;
});

// --- Canonicalización: canonical y hreflang deben coincidir exactamente
check('canonical y hreflang coinciden', () => {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const alternates = [
    ...html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g),
  ].map((m) => m[1]);
  assert(canonical, 'no hay canonical');
  assert(alternates.length > 0, 'no hay hreflang');
  const divergent = alternates.filter((href) => href !== canonical);
  assert(divergent.length === 0, `hreflang distinto del canonical: ${divergent.join(', ')}`);
  return canonical;
});

// --- CSS inline: la mejora de LCP depende de que no vuelva a haber hojas externas
check('CSS inlineado, sin hojas externas', () => {
  const external = html.match(/rel="stylesheet"/g) ?? [];
  assert(external.length === 0, `${external.length} hojas de estilo externas`);
  const inline = html.match(/<style/g) ?? [];
  assert(inline.length > 0, 'no hay estilos inline');
  return `${inline.length} bloques inline`;
});

// --- Fuentes: sin preload no hay CLS 0
check('fuentes precargadas', () => {
  const preloads = html.match(/<link rel="preload"[^>]*as="font"[^>]*>/g) ?? [];
  assert(preloads.length === 2, `se esperaban 2 preloads de fuente, hay ${preloads.length}`);
  return '2 fuentes';
});

// --- Los comentarios de desarrollo no deben volver al cliente
check('sin comentarios HTML servidos', () => {
  const comments = html.match(/<!--[\s\S]*?-->/g) ?? [];
  assert(comments.length === 0, `${comments.length} comentarios en el HTML publicado`);
});

// --- Accesibilidad: landmarks y destino del skip-link
check('landmarks y skip-link', () => {
  assert(html.includes('class="skip-link"'), 'falta el skip-link');
  assert(/<main id="main"[^>]*tabindex="-1"/.test(html), 'main sin tabindex="-1"');
  assert(/<footer class="footer"/.test(html), 'falta el footer de documento');
  const notFound = read('404.html');
  assert(/<main id="main"[^>]*tabindex="-1"/.test(notFound), 'la 404 tiene main sin tabindex="-1"');
});

// --- El sitemap debe declarar lastmod real
check('sitemap con lastmod', () => {
  const sitemap = read('sitemap-0.xml');
  const lastmod = sitemap.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  assert(lastmod, 'el sitemap no declara lastmod');
  assert(!Number.isNaN(Date.parse(lastmod)), `lastmod no parseable: ${lastmod}`);
  return lastmod;
});

// --- llms.txt debe llevar contenido real, no un esqueleto vacío
check('llms.txt con contenido', () => {
  const llms = read('llms.txt');
  for (const section of ['## Experiencia', '## Proyectos destacados', '## Habilidades']) {
    assert(llms.includes(section), `falta la sección "${section}"`);
  }
  assert(llms.length > 2000, `demasiado corto: ${llms.length} bytes`);
  return `${llms.length} bytes`;
});

console.log(checks.join('\n'));
if (failures.length > 0) {
  console.error(`\n${failures.length} comprobación(es) fallida(s):\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`\n${checks.length} comprobaciones correctas.`);

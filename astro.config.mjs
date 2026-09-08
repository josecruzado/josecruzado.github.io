// @ts-check
import { execSync } from 'node:child_process';

import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

/**
 * Fecha del último commit, para el `lastmod` del sitemap.
 *
 * Se usa la fecha del commit y no la del build a propósito: cualquier
 * rebuild —un bump de Dependabot, un redeploy manual— afirmaría que el
 * contenido cambió cuando no es cierto, y Google descarta el lastmod de
 * los sitios que lo inflan. La fecha del commit sí describe la última
 * modificación real del sitio.
 *
 * actions/checkout trae el último commit con su fecha incluso con
 * fetch-depth 1. Sin git disponible se omite el campo, que es preferible
 * a publicar una fecha inventada.
 */
function lastCommitDate() {
  try {
    const iso = execSync('git log -1 --format=%cI', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

export default defineConfig({
  site: 'https://josecruzado.github.io',
  trailingSlash: 'ignore',
  // El sitio es one-page (index + 404). El prefetch automático de Astro
  // solo aplica a anchors entre páginas, así que aquí no aporta. El CV
  // se preload manualmente vía <link rel="prefetch"> en SEO.astro.
  prefetch: false,
  markdown: {
    // Las colecciones de content/ solo aportan frontmatter: su cuerpo no
    // se renderiza nunca, así que no hay bloques de código que resaltar.
    // Se desactiva porque, con CSP activo, Shiki emite estilos inline que
    // la política rechaza y Astro avisa de ello en cada build. Si algún
    // día se renderiza markdown con código, la vía compatible con CSP es
    // syntaxHighlight: 'prism'.
    syntaxHighlight: false,
  },
  // Fonts API nativa. Astro descarga las fuentes en build, las auto-aloja,
  // emite los @font-face con subsetting y genera los <link rel=preload>
  // desde el componente <Font />. Sustituye a los @font-face escritos a
  // mano en global.css y al import `?url` que existía solo para que el
  // preload apuntara al mismo archivo hasheado que el @font-face.
  fonts: [
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.fontsource(),
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
    },
    {
      name: 'Cascadia Code',
      cssVariable: '--font-cascadia',
      provider: fontProviders.fontsource(),
      weights: ['200 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
    },
  ],
  // CSP nativo (security.csp, estable desde Astro 6.0). Astro calcula el
  // hash SHA-256 de cada script y estilo inline durante el build y emite
  // él mismo el <meta http-equiv="content-security-policy">, así que
  // `unsafe-inline` desaparece de script-src y style-src: hasta ahora el
  // CSP declarado a mano en SEO.astro lo incluía en ambas y eso lo dejaba
  // sin capacidad real de mitigar XSS.
  //
  // Las directivas de abajo son las que Astro NO deduce solo; script-src
  // y style-src las genera él con los hashes. No se declara `unsafe-inline`
  // en ninguna: los navegadores lo ignoran en cuanto la directiva lleva un
  // hash, de modo que mezclarlos habría anulado el endurecimiento.
  //
  // No aplica en `astro dev` (limitación del dev server de Vite): se
  // verifica con `npm run build && npm run preview`.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // Sin `frame-ancestors`: como Permissions-Policy, la spec obliga
        // al navegador a ignorarla cuando llega en un <meta>. Chromium lo
        // avisa en consola. Solo sirve como header HTTP, fuera del alcance
        // de GitHub Pages.
      ],
    },
  },
  integrations: [
    icon({
      // Ambos sets enumerados. simple-icons ya lo estaba; lucide usaba
      // `['*']`, una asimetría sin motivo. El valor es tener el inventario
      // explícito: qué iconos usa el sitio se lee aquí, y sobra uno en
      // cuanto deja de aparecer en src/.
      //
      // Se midió y NO aporta nada más: el build tarda lo mismo (~2,2s con
      // ambas formas) y emite exactamente los mismos 63 SVG. Un nombre
      // inválido tampoco pasa desapercibido en ninguno de los dos casos —
      // astro-icon aborta el build igual con `['*']`.
      //
      // Los nombres salen de los .astro y del frontmatter `icon` de
      // src/content/projects/*.md: al añadir uno nuevo hay que declararlo
      // aquí o el build falla indicando cuál falta.
      include: {
        lucide: [
          'arrow-down',
          'arrow-left',
          'arrow-right',
          'arrow-up',
          'arrow-up-right',
          'briefcase',
          'chart-no-axes-combined',
          'cloud',
          'code-2',
          'copy',
          'database',
          'download',
          'graduation-cap',
          'house',
          'languages',
          'mail',
          'moon',
          'network',
          'package',
          'send',
          'server',
          'shield-check',
          'sun',
          'terminal',
          'truck',
          'wrench',
        ],
        'simple-icons': [
          'amazonwebservices',
          'angular',
          'apachekafka',
          'docker',
          'git',
          'github',
          'jenkins',
          'kubernetes',
          'linkedin',
          'microsoftazure',
          'mongodb',
          'mysql',
          'nodedotjs',
          'openapiinitiative',
          'openjdk',
          'oracle',
          'quarkus',
          'sonarqube',
          'spring',
          'springboot',
          'terraform',
        ],
      },
    }),
    sitemap({ lastmod: lastCommitDate() }),
  ],
  build: {
    // 'always' en vez de 'auto'. Con 'auto' ninguno de los dos CSS bajaba
    // del umbral de inlining, así que el navegador hacía dos peticiones
    // bloqueantes antes del primer paint. El sitio tiene una sola página
    // real: no hay una segunda navegación que aproveche el CSS cacheado,
    // que era la única ventaja de mantenerlo aparte.
    //
    // Medido en Chromium (mobile 390x844, 4G lento 1,6 Mbps / 150ms RTT,
    // CPU x4, mediana de 7 cargas):
    //   auto    FCP 656ms · LCP 936ms · 5 subrecursos
    //   always  FCP 448ms · LCP 496ms · 3 subrecursos
    //
    // Y transfiere menos: 32.266 B brotli en un recurso frente a 33.060 B
    // repartidos en tres, porque un único flujo comprime mejor que tres.
    inlineStylesheets: 'always',
  },
});

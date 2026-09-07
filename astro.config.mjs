// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://josecruzado.github.io',
  trailingSlash: 'ignore',
  // El sitio es one-page (index + 404). El prefetch automático de Astro
  // solo aplica a anchors entre páginas, así que aquí no aporta. El CV
  // se preload manualmente vía <link rel="prefetch"> en SEO.astro.
  prefetch: false,
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
    sitemap(),
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

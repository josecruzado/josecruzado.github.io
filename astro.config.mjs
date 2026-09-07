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
    inlineStylesheets: 'auto',
  },
});

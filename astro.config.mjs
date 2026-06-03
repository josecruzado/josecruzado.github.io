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
      include: {
        lucide: ['*'],
        'simple-icons': [
          'openjdk',
          'spring',
          'springboot',
          'quarkus',
          'apachekafka',
          'docker',
          'kubernetes',
          'amazonwebservices',
          'microsoftazure',
          'mongodb',
          'oracle',
          'mysql',
          'git',
          'github',
          'linkedin',
          'jenkins',
          'terraform',
          'openapiinitiative',
          'sonarqube',
          'angular',
          'nodedotjs',
        ],
      },
    }),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});

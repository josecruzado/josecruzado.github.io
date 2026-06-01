// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://josecruzado.github.io',
  trailingSlash: 'ignore',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
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
          'gmail',
          'jenkins',
          'terraform',
          'openapiinitiative',
          'sonarqube',
          'angular',
          'nodedotjs',
          'redhatopenshift',
        ],
      },
    }),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});

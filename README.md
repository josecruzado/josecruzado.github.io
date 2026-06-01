# Portfolio · José Cruzado

Sitio personal de **José Félix Cruzado Vega**, Senior Backend Java Developer.
Construido con Astro 6, TypeScript estricto, Content Collections y CSS nativo.

Producción: https://josecruzado.github.io

## Stack

- Astro 6 en modo SSG.
- TypeScript strict.
- CSS nativo con design tokens.
- `astro-icon` con Lucide y Simple Icons.
- SEO con Open Graph, Twitter Cards, JSON-LD, sitemap, robots y manifest.
- Deploy a GitHub Pages mediante GitHub Actions.

## Estructura

```text
src/
├── assets/          Imágenes optimizables por Astro
├── components/
│   ├── ui/          Button, Card, Section, Badge, Icon
│   ├── seo/         SEO y JSON-LD
│   ├── nav/         FloatingNav
│   └── sections/    Hero, About, Experience, Projects, Skills, Education, Contact
├── content/
│   ├── experience/  Experiencia profesional validada con Zod
│   └── projects/    Proyectos/casos destacados
├── layouts/         BaseLayout y PageLayout
├── lib/             site.ts, skills.ts, education.ts
├── pages/           index.astro y 404.astro
└── styles/          tokens, reset, utilities y global
```

## Principios

- `src/lib/site.ts` concentra datos personales, navegación, redes y SEO.
- Los proyectos y experiencias viven en Content Collections tipadas.
- La navegación mobile usa un dock compacto con estado activo y auto-hide al bajar.
- El sitio evita JS innecesario; el contenido principal funciona como HTML estático.
- El portfolio prioriza lectura rápida para recruiters: experiencia, proyectos, habilidades y contacto.

## Comandos

Requiere Node `>=22.12.0`.

| Comando                | Acción                                     |
| ---------------------- | ------------------------------------------ |
| `npm install`          | Instala dependencias                       |
| `npm run dev`          | Levanta Astro en local                     |
| `npm run check`        | Valida Astro, TypeScript y content schemas |
| `npm run format`       | Aplica Prettier                            |
| `npm run format:check` | Verifica formato                           |
| `npm run build`        | Genera build estático en `dist/`           |
| `npm run preview`      | Sirve el build local                       |

## Contenido

Para cambiar datos personales, redes, navegación o SEO:

```text
src/lib/site.ts
```

Para añadir o editar experiencia:

```text
src/content/experience/*.md
```

Para añadir o editar proyectos:

```text
src/content/projects/*.md
```

Cada proyecto debe declarar `title`, `client`, `description`, `challenge`, `role`, `impact`,
`technologies`, `icon`, `accent` y `order`.

## QA Antes De Publicar

- Ejecutar `npm run format:check`.
- Ejecutar `npm run check`.
- Ejecutar `npm run build`.
- Revisar desktop y mobile.
- Verificar tema claro/oscuro.
- Verificar navegación por anclas: Inicio, Experiencia, Proyectos, Habilidades y Contacto.
- Verificar descarga de CV.
- Verificar links de contacto, LinkedIn y GitHub.
- Verificar que `public/og.png` siga siendo 1200x630.
- Comparar copy del portfolio contra `public/cv.pdf` antes de publicar cambios de experiencia.

## SEO

Incluye:

- Title, description, canonical y robots.
- Open Graph y Twitter Card.
- Imagen social `public/og.png` en formato 1200x630.
- JSON-LD con `Person`, `WebSite` y `ProfilePage`.
- Sitemap y robots.txt.

Validadores útiles:

- https://search.google.com/test/rich-results
- https://www.opengraph.xyz/

## Licencia

Código bajo MIT. Contenido, CV y assets personales © José Cruzado.

# Portfolio · José Cruzado

Sitio personal de **José Félix Cruzado Vega**, Senior Backend Java Developer.
Construido con Astro 7, TypeScript estricto, Content Collections y CSS nativo.

Producción: https://josecruzado.github.io

## Stack

- Astro 7 en modo SSG.
- TypeScript strict (TS 6 — ver nota abajo).
- CSS nativo con design tokens y `light-dark()`.
- Fonts API nativa de Astro (`fonts` en la config + `<Font />`).
- CSP nativo con hashes SHA-256, sin `unsafe-inline`.
- `astro-icon` con Lucide y Simple Icons, ambos sets enumerados.
- SEO con Open Graph, Twitter Cards, JSON-LD, sitemap, robots, manifest,
  `llms.txt` y `cv.json`.
- Deploy a GitHub Pages mediante GitHub Actions.

> **TypeScript sigue en 6 a propósito.** TS 7 (compilador nativo en Go)
> ships sin API programática estable —llega en 7.1— y el tooling de Astro,
> con él `@astrojs/check`, todavía no puede usarlo. Subir rompería
> `npm run check` y con él el gate de CI.

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
├── icons/           SVG propios para astro-icon (hoy vacío, ver su README)
├── layouts/         BaseLayout y PageLayout
├── lib/             site.ts, skills.ts, education.ts, build-info.ts
├── pages/           index.astro, 404.astro, llms.txt.ts y cv.json.ts
├── scripts/         smooth-scroll.ts y magnetic.ts
└── styles/          tokens, reset, utilities y global
```

## Principios

- `src/lib/site.ts` concentra datos personales, navegación, redes y SEO.
  Ninguna sección repite un dato que viva ahí: las cifras de impacto se
  leen con `statValue(id)`, que convierte un id inexistente en error de
  compilación.
- Los proyectos y experiencias viven en Content Collections tipadas.
- `/llms.txt` y `/cv.json` se generan desde esas mismas fuentes, no a mano,
  para que no puedan desincronizarse del contenido del sitio.
- El acento tiene dos tokens: `--color-accent` para superficies
  decorativas y `--color-accent-text` para texto, iconos e indicadores de
  estado. El segundo se oscurece en tema claro para cumplir WCAG AA.
- Nada anima propiedades de layout: los desplazamientos de hover van con
  `translate` sobre los hijos, no con `padding` sobre el contenedor.
- La navegación mobile usa un dock compacto con estado activo y auto-hide al bajar.
- El sitio evita JS innecesario; el contenido principal funciona como HTML estático.
- El portfolio prioriza lectura rápida para recruiters: experiencia, proyectos, habilidades y contacto.

## Comandos

Node **24** (Active LTS) — la versión está en `.nvmrc`, que leen `nvm`,
`fnm` y el CI. `engines.node` declara `>=22.12.0` como mínimo soportado:
es lo que se garantiza que funciona, no la versión con la que se
construye. Ambas están verificadas.

| Comando                | Acción                                     |
| ---------------------- | ------------------------------------------ |
| `npm install`          | Instala dependencias                       |
| `npm run dev`          | Levanta Astro en local                     |
| `npm run check`        | Valida Astro, TypeScript y content schemas |
| `npm run format`       | Aplica Prettier                            |
| `npm run format:check` | Verifica formato                           |
| `npm run build`        | Genera build estático en `dist/`           |
| `npm run verify`       | Comprueba el HTML publicado en `dist/`     |
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
- El CSP solo se aplica en el build: comprobarlo con `npm run preview` y
  la consola del navegador abierta, nunca en `npm run dev`.
- Build y `astro check` deben quedar en cero advertencias, no solo en
  cero errores.

## SEO

Incluye:

- Title, description, canonical y robots.
- Open Graph y Twitter Card.
- Imagen social `public/og.png` en formato 1200x630.
- JSON-LD con `Person`, `WebSite` y `ProfilePage`.
- Sitemap con `lastmod` tomado del último commit, y robots.txt.
- `/llms.txt` para crawlers de IA, generado desde `site.ts`, `skills.ts`,
  `education.ts` y las content collections.
- `/cv.json` con el CV en [JSON Resume](https://jsonresume.org), un esquema
  publicado que herramientas de terceros y ATS saben leer. Se genera desde
  las mismas fuentes y se anuncia con `rel="alternate"` en el `<head>`.
  Validado contra el esquema oficial con `ajv`; `npm run verify` comprueba
  en cada build que siga sincronizado con las content collections.

Validadores útiles:

- https://search.google.com/test/rich-results
- https://www.opengraph.xyz/

## CI y despliegue

Tres workflows, con `build.yml` como fuente única para que un pull
request se valide exactamente con las mismas comprobaciones que después
despliegan:

| Workflow     | Disparador       | Qué hace                                  |
| ------------ | ---------------- | ----------------------------------------- |
| `build.yml`  | `workflow_call`  | Prettier, `astro check`, build y `verify` |
| `ci.yml`     | `pull_request`   | `build.yml` + `npm audit`                 |
| `deploy.yml` | push a `develop` | `build.yml` + publicación en GitHub Pages |

Detalles que conviene conocer antes de tocarlos:

- **`npm run verify`** revisa el HTML que realmente se publica, que es
  lo que ni `astro check` ni Prettier miran: CSP sin `unsafe-inline`,
  JSON-LD válido, canonical y hreflang alineados, CSS inline, landmarks
  de accesibilidad, `lastmod` y `llms.txt`. Si falla, el output cambió
  aunque el build pasara.
- **La caché de fuentes** (`node_modules/.astro/fonts`) se restaura
  _después_ de `npm ci`, porque `npm ci` borra `node_modules`. Sin ella
  cada despliegue rebaja las fuentes del CDN de fontsource.
- **`npm audit` corre solo en pull requests.** Una advertencia nueva debe
  frenar una actualización de dependencias, no un cambio de contenido
  urgente que no la introdujo.
- **`allowScripts`** en `package.json` aprueba explícitamente los scripts
  de instalación de `esbuild` (enlaza su binario de plataforma) y
  `fsevents` (file watching en macOS, ausente en Linux). npm 11 los
  bloquea por defecto; aprobarlos de forma consciente evita convivir con
  un aviso permanente en cada instalación.

## Historial de decisiones

`docs/mejoras-2026-09.md` recoge la auditoría del 6-sep-2026 y las 5
fases de implementación, con las mediciones de cada cambio y la
justificación de lo que se descartó. Conviene leerlo antes de revertir
algo que parezca arbitrario.

## Licencia

Código bajo MIT. Contenido, CV y assets personales © José Cruzado.

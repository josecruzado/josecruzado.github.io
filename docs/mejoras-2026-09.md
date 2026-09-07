# Plan de mejoras — Auditoría 6 de septiembre de 2026

> Estado del proyecto auditado: Astro 6.4.2 · TypeScript 6 strict · SSG · 2 páginas
> Build de referencia: 9,4 s · `astro check`: 0 errores, 0 warnings (28 archivos)

Documento de trabajo. Cada punto se implementa de forma aislada, se valida con
`npm run check` + `npm run build`, y se cierra con un commit propio para que
cualquier regresión sea reversible por separado.

---

## Métricas de partida

Medidas sobre `dist/` con el build del 6-sep-2026.

| Recurso                        | Raw     | Brotli  |
| ------------------------------ | ------- | ------- |
| `index.html`                   | 114 KB  | 25,6 KB |
| `index.*.css` (estilos scoped) | 37,6 KB | 5,2 KB  |
| `Icon.*.css` (chunk global)    | 11,1 KB | 3,0 KB  |
| Fuentes woff2 (2)              | 96 KB   | —       |

Composición de `index.html`: 46,8 KB de SVG inline (62 iconos, 56 únicos),
10,1 KB de JSON-LD, ~6 KB de JS inline. Cero archivos `.js` externos.

Estas cifras se vuelven a medir al cerrar la fase 3 para cuantificar el efecto.

---

## Principios de ejecución

1. **Leer antes de escribir.** Antes de tocar un archivo se releen sus
   dependencias y sus consumidores. Varios componentes documentan en
   comentarios _por qué_ una decisión existe; ese contexto manda sobre la
   intuición.
2. **Un commit por punto.** Mensajes en formato Conventional Commits,
   coherentes con el historial existente del repositorio.
3. **Verificación por fase.** `npm run check` y `npm run build` deben quedar
   en verde antes de cada commit. `npm run format` para no romper el gate de
   Prettier del workflow de CI.
4. **Sin cambios de alcance.** No se rediseña ni se añade contenido nuevo: se
   corrige, se moderniza y se elimina deuda.
5. **Rama aislada.** Todo ocurre en `refactor/auditoria-2026-09`. `develop`
   despliega a producción en cada push, así que no se toca hasta validar.

---

## Fase 1 — Accesibilidad y correcciones

Bugs reales, visibles en producción hoy. Máxima prioridad.

### [x] A1 · Contraste del accent como color de texto (WCAG AA)

**Problema.** `--color-accent: #06b6d4` (`src/styles/tokens.css:14`) es estable
entre temas por diseño, pero se usa como color de **texto** en 22 lugares
(`.eyebrow`, `.project__kicker`, `.project__case dt`, `.exp__panel-company`,
`.tech-glow`, los `<em>` de los headings, `.contact__question em`).

| Par                               | Ratio      | WCAG AA |
| --------------------------------- | ---------- | ------- |
| `#06b6d4` sobre `#050507` (dark)  | **8,39:1** | ✅      |
| `#06b6d4` sobre `#fafafa` (light) | **2,33:1** | ❌      |
| `#06b6d4` sobre `#ffffff` (cards) | **2,43:1** | ❌      |

En tema claro todo el texto de marca queda a 2,3:1. AA exige 4,5:1.

**Solución.** Separar acento decorativo de acento tipográfico. No se toca ni un
borde, ni un glow, ni el fondo del botón primario.

```css
--color-accent: #06b6d4; /* decorativo */
--color-accent-text: light-dark(#0e7490, #06b6d4); /* texto */
```

`#0e7490` da 5,13:1 sobre `#fafafa` y 5,36:1 sobre `#ffffff`. En dark no cambia
nada. Se sustituye `color: var(--color-accent)` por `--color-accent-text` solo
donde el token pinta texto, nunca donde pinta bordes o sombras.

### [x] A2 · `--color-fg-subtle` falla en tema oscuro

`#71717a` sobre `#050507` = **4,21:1**, por debajo del 4,5:1 de AA. Se usa en
16 sitios, entre ellos `.project__description`
(`src/components/sections/Projects.astro`), que es copy real.

Subir a `#82828c` → 5,35:1 sin alterar la jerarquía visual percibida.

Se documenta además en `tokens.css` que `--color-fg-faint` (2,63:1 dark /
2,42:1 light) queda restringido a separadores y nunca a texto legible.

### [x] A3 · `<meta http-equiv="Permissions-Policy">` es inerte

`src/components/seo/SEO.astro:63-66`. La especificación de Permissions Policy
obliga al cliente a **ignorar** cualquier política declarada vía `<meta>`: debe
estar activa antes de procesar la respuesta y no puede mutar en runtime.

Además `interest-cohort=()` apunta a FLoC, cancelado por Google en 2022 y
reemplazado por Topics API. El comentario del código afirma que bloquea un
mecanismo que ya no existe.

**Solución.** Eliminar el bloque. GitHub Pages no permite headers custom, así
que no hay sustituto viable; se deja anotado para una futura migración a un
host con headers configurables.

### [x] A5 · `canonical` y `hreflang` divergen

Verificado en el `dist/index.html` generado:

```html
<link rel="canonical" href="https://josecruzado.github.io/" />
<!-- con barra -->
<link rel="alternate" hreflang="es" href="https://josecruzado.github.io" />
<!-- sin -->
```

`SEO.astro:73-74` usa `SITE.url` crudo; el canonical se deriva de
`Astro.url.pathname`. Con `trailingSlash: 'ignore'` ambas resuelven, así que
Google ve dos strings para el mismo recurso.

**Solución.** Normalizar con `new URL('/', SITE.url).href`.

### [x] A6 · Teléfono personal expuesto en JSON-LD

`src/components/seo/JsonLd.astro:95` emite `telephone` en HTML público. Los
scrapers de datos estructurados son el vector principal de spam telefónico. El
`email` ya está expuesto vía `mailto:` (deseado); el teléfono no aporta ninguna
señal al Knowledge Graph que `email` + `sameAs` no cubran.

**Solución.** Retirarlo del `@graph`; permanece en el CV en PDF.

### [x] E3 · El bootstrap de tema no valida `localStorage`

`src/layouts/BaseLayout.astro:69-74` asigna `saved || prefers` directamente a
`html.dataset.theme`. Un valor corrupto deja el atributo sin coincidir con
ningún selector de `tokens.css:122-126` → sin `color-scheme` → `light-dark()`
resuelve a light sobre un documento que declara otro tema.

**Solución.** Aceptar únicamente `'light'` y `'dark'`.

### [x] C6 · Los comentarios de desarrollo viajaban al cliente

**Detectado durante la fase 1.** Astro emite los comentarios `<!-- -->`
del template al HTML final; solo descarta los de sintaxis JSX. Las 18
anotaciones de `SEO.astro`, `BaseLayout.astro` y `PageLayout.astro`
—varias de ellas párrafos completos justificando decisiones técnicas—
sumaban **3.502 B servidos en cada carga**, y por vivir en `<head>` se
parseaban antes del enlace al CSS.

**Solución.** Convertir a `{/* ... */}`. El comentario permanece en el
código fuente, que es donde cumple su función.

Resultado medido: `dist/index.html` 114,0 KB → 110,3 KB. Árbol emitido
idéntico (37 metas, 15 links, 7 scripts antes y después).

---

## Fase 2 — Limpieza y consistencia

Deuda verificada por búsqueda exhaustiva en `src/`.

### [x] A4 · `tsconfig.json` configura JSX de React sin React

`"jsx": "react-jsx"` y `"jsxImportSource": "react"` sin React en
`package.json` ni un solo `.tsx` en el repositorio. Hoy es inofensivo; el día
que alguien añada un `.tsx` obtiene un error de resolución confuso. Astro trae
su propio JSX.

### [x] D · Código muerto

**`src/lib/site.ts`** — claves sin ningún consumidor:
`author.headline`, `author.tagline`, `author.bioShort`, `author.degree`,
`heroSkills`, `alternateLocale`.

**`src/styles/utilities.css`** — `.stack`, `.rule` y `.sr-only`: cero usos.
(`.cluster` sí se usa en `Projects.astro`; se conserva.)

**`src/components/ui/Section.astro`** — prop `narrow` y clase
`.container--narrow`: ninguna sección las usa.

**`src/components/ui/Card.astro`** — prop `interactive`, documentada como
_RESERVED_ y sin ningún estilo asociado. El propio JSDoc reconoce que es código
muerto.

**`src/components/seo/SEO.astro`** — `<meta name="title">` no es estándar y
Google lo ignora; `<title>` ya cubre el caso.

### [x] E1 · Métricas de «Sobre mí» duplicadas

`About.astro:30,36` escribe `6+` y `4` a mano mientras `Hero.astro:34` los lee
de `SITE.stats`. Mismos números, dos fuentes de verdad. Contradice el principio
declarado en el README («`site.ts` concentra datos personales»).

**Solución.** Derivar los valores de `SITE.stats`, conservando las notas
descriptivas propias de la sección.

### [x] E2 · Sincronización de `theme-color` triplicada

`BaseLayout.astro:75-76` y `FloatingNav.astro:62-66` implementan la misma
lógica con los literales `#ffffff`/`#000000`, que además duplican
`SITE.seo.themeColorLight/Dark`. Tres copias de dos colores.

**Solución.** Inyectar los valores desde `site.ts` al script inline mediante
`define:vars`, y exponerlos al módulo de `FloatingNav` vía atributo de datos.

### [x] E4 · No existe `<footer>`

La página termina en el `</section>` de Contacto. Un `<footer>` con copyright
es un landmark esperado por lectores de pantalla y señal estándar de documento
completo para crawlers.

### [x] E5 · `404.astro` no replica el contrato del skip-link

`PageLayout.astro:26` documenta por qué `<main tabindex="-1">` es necesario
(WCAG 2.4.1). `404.astro:9` usa `<main id="main">` sin `tabindex`: el
skip-link hace scroll pero no mueve el foco — exactamente el bug que el
comentario describe.

### [x] B6 · Cast obsoleto de `startViewTransition`

`FloatingNav.astro:88-90` castea `document` para acceder a
`startViewTransition`. Verificado en `typescript/lib/lib.dom.d.ts:13182`: el
método está tipado nativamente en TypeScript 6. El cast se colapsa a una
llamada directa.

### [~] E6 · `popstate` — **descartado, no reproduce**

Se implementó un handler de `popstate` y se comparó contra el estado previo en
Chromium con Playwright. **El comportamiento es idéntico con y sin él**: el
navegador ya asocia una posición de scroll a cada entrada del historial y la
restaura al recorrerla, incluidas las creadas con `pushState`.

    atrás            3285px  #proyectos   (== posición del click)
    atrás x2          600px  (sin hash)   (== scroll manual previo)
    adelante         3285px  #proyectos

Añadir el handler solo habría competido con la restauración nativa —que además
es instantánea a propósito, como los usuarios esperan del botón atrás—. Se
revirtió.

### [x] E7 · `Section.astro` conoce los ids de las secciones

`Section.astro:79-93` codifica `contain-intrinsic-size` por
`data-nav-section='sobre-mi'|'experiencia'|…` dentro de un componente
genérico. Renombrar una sección rompe en silencio la calibración del anchor
scroll.

**Solución.** Exponerlo como prop y devolver la decisión al call site.

---

## Fase 3 — Rendimiento

### [x] C1 · Transiciones sobre propiedades de layout

Tres lugares animan propiedades que disparan layout en cada frame:

| Ubicación                        | Propiedad animada                        |
| -------------------------------- | ---------------------------------------- |
| `Experience.astro:204,216-217`   | `transition: all` + `padding-left`       |
| `Projects.astro:197`             | `transition: all`                        |
| `Contact.astro` `.contact__link` | `transition: padding` + `padding-inline` |

Contradice el comentario de `Button.astro:58-59`, que explica correctamente por
qué evitar `all`. `padding` no es compositable.

**Solución.** `translate` en lugar de `padding`, y transiciones explícitas por
propiedad. El patrón ya existe en `utilities.css:152-158`.

### [~] C2 · `magnetic.ts` — **descartado, no reproduce**

Medido con CDP `Performance.getMetrics`, 120 `pointermove` recorriendo
`.btn--primary`:

    LayoutCount 0 · LayoutDuration 0,0ms · RecalcStyle 12,8ms

Cero reflows. `--mx`/`--my` solo alimentan la propiedad `translate`, que es de
compositor, así que escribirlas no ensucia el layout y el
`getBoundingClientRect()` siguiente no fuerza ninguna sincronización.

Cachear el rect además **introduciría** un defecto: al hacer scroll con el
cursor sobre el botón, el rect cacheado quedaría obsoleto y el desplazamiento
magnético se calcularía mal. Leerlo en cada movimiento es la decisión correcta.

### [x] C3 · `lucide: ['*']` carga el set completo en build

`astro.config.mjs:16`. `simple-icons` está enumerado (21 iconos) pero lucide usa
comodín: se parsean ~1.600 iconos para emitir 25. Enumerarlos convierte un
icono mal escrito en error de build en lugar de un hueco silencioso.

Iconos de lucide en uso (verificados por búsqueda):
`arrow-down`, `arrow-left`, `arrow-right`, `arrow-up-right`, `briefcase`,
`chart-no-axes-combined`, `cloud`, `code-2`, `copy`, `database`, `download`,
`graduation-cap`, `house`, `languages`, `mail`, `moon`, `network`, `package`,
`send`, `server`, `shield-check`, `sun`, `terminal`, `truck`, `wrench`.

### [x] C4 · Evaluar `inlineStylesheets: 'always'`

`build.inlineStylesheets: 'auto'` deja ambos CSS fuera del umbral → dos
round-trips bloqueantes antes del primer paint. En un sitio de **una sola
página** sobre GitHub Pages el caché entre navegaciones no aporta nada.

Se mide antes y después. Se adopta solo si el resultado lo justifica.

> **Descartado tras medir:** deduplicar los SVG inline vía `<symbol>`/`<use>`
> recuperaría ~1 KB de 46,8 KB (56 de 62 iconos son únicos). No compensa la
> pérdida de legibilidad del markup.

### [x] C7 · El anchor scroll no llegaba al destino

**Detectado durante E7.** Con `content-visibility: auto`, las secciones fuera
de pantalla ocupan la altura _estimada_. `scrollIntoView` calcula el offset una
sola vez al arrancar y, mientras la animación avanza, las secciones que
atraviesa se renderizan a su altura real y el destino se desplaza.

Medido en Chromium: clicar «Habilidades» dejaba la sección **239px** por debajo
del borde en desktop y **440px** en mobile. Anterior a esta rama.

Afinar las estimaciones **no** lo resuelve: se midieron las alturas reales (bio
1033px, tabs 1172px, cards 1896px, list 1054px, timeline 1325px) y al aplicarlas
el error solo cambió de signo (#proyectos −253px, #habilidades −514px). El
problema no es la magnitud sino que la geometría cambia a mitad de animación.

**Solución.** Corregir sobre `scrollend`, con la página ya quieta y las alturas
reales, mediante un `scrollBy` instantáneo si la desviación supera 2px. Se
cancela si el usuario toma el control (rueda, gesto táctil, teclas de scroll).

Resultado: 0px / 0px / 0px en desktop y 0px / 0px / −2px en mobile.

---

## Fase 4 — Plataforma

### [ ] B1 · CSP nativo de Astro ⭐

`SEO.astro:58-61` declara a mano `script-src 'self' 'unsafe-inline'` y
`style-src 'self' 'unsafe-inline'`. El comentario justifica que «Astro estático
no emite nonces» — eso ya no es cierto.

`security.csp` es configuración **estable** (no experimental) desde Astro
5.9→6: calcula el hash SHA-256 de cada script y estilo inline en build y lo
inyecta en el `<meta http-equiv="content-security-policy">` que genera él
mismo. Los tres inline del proyecto (bootstrap de tema, JSON-LD, speculation
rules) quedan cubiertos y `'unsafe-inline'` desaparece de ambas directivas.

**Caveat.** Si `'unsafe-inline'` sigue presente los hashes se ignoran: es un
reemplazo, no una adición. El CSP no se aplica en `astro dev`; se verifica con
`npm run preview`.

### [ ] B5 · Actualizaciones menores

```
@astrojs/check      0.9.9   → 0.9.10
@astrojs/sitemap    3.7.3   → 3.7.4
astro               6.4.2   → 6.4.8
astro-icon          1.1.5   → 1.2.0
prettier            3.8.3   → 3.9.6
@fontsource-variable/inter          5.2.8   → 5.3.0
@fontsource-variable/cascadia-code  5.2.2   → 5.3.0
@iconify-json/lucide        1.2.111 → 1.2.129
@iconify-json/simple-icons  1.2.84  → 1.2.94
```

### [ ] B2 · Migrar a la Fonts API nativa de Astro

Hoy conviven: import `?url` con 4 líneas de comentario explicando el mecanismo
(`BaseLayout.astro:10-15`), dos `<link rel="preload">` manuales, y dos
`@font-face` con `unicode-range`, `size-adjust`, `ascent-override` y
`descent-override` calibrados a mano (`global.css:6-48`).

La Fonts API estable (`fonts` en config + `<Font />` de `astro:assets`) hace
exactamente eso automáticamente: preload links, subsetting por `subsets`, y
generación de fallbacks con metric overrides calculados. El provider
`fontsource` mantiene los mismos paquetes.

Ganancia: ~50 líneas menos y el hash del preload nunca puede desincronizarse
del `@font-face`.

**Riesgo.** Los overrides actuales están calibrados a mano con una justificación
escrita (`size-adjust: 100%` evita un «shrink» visible post-swap). Se compara el
render antes/después y, si Astro genera métricas peores, se conservan las
manuales vía `fallbacks` explícitos.

### [ ] F · Señales de SEO modernas

- **`llms.txt`** — convención emergente para crawlers de IA. `robots.txt` ya
  abre la puerta a GPTBot/ClaudeBot/Google-Extended; un `/llms.txt` con perfil,
  stack y contacto en markdown plano es el paso natural y encaja con la
  inversión ya hecha en JSON-LD.
- **`lastmod` en el sitemap** — `@astrojs/sitemap` lo soporta; el
  `sitemap-0.xml` actual solo emite `<loc>`.

---

## Fase 5 — Astro 7

### [ ] B3 · Evaluación y upgrade

Astro 7.3.1 disponible. Cambios relevantes para este proyecto:

- **Compilador Rust** por defecto: más rápido pero más estricto con HTML
  inválido. Tags sin cerrar pasan a ser error y ya no reestructura
  anidamientos inválidos.
- **Vite 8.**
- **Markdown pasa a Sätteri.** No aplica: los `.md` de `content/` solo aportan
  frontmatter, nunca se renderiza el cuerpo.
- `@astrojs/db` y APIs deprecadas de `astro:transitions` eliminadas: no se usan.
- **`compressHTML` pasa a `'jsx'`**, que puede alterar el espaciado entre
  elementos inline. **Riesgo concreto aquí:** `Hero.astro:25-29` tiene texto
  con `<span class="badge-text">` partidos en varias líneas por Prettier.

**Procedimiento.** Se ejecuta al final, con todo lo demás ya estabilizado, y se
compara el `dist/index.html` generado antes y después.

---

## Fuera de alcance (decidido, no olvidado)

| Punto                 | Motivo                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript 7**      | TS 7.0.2 (GA 8-jul-2026) ships **sin API programática estable**; llega en 7.1. `@astrojs/check` no puede usarlo todavía y subir rompería el gate de CI. Se revisa con 7.1. |
| **`@scope`**          | Baseline _newly available_ 2026, pero Astro ya aporta scoping por componente. No añade nada aquí.                                                                          |
| **`text-box-trim`**   | Resolvería el espaciado óptico de los headings grandes, pero Firefox aún no lo soporta. Reevaluar cuando alcance Baseline.                                                 |
| **Sprite `<symbol>`** | Medido: ahorra ~1 KB de 46,8 KB. No compensa.                                                                                                                              |
| **OG dinámico**       | Una sola página; la imagen estática cumple.                                                                                                                                |

---

## Registro de ejecución

| #   | Punto                          | Commit    | Estado                 |
| --- | ------------------------------ | --------- | ---------------------- |
| 0   | Plan de mejoras                | `ebb1563` | hecho                  |
| 1   | A1 · contraste accent          | `9e191f4` | hecho                  |
| 2   | A2 · fg-subtle dark            | `cfe8ad3` | hecho                  |
| 3   | A3 · Permissions-Policy        | `5d3f2fd` | hecho                  |
| 3b  | C6 · comentarios HTML servidos | `3a13640` | hecho                  |
| 4   | A5 · hreflang                  | `f34a0b4` | hecho                  |
| 5   | A6 · teléfono en JSON-LD       | `2ecdb9d` | hecho                  |
| 6   | E3 · validación de tema        | `67a6a86` | hecho                  |
| 7   | A4 · tsconfig JSX              | `4b36e9b` | hecho                  |
| 8   | D · código muerto              | `b45eb8a` | hecho                  |
| 9   | E1 · métricas About            | `e6771c7` | hecho                  |
| 10  | E2 · theme-color               | `ad33726` | hecho                  |
| 11  | E4 · footer + E5 foco en 404   | `17ad5db` | hecho                  |
| 13  | B6 · startViewTransition       | `b0c95cc` | hecho                  |
| 14  | E6 · popstate                  | —         | descartado, no reprod. |
| 15  | E7 · Section intrinsic size    | `53dca2b` | hecho                  |
| 15b | C7 · destino del anchor scroll | `a00919c` | hecho                  |
| 16  | C1 · transiciones de layout    | `b5e73b1` | hecho                  |
| 17  | C2 · magnetic rect             | —         | descartado, no reprod. |
| 18  | C3 · iconos lucide             | `7ff9a11` | hecho                  |
| 19  | C4 · inlineStylesheets         | `197176c` | hecho                  |
| 20  | B5 · dependencias              |           | pendiente              |
| 21  | B1 · CSP nativo                |           | pendiente              |
| 22  | B2 · Fonts API                 |           | pendiente              |
| 23  | F · llms.txt + lastmod         |           | pendiente              |
| 24  | B3 · Astro 7                   |           | pendiente              |

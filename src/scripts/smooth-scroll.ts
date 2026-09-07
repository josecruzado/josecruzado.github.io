/**
 * Smooth scroll global para anchor clicks (<a href="#xxx">).
 *
 * Delega TODO al browser:
 *   - `scrollIntoView({ behavior: 'smooth', block: 'start' })` respeta
 *     scroll-padding-top (declarado en reset.css → 4.75rem desktop,
 *     4rem mobile), prefers-reduced-motion (cae a 'auto') y maneja
 *     la curva de easing nativa.
 *   - Para `#inicio` usa window.scrollTo(0,0) con el mismo behavior.
 *
 * El offset lo calcula el browser; este módulo solo añade una corrección
 * final (ver `settleOnTarget`) porque `content-visibility: auto` mueve el
 * destino mientras la animación está en curso.
 *
 * Mantiene event delegation en document para capturar anchors de
 * cualquier sección sin querySelectorAll cacheado.
 */

// Flag para suspender el auto-hide del nav durante scroll programático.
// Lo lee FloatingNav.astro vía `html.is-smooth-scrolling`.
// scrollend (Baseline 2024) limpia el flag; timeout fallback para
// browsers sin soporte.
const SMOOTH_SCROLL_FLAG_DURATION = 1200;
let flagTimer: number | undefined;

function clearFlag() {
  document.documentElement.classList.remove('is-smooth-scrolling');
  if (flagTimer) {
    window.clearTimeout(flagTimer);
    flagTimer = undefined;
  }
}

/**
 * Corrección de destino tras un scroll programático.
 *
 * Las secciones usan `content-visibility: auto`, así que las que quedan
 * fuera de pantalla no están renderizadas y ocupan la altura ESTIMADA de
 * `contain-intrinsic-size`. scrollIntoView calcula el offset destino una
 * sola vez, al arrancar; mientras la animación avanza, las secciones que
 * atraviesa se renderizan a su altura real y el destino se desplaza bajo
 * los pies del scroll. Medido en Chromium, #habilidades quedaba 239px
 * corto en desktop y 440px en mobile.
 *
 * Afinar las estimaciones no lo resuelve: con valores exactos el error
 * cambia de signo (pasa a sobrepasar el destino) porque el problema no
 * es la magnitud de la estimación sino que la geometría cambia a mitad
 * de la animación. La corrección se aplica por tanto al final, cuando la
 * página ya está quieta y todas las alturas son reales.
 */
let pendingTarget: HTMLElement | null = null;

// Si el usuario toma el control durante la animación, la corrección se
// cancela: arrastrarlo al destino que ya decidió abandonar sería peor
// que dejar el scroll unos píxeles descuadrado. `wheel` y `touchstart`
// cubren rueda y gesto táctil; las teclas de scroll cubren el teclado.
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

function cancelSettle() {
  pendingTarget = null;
}

window.addEventListener('wheel', cancelSettle, { passive: true });
window.addEventListener('touchstart', cancelSettle, { passive: true });
window.addEventListener(
  'keydown',
  (event) => {
    if (SCROLL_KEYS.has(event.key)) cancelSettle();
  },
  { passive: true }
);

function settleOnTarget() {
  const target = pendingTarget;
  // Se limpia ANTES de corregir: el scrollBy dispara otro scrollend y
  // sin esto la corrección se reevaluaría en bucle.
  pendingTarget = null;
  if (!target) return;

  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const delta = target.getBoundingClientRect().top - padding;
  // 2px de tolerancia: por debajo de eso es redondeo subpíxel.
  if (Math.abs(delta) < 2) return;

  window.scrollBy({ top: delta, behavior: 'auto' });
}

window.addEventListener(
  'scrollend',
  () => {
    if (document.documentElement.classList.contains('is-smooth-scrolling')) {
      clearFlag();
      settleOnTarget();
    }
  },
  { passive: true }
);

document.addEventListener('click', (event) => {
  // Respeta abrir-en-nueva-pestaña del usuario.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.button !== 0) return;

  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href === '#') return;

  // Anchors con target=_blank o download no son scroll.
  if (link.target === '_blank' || link.hasAttribute('download')) return;

  // #inicio = top; otros = scrollIntoView.
  const targetEl = href === '#inicio' ? null : document.querySelector<HTMLElement>(href);
  if (href !== '#inicio' && !targetEl) return;

  event.preventDefault();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = prefersReducedMotion ? 'auto' : 'smooth';

  // Marca scroll programático para suspender auto-hide del nav.
  // El timeout cubre además a los browsers sin `scrollend` (Safari
  // estable por debajo de 26): allí la corrección de destino llega por
  // esta vía en lugar de por el evento.
  pendingTarget = targetEl;
  if (!prefersReducedMotion) {
    document.documentElement.classList.add('is-smooth-scrolling');
    if (flagTimer) window.clearTimeout(flagTimer);
    flagTimer = window.setTimeout(() => {
      clearFlag();
      settleOnTarget();
    }, SMOOTH_SCROLL_FLAG_DURATION);
  } else {
    // Sin animación el destino ya no se mueve, pero las secciones que
    // se renderizan al saltar sí lo desplazan: se corrige igualmente.
    settleOnTarget();
  }

  if (targetEl) {
    targetEl.scrollIntoView({ behavior, block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior });
  }

  history.pushState(null, '', href);

  // Si el FloatingNav está auto-hidden por scroll-down previo, fuérzalo visible.
  document.querySelector<HTMLElement>('.nav')?.classList.remove('is-hidden');
});

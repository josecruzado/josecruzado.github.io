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
 * Sin cálculo manual de offset, sin scrollend listener, sin timeout
 * fallback — el browser ya hace todo eso mejor desde Chrome 89/Safari
 * 15.4/Firefox 36 (todos Baseline 2023).
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

window.addEventListener(
  'scrollend',
  () => {
    if (document.documentElement.classList.contains('is-smooth-scrolling')) {
      clearFlag();
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
  if (!prefersReducedMotion) {
    document.documentElement.classList.add('is-smooth-scrolling');
    if (flagTimer) window.clearTimeout(flagTimer);
    flagTimer = window.setTimeout(clearFlag, SMOOTH_SCROLL_FLAG_DURATION);
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

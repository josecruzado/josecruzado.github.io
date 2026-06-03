/**
 * Smooth scroll global para anchor clicks (<a href="#xxx">).
 *
 * Reemplaza el CSS `scroll-behavior: smooth` global del <html>
 * — esa declaración afectaba al scroll natural del wheel/touchpad,
 * creando sensación de drag/lag. Aquí controlamos SOLO los anchor
 * clicks programáticos vía event delegation; el scroll natural
 * recupera la velocidad nativa del SO.
 *
 * Por qué event delegation:
 *   - Un único listener en document captura todos los <a href="#x">,
 *     incluidos los del Hero (Ver proyectos, Contactar), del nav,
 *     y de cualquier futuro componente.
 *   - Cero querySelectorAll cacheado que pueda quedar stale tras
 *     view transitions o re-render.
 */

const NAV_FALLBACK_HEIGHT = 48;
const BREATHING_DESKTOP = 24;
const BREATHING_MOBILE = 16;
// Duración del smooth scroll programático típico. Tras este tiempo
// asumimos que el navegador terminó la animación y restituimos el
// comportamiento normal del scroll handler (auto-hide del nav).
const SMOOTH_SCROLL_FLAG_DURATION = 1200;

function getScrollOffset(): number {
  const nav = document.querySelector<HTMLElement>('.nav');
  const navHeight = nav?.getBoundingClientRect().height ?? NAV_FALLBACK_HEIGHT;
  const breathing = window.matchMedia('(max-width: 768px)').matches
    ? BREATHING_MOBILE
    : BREATHING_DESKTOP;
  return navHeight + breathing;
}

let smoothScrollTimer: number | undefined;

function clearSmoothScrolling() {
  document.documentElement.classList.remove('is-smooth-scrolling');
  if (smoothScrollTimer) {
    window.clearTimeout(smoothScrollTimer);
    smoothScrollTimer = undefined;
  }
}

function markSmoothScrolling() {
  document.documentElement.classList.add('is-smooth-scrolling');
  if (smoothScrollTimer) window.clearTimeout(smoothScrollTimer);
  // Fallback: si scrollend no dispara (browser viejo o scroll <1px),
  // el timeout garantiza que el flag se limpie y no quede stale.
  smoothScrollTimer = window.setTimeout(clearSmoothScrolling, SMOOTH_SCROLL_FLAG_DURATION);
}

// scrollend es el evento "oficial" que dispara cuando el smooth scroll
// programático realmente termina (no antes, no después). Es más preciso
// que cualquier timeout y aprovecha el conocimiento del browser sobre
// la animación que él mismo está ejecutando. Cae en el timeout como
// fallback en browsers que aún no lo soportan.
window.addEventListener(
  'scrollend',
  () => {
    if (document.documentElement.classList.contains('is-smooth-scrolling')) {
      clearSmoothScrolling();
    }
  },
  { passive: true }
);

document.addEventListener('click', (event) => {
  // Ignora modifier keys — respeta abrir-en-nueva-pestaña del usuario.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  // Solo clicks de botón primario (0).
  if (event.button !== 0) return;

  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href === '#') return;

  // Anchors con target=_blank o download no son scroll: ignorar.
  if (link.target === '_blank' || link.hasAttribute('download')) return;

  const targetEl = href === '#inicio' ? null : document.querySelector<HTMLElement>(href);

  // Si el href apunta a algo que no existe, deja el comportamiento default.
  if (href !== '#inicio' && !targetEl) return;

  event.preventDefault();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetTop = targetEl
    ? Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - getScrollOffset())
    : 0;

  // Marca que un scroll programático está en curso para que el
  // scroll handler del nav suspenda el auto-hide durante la animación
  // (de lo contrario el nav desaparece mientras el smooth scroll baja).
  if (!prefersReducedMotion) markSmoothScrolling();

  window.scrollTo({
    top: targetTop,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });

  // Actualiza la URL sin recargar (replicaría history del browser).
  history.pushState(null, '', href);

  // Si el FloatingNav está auto-hidden por scroll-down previo, fuérzalo visible.
  document.querySelector<HTMLElement>('.nav')?.classList.remove('is-hidden');
});

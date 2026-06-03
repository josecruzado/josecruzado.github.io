/**
 * Animaciones — magnetic hover en CTAs primarios.
 *
 * Reemplazó la librería Motion (~30 KB gzipped) por CSS-first:
 *   - Hero entrance: @keyframes hero-stagger + animation-fill-mode:
 *     backwards en utilities.css (cero JS para entrance).
 *   - Card lift: .card:hover { translateY } en Card.astro (cero JS).
 *   - Magnetic: este archivo — minimal pointermove → CSS vars,
 *     transición vive en CSS (transición sobre `translate` property
 *     en utilities.css).
 *
 * Solo registra listeners cuando hay pointer:fine + no reduced-motion.
 * Cero work en mobile / touch / accesibilidad.
 */

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (finePointer && !reducedMotion) {
  setupMagnetic();
}

function setupMagnetic() {
  const buttons = document.querySelectorAll<HTMLElement>('.btn--primary, .nav__cv, .contact__link');
  // 0.18: sweet spot perceptible sin sentirse exagerado (era el valor
  // que Motion usaba con stiffness 220 + damping 24, ahora aplicado
  // directo sin spring — se siente algo más mecánico pero coherente).
  const STRENGTH = 0.18;

  buttons.forEach((btn) => {
    btn.addEventListener('pointermove', (event) => {
      // Stylus/pen/touch no aplican — el efecto es de cursor de mouse.
      if (event.pointerType !== 'mouse') return;
      const rect = btn.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * STRENGTH;
      const dy = (event.clientY - rect.top - rect.height / 2) * STRENGTH;
      btn.style.setProperty('--mx', `${dx}px`);
      btn.style.setProperty('--my', `${dy}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

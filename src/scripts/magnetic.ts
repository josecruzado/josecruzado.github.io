/**
 * Magnetic hover — CTAs primarios (Descargar CV + Enviar email +
 * dock CV + Contact links) siguen el cursor con una atracción sutil.
 *
 * Implementación: pointermove → setProperty --mx/--my. La transición
 * y aplicación de `translate` viven en utilities.css. JS solo lee la
 * posición del cursor y publica las CSS vars.
 *
 * Solo se ejecuta cuando hay pointer:fine + no reduced-motion. Cero
 * work en mobile / touch / accesibilidad.
 *
 * Sister modules (también CSS-first, sin librerías):
 *   - Hero entrance: @keyframes hero-stagger + backwards fill
 *   - Card lift: .card:hover { translateY } (CSS only)
 *   - Reveal-on-scroll: animation-timeline: view() (CSS only)
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

/**
 * Animaciones — progressive enhancement con Motion.
 *
 * Filosofía Apple-like: pocas animaciones, springs suaves (damping alto,
 * sin bounce), duraciones 300–700 ms, respeto absoluto a la preferencia
 * del usuario.
 *
 * Scope intencionalmente reducido:
 *   1. Hero entrance — spring stagger al cargar la página.
 *   2. Magnetic hover — CTAs primarios (CV + Enviar email + dock CV).
 *
 * Card lift se delega a CSS (.card--interactive:hover { translateY })
 * para evitar la doble animación que ocurría cuando Motion y CSS
 * competían por la misma propiedad transform al entrar/salir del hover.
 *
 * Fallback:
 *   - Sin JS → todo visible por defecto (HTML estático).
 *   - prefers-reduced-motion → no se inicializa Motion, ejecuta cleanup
 *     que retira la clase .js-anim para mostrar el hero inmediatamente.
 *   - Touch device (sin pointer:fine) → solo entrance, no hovers.
 */
import { animate } from 'motion';

const REVEAL_CLASS = 'js-anim';
const root = document.documentElement;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// Lee la curva ease-out de tokens.css en runtime → single source of
// truth. Si futuro cambias el cubic-bezier en CSS, JS sigue sincronizado
// sin requerir edición duplicada. Parsing defensivo con fallback a la
// curva Apple original por si el getComputedStyle falla (SSR/no-DOM).
const FALLBACK_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function readEaseFromCss(): [number, number, number, number] {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim();
    const match = raw.match(/cubic-bezier\(([^)]+)\)/);
    if (!match) return FALLBACK_EASE;
    const values = match[1].split(',').map((v) => Number(v.trim()));
    if (values.length !== 4 || values.some((v) => Number.isNaN(v))) return FALLBACK_EASE;
    return values as [number, number, number, number];
  } catch {
    return FALLBACK_EASE;
  }
}

const EASE_APPLE = readEaseFromCss();

function showHero() {
  // Quita la clase que oculta los elementos del hero. Si Motion no
  // alcanza a ejecutarse (network failure), el safety timeout en
  // BaseLayout también la quita.
  root.classList.remove(REVEAL_CLASS);
}

if (reducedMotion || isMobile) {
  // Mobile y reduced-motion: render visible inmediato, sin entrance.
  // Los hovers tampoco aplican (no pointer:fine en touch).
  showHero();
} else {
  runHeroEntrance();
  if (finePointer) {
    runMagneticButtons();
  }
}

function runHeroEntrance() {
  // Orden visual de entrada — el avatar entra primero (mobile) o casi
  // a la par del título (desktop), siempre como elemento ancla del hero.
  const sequence: Array<[selector: string, delay: number]> = [
    ['.hero__avatar-wrapper', 0],
    ['.hero__meta', 0.05],
    ['.hero__title', 0.12],
    ['.hero__statement', 0.26],
    ['.hero__stats', 0.36],
    ['.hero__actions', 0.46],
  ];

  // Quitamos la clase apenas iniciada la primera animación: si Motion
  // está ejecutándose, los keyframes ya controlan la opacidad final.
  showHero();

  for (const [selector, delay] of sequence) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) continue;
    animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.75, delay, ease: EASE_APPLE });
  }
}

function runMagneticButtons() {
  const buttons = document.querySelectorAll<HTMLElement>('.btn--primary, .nav__cv, .contact__link');
  // 0.18 es el sweet spot Apple: perceptible pero nunca grotesco.
  const STRENGTH = 0.18;
  const SPRING = { type: 'spring', stiffness: 220, damping: 24 } as const;

  buttons.forEach((btn) => {
    btn.addEventListener('pointermove', (event) => {
      // Filtra stylus/pen y touch: el efecto es de cursor de mouse.
      // En híbridos (Surface, iPad+Magic Keyboard) finePointer pasa pero
      // un input pen/touch puede emitir pointermove de tipo distinto.
      if (event.pointerType !== 'mouse') return;
      const rect = btn.getBoundingClientRect();
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;
      animate(btn, { x: dx * STRENGTH, y: dy * STRENGTH }, SPRING);
    });
    btn.addEventListener('pointerleave', () => {
      animate(btn, { x: 0, y: 0 }, SPRING);
    });
  });
}

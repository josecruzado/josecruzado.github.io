import { execSync } from 'node:child_process';

/**
 * Fecha del último commit, en ISO 8601.
 *
 * La usan el `lastmod` del sitemap (astro.config.mjs) y el `meta.lastModified`
 * de /cv.json. Se prefiere a la fecha del build porque cualquier rebuild —un
 * bump de dependencias, un redeploy manual— afirmaría que el contenido cambió
 * cuando no es cierto.
 *
 * actions/checkout trae el último commit con su fecha incluso con
 * fetch-depth 1. Sin git disponible devuelve undefined, y quien la consuma
 * omite el campo en lugar de publicar una fecha inventada.
 */
export function lastCommitDate(): Date | undefined {
  try {
    const iso = execSync('git log -1 --format=%cI', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

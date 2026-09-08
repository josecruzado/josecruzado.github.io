import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { EDUCATION } from '../lib/education';
import { SITE } from '../lib/site';
import { SKILLS } from '../lib/skills';

/**
 * /llms.txt — resumen del perfil en markdown plano para crawlers de IA.
 *
 * Convención emergente (llmstxt.org) que complementa lo que ya hace el
 * sitio: robots.txt permite explícitamente GPTBot, Google-Extended y
 * ClaudeBot, y el JSON-LD describe la entidad Person. Esto último es
 * legible por máquinas pero verboso; llms.txt entrega lo mismo en el
 * formato que un modelo consume mejor, sin tener que extraerlo del HTML.
 *
 * Se genera como endpoint y no como archivo estático en public/ para que
 * beba de las mismas fuentes que las secciones: site.ts, skills.ts,
 * education.ts y las content collections. Un archivo a mano quedaría
 * desactualizado en cuanto cambiara la experiencia y nadie se enteraría.
 */
export const GET: APIRoute = async () => {
  const experiences = (await getCollection('experience')).sort(
    (a, b) => a.data.order - b.data.order
  );
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  const { author, social, stats } = SITE;

  const lines = [
    `# ${author.name}`,
    '',
    `> ${author.role} en ${author.location.city}, ${author.location.country}. ${author.bio}`,
    '',
    `- Web: ${SITE.url}`,
    `- LinkedIn: ${social.linkedin}`,
    `- GitHub: ${social.github}`,
    `- Email: ${author.email}`,
    `- CV en PDF: ${new URL('/cv.pdf', SITE.url).href}`,
    `- CV estructurado (JSON Resume): ${new URL('/cv.json', SITE.url).href}`,
    `- Idiomas: ${author.languages.map((l) => `${l.name} (${l.level})`).join(', ')}`,
    '',
    '## En cifras',
    '',
    ...stats.map((s) => `- ${s.label}: ${s.value}`),
    '',
    '## Experiencia',
    '',
    ...experiences.flatMap((job) => {
      const { company, client, role, period, location, summary, technologies, achievements } =
        job.data;
      return [
        `### ${role} — ${company}${client ? ` (cliente: ${client})` : ''}`,
        `${period} · ${location}`,
        '',
        summary,
        '',
        ...achievements.map((a) => `- ${a}`),
        '',
        `Stack: ${technologies.join(', ')}`,
        '',
      ];
    }),
    '## Proyectos destacados',
    '',
    ...projects.flatMap((project) => {
      const { title, client, description, challenge, role, impact, technologies } = project.data;
      return [
        `### ${title} — ${client}`,
        '',
        description,
        '',
        `- Reto: ${challenge}`,
        `- Rol: ${role}`,
        `- Impacto: ${impact}`,
        `- Stack: ${technologies.join(', ')}`,
        '',
      ];
    }),
    '## Habilidades',
    '',
    ...SKILLS.flatMap((category) => [
      `### ${category.name}`,
      category.skills.map((s) => s.name).join(', '),
      '',
    ]),
    '## Formación y certificaciones',
    '',
    ...EDUCATION.map((item) => `- ${item.title} — ${item.institution} (${item.period})`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

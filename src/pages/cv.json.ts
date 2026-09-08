import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { lastCommitDate } from '../lib/build-info';
import { EDUCATION } from '../lib/education';
import { SITE } from '../lib/site';
import { SKILLS } from '../lib/skills';

/**
 * /cv.json — el CV como contrato consumible, en formato JSON Resume.
 *
 * Complementa a llms.txt: aquel entrega el perfil en prosa para modelos,
 * este lo entrega estructurado y validable contra un esquema publicado
 * (https://jsonresume.org), que herramientas de terceros y ATS ya saben leer.
 *
 * Se genera desde las MISMAS fuentes que el sitio —site.ts, skills.ts,
 * education.ts y las content collections—, de modo que no puede
 * desincronizarse de lo que muestra la web. Es el mismo criterio que se
 * aplicó a llms.txt.
 *
 * Sin `basics.phone` a propósito: el teléfono se retiró del sitio para no
 * exponerlo a scrapers, y este endpoint no es una excepción.
 */

/** Rangos de EDUCATION: '2017/2021', '2024-06/2024-08' o un valor suelto. */
function splitPeriod(datetime?: string): { start?: string; end?: string } {
  if (!datetime) return {};
  const [start, end] = datetime.split('/');
  return { start, end: end ?? start };
}

/** El handle es el último segmento con contenido de la URL del perfil. */
function handleFrom(url: string): string {
  return new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
}

/** `endDate: 'present'` es texto humano: JSON Resume espera ISO 8601 u omisión. */
function isoEnd(raw: string): string | undefined {
  return raw && raw !== 'present' ? raw : undefined;
}

export const GET: APIRoute = async () => {
  const experiences = (await getCollection('experience')).sort(
    (a, b) => a.data.order - b.data.order
  );
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  const { author, social } = SITE;
  const degree = EDUCATION.find((item) => item.type === 'degree');
  const modified = lastCommitDate();

  const resume = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',

    basics: {
      name: author.name,
      label: author.role,
      image: new URL(SITE.seo.ogImage, SITE.url).href,
      email: author.email,
      url: SITE.url,
      summary: author.bio,
      location: {
        city: author.location.city,
        countryCode: author.location.countryCode,
      },
      profiles: [
        { network: 'LinkedIn', username: handleFrom(social.linkedin), url: social.linkedin },
        { network: 'GitHub', username: handleFrom(social.github), url: social.github },
      ],
    },

    work: experiences.map((job) => {
      const { company, client, role, location, startDate, endDate, summary, achievements } =
        job.data;
      const end = isoEnd(endDate);
      return {
        name: company,
        position: role,
        location,
        ...(client ? { description: `Cliente: ${client}` } : {}),
        ...(job.data.companyUrl ? { url: job.data.companyUrl } : {}),
        startDate,
        ...(end ? { endDate: end } : {}),
        summary,
        highlights: achievements,
      };
    }),

    education: degree
      ? [
          {
            institution: degree.institution,
            area: degree.title,
            studyType: 'Bachelor',
            ...(splitPeriod(degree.datetime).start
              ? { startDate: splitPeriod(degree.datetime).start }
              : {}),
            ...(splitPeriod(degree.datetime).end
              ? { endDate: splitPeriod(degree.datetime).end }
              : {}),
          },
        ]
      : [],

    certificates: EDUCATION.filter((item) => item.type !== 'degree').map((item) => {
      const { end } = splitPeriod(item.datetime);
      return {
        name: item.title,
        issuer: item.institution,
        ...(end ? { date: end } : {}),
      };
    }),

    skills: SKILLS.map((category) => ({
      name: category.name,
      keywords: category.skills.map((skill) => skill.name),
    })),

    languages: author.languages.map((language) => ({
      language: language.name,
      fluency: language.level,
    })),

    projects: projects.map((project) => {
      const { title, client, description, challenge, role, impact, technologies } = project.data;
      return {
        name: title,
        description,
        highlights: [`Reto: ${challenge}`, `Impacto: ${impact}`],
        keywords: technologies,
        roles: [role],
        entity: client,
        type: 'application',
      };
    }),

    meta: {
      canonical: new URL('/cv.json', SITE.url).href,
      version: 'v1.0.0',
      ...(modified ? { lastModified: modified.toISOString() } : {}),
    },
  };

  return new Response(JSON.stringify(resume, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

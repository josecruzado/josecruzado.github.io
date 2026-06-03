import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    client: z.string().optional(),
    role: z.string(),
    location: z.string(),
    period: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    isCurrent: z.boolean().default(false),
    summary: z.string(),
    achievements: z.array(z.string()).min(1),
    technologies: z.array(z.string()),
    order: z.number(),
    /**
     * URL pública de la empresa — enriquece worksFor/hasOccupation
     * en JSON-LD para que Google asocie la entidad correctamente.
     */
    companyUrl: z.url().optional(),
    /**
     * Wikidata ID URL (https://www.wikidata.org/wiki/Q...) — se emite
     * como sameAs en JSON-LD, máxima señal para Knowledge Graph.
     */
    companyWikidata: z.url().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    description: z.string(),
    challenge: z.string(),
    role: z.string(),
    impact: z.string(),
    technologies: z.array(z.string()),
    icon: z.string().default('lucide:code-2'),
    accent: z.enum(['cyan', 'blue', 'purple', 'pink', 'orange', 'green']),
    order: z.number(),
  }),
});

export const collections = { experience, projects };

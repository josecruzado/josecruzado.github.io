import { SITE } from './site';

/**
 * Contrato OpenAPI del propio sitio.
 *
 * No es una maqueta: describe los endpoints que este sitio sirve de verdad
 * (/cv.json y /llms.txt), se publica en /openapi.json y es lo mismo que
 * renderiza la sección «Contrato». Si un endpoint cambia, el contrato y su
 * vista cambian con él, porque ambos leen de aquí.
 *
 * Se define como objeto y no como YAML escrito a mano para que los datos
 * salgan de site.ts —servidor, contacto, versión— en lugar de repetirse.
 */
export const API_CONTRACT = {
  openapi: '3.1.0',
  info: {
    title: `${SITE.author.displayName} — Perfil profesional`,
    version: '1.0.0',
    summary: 'El CV como contrato consumible.',
    description:
      'Expone el perfil profesional en formatos legibles por máquina. ' +
      'Se genera en build desde las mismas fuentes que la web, de modo que ' +
      'no puede desincronizarse de lo que el sitio muestra.',
    contact: {
      name: SITE.author.name,
      email: SITE.author.email,
      url: SITE.url,
    },
    license: { name: 'MIT', identifier: 'MIT' },
  },
  servers: [{ url: SITE.url, description: 'Producción' }],
  tags: [{ name: 'perfil', description: 'Representaciones del perfil profesional.' }],
  paths: {
    '/cv.json': {
      get: {
        tags: ['perfil'],
        operationId: 'getCurriculum',
        summary: 'Currículum en formato JSON Resume',
        description:
          'Devuelve el CV completo validado contra el esquema JSON Resume v1.0.0: ' +
          'datos de contacto, experiencia con logros, formación, certificaciones, ' +
          'habilidades por categoría, idiomas y proyectos.',
        responses: {
          '200': {
            description: 'Currículum completo.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Resume' },
              },
            },
          },
        },
      },
    },
    '/llms.txt': {
      get: {
        tags: ['perfil'],
        operationId: 'getProfileForLlms',
        summary: 'Perfil en markdown para agentes',
        description:
          'Mismo contenido en markdown plano, siguiendo la convención llmstxt.org ' +
          'para que un modelo lo consuma sin extraerlo del HTML.',
        responses: {
          '200': {
            description: 'Perfil en markdown.',
            content: { 'text/plain': { schema: { type: 'string' } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Resume: {
        type: 'object',
        required: ['basics', 'work', 'skills'],
        properties: {
          basics: { $ref: '#/components/schemas/Basics' },
          work: { type: 'array', items: { $ref: '#/components/schemas/Work' } },
          education: { type: 'array', items: { type: 'object' } },
          certificates: { type: 'array', items: { type: 'object' } },
          skills: { type: 'array', items: { type: 'object' } },
          languages: { type: 'array', items: { type: 'object' } },
          projects: { type: 'array', items: { type: 'object' } },
        },
      },
      Basics: {
        type: 'object',
        required: ['name', 'label', 'email'],
        properties: {
          name: { type: 'string', example: SITE.author.name },
          label: { type: 'string', example: SITE.author.role },
          email: { type: 'string', format: 'email' },
          url: { type: 'string', format: 'uri' },
          summary: { type: 'string' },
          location: { type: 'object' },
          profiles: { type: 'array', items: { type: 'object' } },
        },
      },
      Work: {
        type: 'object',
        required: ['name', 'position', 'startDate'],
        properties: {
          name: { type: 'string', example: 'Globant' },
          position: { type: 'string', example: 'Java Developer Sr.' },
          location: { type: 'string', example: 'Lima, Perú' },
          description: { type: 'string', example: 'Cliente: Banco de Crédito del Perú (BCP)' },
          startDate: { type: 'string', format: 'date', example: '2026-08-17' },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'Ausente cuando el puesto está vigente.',
          },
          summary: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
} as const;

export type ApiContract = typeof API_CONTRACT;

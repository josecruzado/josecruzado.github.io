/**
 * Single Source of Truth — configuración global del sitio.
 * Cualquier referencia a nombre, email, URLs, redes o claims debe leerse desde aquí.
 */
export const SITE = {
  url: 'https://josecruzado.github.io',
  locale: 'es-PE',

  author: {
    name: 'José Félix Cruzado Vega',
    displayName: 'José Cruzado',
    firstName: 'José Félix',
    lastName: 'Cruzado Vega',
    role: 'Senior Backend Java Developer',
    bio: 'Senior Backend Developer con más de 6 años diseñando, desarrollando y operando microservicios en sectores de banca, riesgo crediticio y retail e-commerce. Especializado en arquitecturas event-driven con Kafka, contratos OpenAPI y entrega continua sobre AWS y Azure (AKS).',
    location: { city: 'Lima', country: 'Perú', countryCode: 'PE' },
    email: 'josecruzado.1206@gmail.com',
    languages: [
      { name: 'Español', level: 'Nativo', code: 'es' },
      { name: 'Inglés', level: 'B2', code: 'en' },
    ],
    university: 'Universidad Privada del Norte',
  },

  social: {
    github: 'https://github.com/josecruzado',
    linkedin: 'https://www.linkedin.com/in/josecruzado12/',
    email: 'mailto:josecruzado.1206@gmail.com?subject=Oportunidad%20Senior%20Backend%20Java',
  },

  stats: [
    { value: '6+', label: 'Años de experiencia' },
    { value: '4', label: 'Sectores impactados' },
    { value: '10+', label: 'Microservicios en producción' },
  ],

  nav: [
    { href: '#inicio', label: 'Inicio', icon: 'lucide:house' },
    { href: '#experiencia', label: 'Experiencia', icon: 'lucide:briefcase' },
    { href: '#proyectos', label: 'Proyectos', icon: 'lucide:code-2' },
    { href: '#habilidades', label: 'Habilidades', icon: 'lucide:wrench' },
    { href: '#contacto', label: 'Contacto', icon: 'lucide:mail' },
  ],

  seo: {
    defaultTitle: 'José Cruzado · Senior Backend Java Developer',
    titleTemplate: '%s | José Cruzado',
    defaultDescription:
      'Portfolio de José Cruzado, Senior Backend Java Developer con 6+ años construyendo microservicios para banca, retail y sistemas críticos con Spring Boot, Quarkus, Kafka, AWS y Azure AKS. Lima, Perú.',
    ogImage: '/og.png',
    themeColorDark: '#000000',
    themeColorLight: '#ffffff',
  },
} as const;

export type SiteConfig = typeof SITE;

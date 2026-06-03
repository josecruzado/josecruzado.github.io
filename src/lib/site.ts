/**
 * Single Source of Truth — configuración global del sitio.
 * Cualquier referencia a nombre, email, URLs, redes o claims debe leerse desde aquí.
 */
export const SITE = {
  url: 'https://josecruzado.github.io',
  locale: 'es-PE',
  alternateLocale: 'en-US',

  author: {
    name: 'José Félix Cruzado Vega',
    displayName: 'José Cruzado',
    firstName: 'José Félix',
    lastName: 'Cruzado Vega',
    role: 'Senior Backend Java Developer',
    headline: 'Senior Backend Java Developer · Spring · Quarkus · Cloud',
    tagline:
      'Construyo sistemas backend escalables y de misión crítica con Java, Spring y Quarkus.',
    bio: 'Senior Backend Developer con más de 6 años diseñando, desarrollando y operando microservicios en sectores de banca, riesgo crediticio y retail e-commerce. Especializado en arquitecturas event-driven con Kafka, contratos OpenAPI y entrega continua sobre AWS y Azure (AKS).',
    bioShort:
      'Backend Java Senior con 6+ años en banca, seguridad y e-commerce. Microservicios, Kafka, AWS, Azure AKS.',
    location: { city: 'Lima', country: 'Perú', countryCode: 'PE' },
    email: 'josecruzado.1206@gmail.com',
    phone: '+51 936 144 446',
    phoneE164: '+51936144446',
    languages: [
      { name: 'Español', level: 'Nativo', code: 'es' },
      { name: 'Inglés', level: 'B2', code: 'en' },
    ],
    university: 'Universidad Privada del Norte',
    degree: 'Bachiller en Ingeniería de Sistemas Computacionales',
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

  /** Habilidades destacadas para superficies resumidas. */
  heroSkills: ['Java', 'Spring Boot', 'Quarkus', 'Kafka', 'AKS · AWS'],

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

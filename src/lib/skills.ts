/**
 * Catálogo de skills categorizado. Single source of truth para
 * la sección Habilidades y para superficies resumidas del sitio.
 */

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  skills: Array<{ name: string; icon?: string }>;
}

export const SKILLS: SkillCategory[] = [
  {
    id: 'languages',
    name: 'Lenguajes & Frameworks',
    icon: 'lucide:code-2',
    skills: [
      { name: 'Java (8 · 11 · 21)', icon: 'simple-icons:openjdk' },
      { name: 'Spring Boot', icon: 'simple-icons:springboot' },
      { name: 'Spring Framework', icon: 'simple-icons:spring' },
      { name: 'Spring MVC', icon: 'simple-icons:spring' },
      { name: 'Quarkus', icon: 'simple-icons:quarkus' },
      { name: 'Node.js', icon: 'simple-icons:nodedotjs' },
      { name: 'Angular', icon: 'simple-icons:angular' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend & Microservicios',
    icon: 'lucide:server',
    skills: [
      { name: 'Microservicios' },
      { name: 'REST APIs' },
      { name: 'OpenAPI 3.0', icon: 'simple-icons:openapiinitiative' },
      { name: 'Spring Data · JPA · Hibernate' },
      { name: 'Spring Security · JWT' },
      { name: 'Spring AOP' },
      { name: 'Event-driven (Kafka)', icon: 'simple-icons:apachekafka' },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    icon: 'lucide:cloud',
    skills: [
      { name: 'AWS (ECS · ECR · Secrets Manager)', icon: 'simple-icons:amazonwebservices' },
      { name: 'Azure AKS · APIM', icon: 'simple-icons:microsoftazure' },
      { name: 'Docker', icon: 'simple-icons:docker' },
      { name: 'Kubernetes', icon: 'simple-icons:kubernetes' },
      { name: 'Terraform', icon: 'simple-icons:terraform' },
      { name: 'Jenkins · GoCD · Bamboo', icon: 'simple-icons:jenkins' },
      { name: 'GitOps' },
    ],
  },
  {
    id: 'data',
    name: 'Bases de datos',
    icon: 'lucide:database',
    skills: [
      { name: 'MongoDB', icon: 'simple-icons:mongodb' },
      { name: 'Cloud Firestore' },
      { name: 'Cosmos DB' },
      { name: 'Oracle', icon: 'simple-icons:oracle' },
      { name: 'MySQL', icon: 'simple-icons:mysql' },
    ],
  },
  {
    id: 'quality',
    name: 'Calidad & Seguridad',
    icon: 'lucide:shield-check',
    skills: [
      { name: 'JUnit · Mockito' },
      { name: 'Traffic Parrot' },
      { name: 'SonarQube', icon: 'simple-icons:sonarqube' },
      { name: 'Fortify' },
      { name: 'Vulnerability remediation' },
    ],
  },
  {
    id: 'tools',
    name: 'Herramientas & Metodología',
    icon: 'lucide:wrench',
    skills: [
      { name: 'Git · Bitbucket', icon: 'simple-icons:git' },
      { name: 'Jira · Confluence' },
      { name: 'Postman · Swagger · JMeter' },
      { name: 'Scrum · Agile' },
      { name: 'Pentaho · Control-M (ETL)' },
    ],
  },
];

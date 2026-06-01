export interface EducationItem {
  period: string;
  title: string;
  institution: string;
  type: 'degree' | 'certification' | 'course' | 'language';
  icon: string;
}

export const EDUCATION: EducationItem[] = [
  {
    period: '2017 — 2021',
    title: 'Bachiller en Ingeniería de Sistemas Computacionales',
    institution: 'Universidad Privada del Norte',
    type: 'degree',
    icon: 'lucide:graduation-cap',
  },
  {
    period: 'Jun — Ago 2024',
    title: 'Java 17 Backend Developer',
    institution: 'Cibertec',
    type: 'certification',
    icon: 'simple-icons:openjdk',
  },
  {
    period: 'May 2024',
    title: 'AWS Cloud Practitioner Essentials',
    institution: 'Qucoon',
    type: 'certification',
    icon: 'simple-icons:amazonwebservices',
  },
  {
    period: 'Dic 2023',
    title: 'Java Intermediate',
    institution: 'Sololearn',
    type: 'course',
    icon: 'simple-icons:openjdk',
  },
  {
    period: 'Ene 2022',
    title: 'CEFR for Languages — English Level B2',
    institution: 'Open English',
    type: 'language',
    icon: 'lucide:languages',
  },
  {
    period: 'Ago — Dic 2019',
    title: 'Linux Essentials Professional',
    institution: 'Cisco Networking Academy',
    type: 'certification',
    icon: 'lucide:terminal',
  },
  {
    period: '2019',
    title: 'CCNA Routing & Switching',
    institution: 'Cisco Networking Academy',
    type: 'certification',
    icon: 'lucide:network',
  },
];

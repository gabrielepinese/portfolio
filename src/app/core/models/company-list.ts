export interface CompanyList {
  id: number;
  title: string;
  companyName: string;
  from: string;
  to: string;
  description: string;
  chips: string[];
  link: string;
}

export const LIST_ITEMS: CompanyList[] = [
  {
    id: 1,
    from: 'SEP 2022',
    to: 'Present',
    companyName: 'Lunalabs',
    title: 'Angular Frontend Developer',
    description:
      "I had the opportunity to dive deep into Angular and turn it into a true passion, building increasingly complex and optimized architectures with a strong focus on code quality and performance. I love bringing designers' ideas to life by transforming them into dynamic, accessible interfaces where aesthetics and functionality work in harmony. This experience allowed me to work in a team, face real-world challenges, and actively contribute to the development of well-designed, engaging, and meaningful projects.",
    chips: ['Angular', 'HTML & SCSS', 'TypeScript', 'Node.js'],
    link: 'https://www.lunalabs.it/',
  },
  {
    id: 0,
    from: 'APR',
    to: 'SEP 2022',
    companyName: 'Do Different',
    title: 'ICT Developer',
    description:
      'During an internship as an ICT developer, I had the chance to explore the backend world, working with Java and the Spring framework in a microservices-based environment. Although it was a short experience, it allowed me to understand backend development dynamics and contribute to small real-world tasks within a team.',
    chips: ['Java', 'Spring'],
    link: 'https://dodifferent.it/',
  },
];

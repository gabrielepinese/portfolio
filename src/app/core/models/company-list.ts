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
    from: "OCT 2022",
    to: "Present",
    companyName: "Lunalabs",
    title: "Software Engineer",
    description:
      "I started out on the frontend, diving deep into Angular and TypeScript: building and refactoring complex components, optimizing performance, and turning designers' ideas into dynamic, accessible interfaces. Over time my role grew into Software Engineering: today I own features end-to-end, from the UI to REST API integration, application logic, database and server-side work, collaborating closely with the backend team and taking part in architectural decisions. This experience taught me to work in a team, face real-world challenges, and look at a product as a whole rather than a single layer.",
    chips: ["Angular", "TypeScript", "HTML & SCSS", "Node.js", "REST API", "SQL"],
    link: "https://www.lunalabs.it/",
  },
  {
    id: 0,
    from: "APR",
    to: "SEP 2022",
    companyName: "Do Different",
    title: "ICT Developer",
    description:
      "During an internship as an ICT developer, I had the chance to explore the backend world, working with Java and the Spring framework in a microservices-based environment. Although it was a short experience, it allowed me to understand backend development dynamics and contribute to small real-world tasks within a team.",
    chips: ["Java", "Spring"],
    link: "https://dodifferent.it/",
  },
];

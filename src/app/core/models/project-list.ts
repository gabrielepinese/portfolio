export interface Project {
  id: number;
  title: string;
  description: string;
  chips: string[];
  link?: string;
  featured: boolean;
}

export const PROJECT_ITEMS: Project[] = [];

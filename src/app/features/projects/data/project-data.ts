import { ProjectData, ProjectFilter } from "../interface/project-data";

export const PROJECTS: ProjectData[] = [
  {
    id: "portfolio",
    title: "Portfolio Angular",
    description:
      "Portfolio personnel développé avec Angular 20 et TailwindCSS, utilisant une architecture moderne basée sur les signaux.",
    technologies: ["Angular", "TypeScript", "TailwindCSS", "Signals"],
    image_path: "/projets/portfolio-angular.webp",
    github_urls: {
      frontend: "https://github.com/username/portfolio",
      backend: "https://github.com/username/portfolio-api",
    },
    demo_url: "https://portfolio.example.com",
    category: "frontend",
    featured: true,
    date: "2024-06",
  },
  {
    id: "ecommerce-api",
    title: "API E-commerce",
    description:
      "API RESTful pour une plateforme e-commerce avec authentification JWT, gestion des produits et des commandes.",
    technologies: ["Node.js", "Express", "MongoDB", "JWT"],
    image_path: "images/projects/ecommerce-api.jpg",
    github_urls: {
      backend: "https://github.com/username/ecommerce-api",
    },
    category: "backend",
    featured: true,
    date: "2024-04",
  },
  {
    id: "task-manager",
    title: "Gestionnaire de tâches",
    description:
      "Application complète de gestion de tâches avec fonctionnalités de collaboration et notifications en temps réel.",
    technologies: ["React", "Node.js", "Socket.io", "PostgreSQL"],
    image_path: "images/projects/task-manager.jpg",
    github_urls: {
      frontend: "https://github.com/username/task-manager-frontend",
      backend: "https://github.com/username/task-manager-api",
    },
    demo_url: "https://tasks.example.com",
    category: "fullstack",
    featured: false,
    date: "2024-02",
  },
  {
    id: "data-analyzer",
    title: "Analyseur de données",
    description:
      "Script d'analyse de données pour traiter et visualiser des ensembles de données volumineux.",
    technologies: ["Python", "Pandas", "Matplotlib", "NumPy"],
    image_path: "images/projects/data-analyzer.jpg",
    github_urls: {
      fullstack: "https://github.com/username/data-analyzer",
    },
    category: "script",
    featured: false,
    date: "2023-11",
  },
  {
    id: "weather-app",
    title: "Application météo",
    description:
      "Application météo avec prévisions sur 5 jours et géolocalisation.",
    technologies: ["Vue.js", "Axios", "OpenWeatherAPI", "Geolocation API"],
    image_path: "images/projects/weather-app.jpg",
    github_urls: {
      frontend: "https://github.com/username/weather-app",
    },
    demo_url: "https://weather.example.com",
    category: "frontend",
    featured: false,
    date: "2023-09",
  },
  {
    id: "auth-service",
    title: "Service d'authentification",
    description:
      "Microservice d'authentification avec support OAuth, MFA et gestion des sessions.",
    technologies: ["Java", "Spring Boot", "OAuth2", "Redis"],
    image_path: "images/projects/auth-service.jpg",
    github_urls: {
      backend: "https://github.com/username/auth-service",
    },
    category: "backend",
    featured: false,
    date: "2023-07",
  },
];

export const PROJECT_FILTERS: ProjectFilter[] = [
  { label: "Tous", value: "all", active: true },
  { label: "Frontend", value: "frontend", active: false },
  { label: "Backend", value: "backend", active: false },
  { label: "Fullstack", value: "fullstack", active: false },
  { label: "Script", value: "script", active: false },
];

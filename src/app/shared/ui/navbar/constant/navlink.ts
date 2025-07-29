import { Navlink } from "@shared/ui/navbar/interface/navlink";

export const NAVIGATION_ITEMS: Navlink[] = [
  {
    label: "Accueil",
    icon: "/icons/home.svg",
    altText: "Home icon",
    route: "/",
    fragment: "home",
  },
  {
    label: "À propos",
    icon: "/icons/about.svg",
    altText: "About icon",
    route: "/",
    fragment: "about",
  },
  {
    label: "Compétences",
    icon: "/icons/stack.svg",
    altText: "Stacks icon",
    route: "/",
    fragment: "skills",
  },
  {
    label: "Projets",
    icon: "/icons/project.svg",
    altText: "Projects icon",
    route: "/",
    fragment: "projects",
  },
  {
    label: "Contact",
    icon: "/icons/contact.svg",
    altText: "Contact icon",
    route: "/",
    fragment: "contact",
  },
];

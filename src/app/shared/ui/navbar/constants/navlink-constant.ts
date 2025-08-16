import { Navlink } from "../models/navlink-model";

export const NAVIGATION_ITEMS: Navlink[] = [
  {
    label: "Accueil",
    icon: "/icons/home.svg",
    altText: "Landing icon",
    route: "/",
  },
  {
    label: "À propos",
    icon: "/icons/about.svg",
    altText: "About icon",
    route: "/about",
  },
  {
    label: "Compétences",
    icon: "/icons/stack.svg",
    altText: "Stacks icon",
    route: "/skills",
  },
  {
    label: "Projets",
    icon: "/icons/project.svg",
    altText: "Projects icon",
    route: "/projects",
  },
  {
    label: "Contact",
    icon: "/icons/contact.svg",
    altText: "Contact icon",
    route: "/contact",
  },
];

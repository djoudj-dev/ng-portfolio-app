import { ContactCard, ContactCardGroup } from "../interface/contact.interface";

interface Contact {
  cards: ContactCard[];
  cardGroups: ContactCardGroup[];
}

export const CONTACT_DATA: Contact = {
  cards: [
    {
      id: "email",
      title: "Email",
      icon: "icons/mail.svg",
      content: "contact@nedellec-julien.fr",
      link: "mailto:contact@nedellec-julien.fr",
    },
    {
      id: "phone",
      title: "Téléphone",
      icon: "icons/mobile.svg",
      content: "+33 6 22 86 92 79",
      link: "tel:+33622869279",
    },
    {
      id: "location",
      title: "Localisation",
      icon: "icons/location.svg",
      content: "Voisins-Le-Bretonneux, France",
    },
    {
      id: "linkedin",
      title: "LinkedIn",
      icon: "icons/linkedin.svg",
      content: "Mon profil LinkedIn",
      link: "https://www.linkedin.com/in/nedellec-julien/",
    },
  ],
  cardGroups: [
    {
      id: "coordinates",
      title: "Mes coordonnées",
      items: [
        {
          id: "email",
          title: "Email",
          icon: "icons/mail.svg",
          content: "contact@nedellec-julien.fr",
          link: "mailto:contact@nedellec-julien.fr",
        },
        {
          id: "phone",
          title: "Téléphone",
          icon: "icons/mobile.svg",
          content: "+33 6 22 86 92 79",
          link: "tel:+33622869279",
        },
        {
          id: "location",
          title: "Localisation",
          icon: "icons/location.svg",
          content: "Voisins-Le-Bretonneux, France",
        },
      ],
    },
    {
      id: "social",
      title: "Réseaux sociaux",
      items: [
        {
          id: "linkedin",
          title: "LinkedIn",
          icon: "icons/linkedin.svg",
          content: "Découvrez mon parcours.",
          link: "https://www.linkedin.com/in/nedellec-julien/",
        },
        {
          id: "github",
          title: "GitHub",
          icon: "icons/github.svg",
          content: "Explorez mes projets.",
          link: "https://github.com/djoudj-dev",
        },
      ],
    },
  ],
};

import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AboutCard } from "../about-card/about-card";
import { SOCIAL_BADGES } from "../../data/social-badges.data";
import { SocialBadge } from "../../interface/social-badge";

@Component({
  selector: 'app-about-main',
  imports: [NgOptimizedImage, AboutCard],
  templateUrl: './about-main.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes halo {
      0%,
      100% {
        opacity: 0.6;
        transform: scale(1);
      }
      50% {
        opacity: 0.85;
        transform: scale(1.05);
      }
    }
  `,
})
export class AboutMain {
  readonly socialBadges: SocialBadge[] = SOCIAL_BADGES;

  readonly cards = [
    {
      title: 'Étudiant perpétuel',
      description:
        'Toujours en quête de nouvelles connaissances et technologies pour rester à la pointe du développement web.',
      icon: 'student',
    },
    {
      title: "Esprit d'équipe",
      description:
        "J'aime collaborer et partager mes connaissances avec mes collègues pour créer des projets exceptionnels.",
      icon: 'team',
    },
    {
      title: 'Curieux de nature',
      description:
        "Passionné par l'exploration de nouvelles approches et solutions créatives pour résoudre les défis techniques.",
      icon: 'curious',
    },
    {
      title: 'Pensée analytique',
      description:
        "J'aime analyser les problèmes complexes et trouver des solutions élégantes et performantes.",
      icon: 'brain',
    },
  ];
}

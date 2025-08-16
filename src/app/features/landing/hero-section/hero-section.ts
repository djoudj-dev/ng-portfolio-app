import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { LaptopView } from "@features/landing/laptop-view/laptop-view";
import { ButtonComponent } from "@shared/ui/button/button";

@Component({
  selector: "app-hero-section",
  imports: [LaptopView, ButtonComponent, NgOptimizedImage],
  templateUrl: "./hero-section.html",
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
export class HeroSection {
  private readonly router = inject(Router);
  
  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }
  
  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }
  
  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }
}

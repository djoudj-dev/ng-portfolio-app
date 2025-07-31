import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ScrollService } from "@app/core/services/scroll-service";
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
  private readonly scrollService = inject(ScrollService);
  scrollToSection(fragment: string): Promise<void> {
    return this.scrollService.scrollToSection(fragment);
  }
}

import { Component, inject } from "@angular/core";
import { ThemeService } from "@core/services/theme-service";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-button-dark-mode",
  imports: [NgOptimizedImage],
  template: `
    <button
      class="p-2 rounded-lg bg-background hover:bg-accent group"
      (click)="toggleDarkMode()"
      aria-label="Basculer le mode sombre"
      title="Basculer le mode sombre"
    >
      <img
        class="h-5 w-5 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12 icon-invert"
        [ngSrc]="isDarkMode() ? 'icons/moon.svg' : 'icons/sun.svg'"
        [alt]="isDarkMode() ? 'Mode sombre activé' : 'Mode clair activé'"
        width="20"
        height="20"
      />
    </button>
  `,
})
export class ButtonDarkMode {
  private readonly themeService = inject(ThemeService);

  isDarkMode = this.themeService.isDarkMode;
  theme = this.themeService.theme;

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }
}

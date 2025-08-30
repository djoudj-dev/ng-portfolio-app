import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
} from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { FooterComponent } from "@shared/ui/footer/footer";
import { Navbar } from "@shared/ui/navbar/navbar";
import { ToastComponent } from "@shared/ui/toast/components/toast";
import { ThemeService } from "@core/services/theme-service";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  imports: [Navbar, ToastComponent, RouterOutlet, FooterComponent],
  templateUrl: "./app.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.dark]": "themeService.isDarkMode()",
    "[attr.data-theme]": "themeService.theme()",
  },
})
export class App implements OnInit {
  protected readonly title = signal("ng-portfolio-app");
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  // Signal pour la route courante
  protected readonly currentRoute = signal<string>("/");

  // Computed pour savoir si on doit afficher le footer
  protected readonly showFooter = computed(() =>
    this.currentRoute() === "/contact"
  );

  ngOnInit(): void {
    // Scroll to top only on route changes (not on home page)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Mettre à jour la route courante
      this.currentRoute.set(event.url);

      // Don't auto-scroll on home page to preserve scroll behavior
      if (event.url !== "/" && !event.url.includes("#")) {
        window.scrollTo(0, 0);
      }
    });
  }
}

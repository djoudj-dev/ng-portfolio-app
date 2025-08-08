import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "@shared/ui/footer/footer.component";
import { Navbar } from "@shared/ui/navbar/components/navbar/navbar";
import { ToastComponent } from "@shared/ui/toast/components/toast";
import { ThemeService } from "@core/services/theme-service";

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
export class App {
  protected readonly title = signal("ng-portfolio-app");
  protected readonly themeService = inject(ThemeService);
}

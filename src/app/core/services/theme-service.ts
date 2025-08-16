import { computed, effect, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly themeKey = "theme";
  private readonly _theme = signal<"light" | "dark">(this.getInitialTheme());

  readonly theme = this._theme.asReadonly();
  readonly isDarkMode = computed(() => this._theme() === "dark");

  constructor() {
    effect(() => {
      const theme = this._theme();
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(this.themeKey, theme);
        } catch {
          // localStorage might be unavailable (SSR or privacy mode)
        }
      }
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.setAttribute("data-theme", theme);
      }
    });
  }

  toggleTheme(): void {
    this._theme.update((current) => (current === "light" ? "dark" : "light"));
  }

  private getInitialTheme(): "light" | "dark" {
    if (typeof localStorage !== "undefined") {
      const savedTheme = localStorage.getItem(this.themeKey);
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
    }
    return "light";
  }
}

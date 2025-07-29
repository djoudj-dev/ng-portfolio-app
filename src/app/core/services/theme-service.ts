import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeKey = 'theme';
  private readonly _isDarkMode = signal<boolean>(false);

  readonly isDarkMode = computed(() => this._isDarkMode());

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {
    this.setTheme(this.isDarkMode() ? 'light' : 'dark');
  }

  setTheme(theme: 'light' | 'dark'): void {
    const isDark = theme === 'dark';
    this._isDarkMode.set(isDark);

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.themeKey, theme);
    }
  }

  loadTheme(): void {
    const savedTheme =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(this.themeKey)
        : null;

    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    this.setTheme(theme);
  }

  get theme(): 'light' | 'dark' {
    return this.isDarkMode() ? 'dark' : 'light';
  }
}

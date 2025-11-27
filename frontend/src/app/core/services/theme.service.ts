import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'app-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _theme = signal<Theme>(this.loadTheme());

  readonly theme = this._theme.asReadonly();
  readonly isDark = () => this._theme() === 'dark';

  constructor() {
    effect(() => {
      const theme = this._theme();
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.documentElement.classList.add(`${theme}-theme`);
      localStorage.setItem(THEME_KEY, theme);
    });
  }

  toggle(): void {
    this._theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(THEME_KEY) as Theme;
    if (saved) return saved;

    // Detectar preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
}

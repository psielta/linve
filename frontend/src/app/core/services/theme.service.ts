import { Injectable, signal, effect, computed } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _theme = signal<Theme>(this.loadTheme());
  private readonly _systemTheme = signal<ResolvedTheme>(this.getSystemTheme());

  /** Current theme setting (light, dark, or system) */
  readonly theme = this._theme.asReadonly();

  /** Resolved theme (actual light or dark being displayed) */
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const current = this._theme();
    if (current === 'system') {
      return this._systemTheme();
    }
    return current;
  });

  /** Whether the resolved theme is dark */
  readonly isDark = computed(() => this.resolvedTheme() === 'dark');

  /** Whether the resolved theme is light */
  readonly isLight = computed(() => this.resolvedTheme() === 'light');

  constructor() {
    // Apply theme changes to DOM
    effect(() => {
      const resolved = this.resolvedTheme();
      this.applyTheme(resolved);
    });

    // Persist theme changes
    effect(() => {
      const theme = this._theme();
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    });

    // Listen to system theme changes
    this.watchSystemTheme();
  }

  /**
   * Set the theme
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  /**
   * Toggle between light and dark (ignores system)
   */
  toggle(): void {
    const current = this.resolvedTheme();
    this._theme.set(current === 'light' ? 'dark' : 'light');
  }

  /**
   * Cycle through themes: light -> dark -> system -> light
   */
  cycle(): void {
    const current = this._theme();
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(current);
    const nextIndex = (currentIndex + 1) % themes.length;
    this._theme.set(themes[nextIndex]);
  }

  /**
   * Get icon name for current theme
   */
  getIcon(): string {
    const theme = this._theme();
    switch (theme) {
      case 'light':
        return 'fa-sun';
      case 'dark':
        return 'fa-moon';
      case 'system':
        return 'fa-desktop';
      default:
        return 'fa-sun';
    }
  }

  /**
   * Get label for current theme
   */
  getLabel(): string {
    const theme = this._theme();
    switch (theme) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Claro';
    }
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  }

  private getSystemTheme(): ResolvedTheme {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private watchSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handler = (e: MediaQueryListEvent) => {
        this._systemTheme.set(e.matches ? 'dark' : 'light');
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else {
        // Legacy support
        mediaQuery.addListener(handler);
      }
    }
  }

  private applyTheme(theme: ResolvedTheme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);

      // Also update Bootstrap's color-scheme for better compatibility
      document.documentElement.style.colorScheme = theme;
    }
  }
}

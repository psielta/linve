import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'linve-theme';

  /** Signal reativo com estado do dark mode */
  isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    // Aplica tema inicial
    this.applyTheme();

    // Escuta mudanças na preferência do sistema
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Só atualiza se não tiver preferência salva
        if (!localStorage.getItem(this.THEME_KEY)) {
          this.isDarkMode.set(e.matches);
          this.applyTheme();
        }
      });
    }
  }

  /**
   * Obtém tema inicial baseado em:
   * 1. Preferência salva no localStorage
   * 2. Preferência do sistema operacional
   */
  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') return false;

    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved !== null) {
      return saved === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /** Alterna entre dark e light mode */
  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    this.applyTheme();
    this.saveTheme();
  }

  /** Define tema específico */
  setTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
    this.applyTheme();
    this.saveTheme();
  }

  /** Aplica classe de tema no body e html */
  applyTheme(): void {
    if (typeof document === 'undefined') return;

    const isDark = this.isDarkMode();
    // Adiciona classe em ambos para garantir que CSS custom properties penetrem Shadow DOM
    document.body.classList.toggle('dark-mode', isDark);
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  /** Salva preferência no localStorage */
  private saveTheme(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
  }

  /** Remove preferência salva (volta a usar preferência do sistema) */
  resetToSystemPreference(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.THEME_KEY);
    this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme();
  }
}

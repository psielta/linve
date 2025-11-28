import { Injectable, signal, computed } from '@angular/core';

/**
 * Service para gerenciar o estado do sidebar
 * Usa Angular Signals para reatividade
 */
@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly STORAGE_KEY = 'sidebar-collapsed';

  // Estado de collapsed (persistido)
  private _isCollapsed = signal<boolean>(this.loadCollapsedState());

  // Estado de mobile open
  private _isMobileOpen = signal<boolean>(false);

  // IDs dos menus expandidos (NÃO persistido - controlado pela rota ativa)
  private _expandedMenuIds = signal<Set<string>>(new Set());

  constructor() {
    // Limpa chave antiga do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sidebar-expanded-items');
    }
  }

  // Signals públicos readonly
  readonly isCollapsed = this._isCollapsed.asReadonly();
  readonly isMobileOpen = this._isMobileOpen.asReadonly();
  readonly expandedMenuIds = this._expandedMenuIds.asReadonly();

  // Computed para classe CSS
  readonly sidebarClass = computed(() => {
    const classes: string[] = [];
    if (this._isCollapsed()) classes.push('collapsed');
    return classes.join(' ');
  });

  /**
   * Toggle do estado collapsed
   */
  toggle(): void {
    this._isCollapsed.update(v => !v);
    this.saveCollapsedState();
  }

  /**
   * Define estado collapsed
   */
  setCollapsed(collapsed: boolean): void {
    this._isCollapsed.set(collapsed);
    this.saveCollapsedState();
  }

  /**
   * Toggle do sidebar mobile
   */
  toggleMobile(): void {
    this._isMobileOpen.update(v => !v);
  }

  /**
   * Abre sidebar mobile
   */
  openMobile(): void {
    this._isMobileOpen.set(true);
  }

  /**
   * Fecha sidebar mobile
   */
  closeMobile(): void {
    this._isMobileOpen.set(false);
  }

  /**
   * Toggle de um item do menu (expand/collapse submenu)
   */
  toggleMenuItem(itemId: string): void {
    this._expandedMenuIds.update(current => {
      const newSet = new Set(current);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  /**
   * Verifica se um item está expandido
   */
  isMenuItemExpanded(itemId: string): boolean {
    return this._expandedMenuIds().has(itemId);
  }

  /**
   * Expande um item do menu
   */
  expandMenuItem(itemId: string): void {
    this._expandedMenuIds.update(current => {
      const newSet = new Set(current);
      newSet.add(itemId);
      return newSet;
    });
  }

  /**
   * Colapsa um item do menu
   */
  collapseMenuItem(itemId: string): void {
    this._expandedMenuIds.update(current => {
      const newSet = new Set(current);
      newSet.delete(itemId);
      return newSet;
    });
  }

  /**
   * Colapsa todos os itens do menu
   */
  collapseAllMenuItems(): void {
    this._expandedMenuIds.set(new Set());
  }

  // Persistência (apenas para collapsed state)
  private loadCollapsedState(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  private saveCollapsedState(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, String(this._isCollapsed()));
  }
}

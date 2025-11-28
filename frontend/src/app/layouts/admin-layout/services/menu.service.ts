import { Injectable, inject, signal, computed } from '@angular/core';
import { MenuItem } from '../../../core/models/menu-item.model';
import { ADMIN_MENU, filterMenuByRole } from '../config/menu.config';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Service para gerenciar o menu do sidebar
 * Filtra itens baseado no role do usuário
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private authService = inject(AuthService);

  // Menu completo (sem filtro)
  private _items = signal<MenuItem[]>(ADMIN_MENU);

  // Menu filtrado baseado no role do usuário
  readonly filteredItems = computed(() => {
    const role = this.authService.currentRole?.();
    return filterMenuByRole(this._items(), role);
  });

  // Todos os itens (para admin/debug)
  readonly allItems = this._items.asReadonly();

  /**
   * Atualiza o menu (para menus dinâmicos via API)
   */
  setMenu(items: MenuItem[]): void {
    this._items.set(items);
  }

  /**
   * Adiciona um item ao menu
   */
  addItem(item: MenuItem, parentId?: string): void {
    this._items.update(items => {
      if (!parentId) {
        return [...items, item];
      }

      // Adiciona como filho do parent
      return this.addChildItem(items, parentId, item);
    });
  }

  /**
   * Remove um item do menu
   */
  removeItem(itemId: string): void {
    this._items.update(items => this.removeItemById(items, itemId));
  }

  /**
   * Atualiza o badge de um item
   */
  updateBadge(itemId: string, badge: MenuItem['badge'] | null): void {
    this._items.update(items => this.updateItemBadge(items, itemId, badge));
  }

  /**
   * Encontra um item por ID
   */
  findItem(itemId: string): MenuItem | null {
    return this.findItemById(this._items(), itemId);
  }

  // Helpers recursivos
  private addChildItem(items: MenuItem[], parentId: string, newItem: MenuItem): MenuItem[] {
    return items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem]
        };
      }
      if (item.children) {
        return {
          ...item,
          children: this.addChildItem(item.children, parentId, newItem)
        };
      }
      return item;
    });
  }

  private removeItemById(items: MenuItem[], itemId: string): MenuItem[] {
    return items
      .filter(item => item.id !== itemId)
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: this.removeItemById(item.children, itemId)
          };
        }
        return item;
      });
  }

  private updateItemBadge(items: MenuItem[], itemId: string, badge: MenuItem['badge'] | null): MenuItem[] {
    return items.map(item => {
      if (item.id === itemId) {
        return badge ? { ...item, badge } : { ...item, badge: undefined };
      }
      if (item.children) {
        return {
          ...item,
          children: this.updateItemBadge(item.children, itemId, badge)
        };
      }
      return item;
    });
  }

  private findItemById(items: MenuItem[], itemId: string): MenuItem | null {
    for (const item of items) {
      if (item.id === itemId) {
        return item;
      }
      if (item.children) {
        const found = this.findItemById(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }
}

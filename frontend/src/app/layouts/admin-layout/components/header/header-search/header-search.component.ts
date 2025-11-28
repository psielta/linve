import { Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService } from '../../../services/menu.service';
import { MenuItem } from '../../../../../core/models/menu-item.model';

/**
 * Componente de busca global no header
 */
@Component({
  selector: 'app-header-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header-search">
      <div class="search-input-wrapper">
        <i class="fa-solid fa-search search-icon"></i>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Buscar..."
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown.enter)="onEnter()"
          (keydown.escape)="clearSearch()"
          #searchInput />
        <span class="search-shortcut">Ctrl+K</span>
      </div>

      <!-- Dropdown de resultados -->
      @if (showResults() && searchQuery) {
        <div class="header-dropdown search-dropdown show">
          <div class="dropdown-body">
            @if (filteredResults().length === 0) {
              <div class="search-results-empty">
                <i class="fa-solid fa-search text-muted"></i>
                <p class="text-muted mb-0">Nenhum resultado encontrado</p>
              </div>
            } @else {
              <ul class="search-results">
                @for (result of filteredResults(); track result.route) {
                  <li (mousedown)="navigate(result.route)">
                    <div class="result-main">
                      @if (result.icon) { <i [class]="result.icon"></i> }
                      <span class="result-label">{{ result.label }}</span>
                    </div>
                    <small class="text-muted">{{ result.path }}</small>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .header-search {
      position: relative;
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      width: 100%;
      min-width: 350px;
    }

    .search-results-empty {
      padding: 40px 20px;
      text-align: center;

      i {
        font-size: 2rem;
        margin-bottom: 10px;
        display: block;
      }
    }

    .search-results {
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        padding: 10px 12px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s ease;
        display: grid;
        gap: 4px;

        &:hover {
          background: rgba(54, 153, 255, 0.08);
        }

        .result-main {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: var(--text-primary);
        }

        i {
          width: 18px;
          text-align: center;
          color: var(--sidebar-menu-icon-color);
        }
      }
    }
  `]
})
export class HeaderSearchComponent {
  private router = inject(Router);
  private menuService = inject(MenuService);

  searchQuery = '';
  showResults = signal(false);

  // Resultados filtrados (cA!lculo direto para refletir ngModel)
  filteredResults() {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return [];
    const flattened = this.flattenMenu(this.menuService.filteredItems());
    return flattened
      .filter(item => item.label.toLowerCase().includes(query))
      .slice(0, 8);
  }

  /**
   * Atalho Ctrl+K para focar na busca
   */
  @HostListener('document:keydown.control.k', ['$event'])
  onCtrlK(event: Event): void {
    event.preventDefault();
    const input = document.querySelector('.header-search input') as HTMLInputElement;
    input?.focus();
  }

  onFocus(): void {
    this.showResults.set(true);
  }

  onBlur(): void {
    // Delay para permitir clique nos resultados
    setTimeout(() => {
      this.showResults.set(false);
    }, 200);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showResults.set(false);
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    if (value) {
      this.showResults.set(true);
    }
  }

  onEnter(): void {
    const first = this.filteredResults()[0];
    if (first) {
      this.navigate(first.route);
    }
  }

  navigate(route: string): void {
    this.showResults.set(false);
    this.searchQuery = '';
    if (route) {
      this.router.navigateByUrl(route);
    }
  }

  private flattenMenu(items: MenuItem[], parentPath: string[] = []): { label: string; route: string; icon?: string; path: string }[] {
    const result: { label: string; route: string; icon?: string; path: string }[] = [];

    for (const item of items) {
      const currentPath = [...parentPath, item.label];

      if (item.route) {
        result.push({
          label: item.label,
          route: item.route,
          icon: item.icon,
          path: currentPath.join(' / ')
        });
      }

      if (item.children) {
        result.push(...this.flattenMenu(item.children, currentPath));
      }
    }

    return result;
  }
}

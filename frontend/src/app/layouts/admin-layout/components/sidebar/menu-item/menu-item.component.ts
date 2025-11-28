import { Component, OnInit, inject, input, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { MenuItem } from '../../../../../core/models/menu-item.model';

/**
 * Item de menu recursivo para submenus
 * Gerencia seu próprio estado de expansão (não depende de service)
 */
@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (item().children && item().children!.length > 0) {
      <!-- Item COM submenu -->
      <li class="menu-item has-children"
          [class.open]="expanded"
          [class.active]="isActive()"
          (mouseenter)="onMouseEnter()"
          (mouseleave)="onMouseLeave()">

        <a class="menu-link" (click)="toggleExpanded($event)">
          @if (item().icon) {
            <span class="menu-icon">
              <i [class]="item().icon"></i>
            </span>
          }
          <span class="menu-text">{{ item().label }}</span>
          <span class="menu-arrow">
            <i class="fa-solid fa-angle-right"></i>
          </span>
        </a>

        <!-- Submenu normal (quando sidebar não colapsada) -->
        @if (!isCollapsed()) {
          <ul class="submenu" [@slideUpDown]="expanded ? 'open' : 'closed'">
            @for (child of item().children; track child.id) {
              <app-menu-item
                [item]="child"
                [depth]="depth() + 1"
                [isCollapsed]="isCollapsed()" />
            }
          </ul>
        }

        <!-- Popover submenu (quando sidebar colapsada) -->
        @if (isCollapsed() && showPopover()) {
          <div class="menu-popover" [@fadeIn]>
            <div class="popover-header">{{ item().label }}</div>
            <ul class="popover-menu">
              @for (child of item().children; track child.id) {
                <li>
                  <a [routerLink]="child.route"
                     routerLinkActive="active"
                     (click)="hidePopover()">
                    @if (child.icon) {
                      <i [class]="child.icon"></i>
                    }
                    <span>{{ child.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </li>
    } @else {
      <!-- Item SEM submenu -->
      <li class="menu-item" [class.active]="isActive()">
        <a class="menu-link"
           [routerLink]="item().route"
           routerLinkActive="active-link"
           [routerLinkActiveOptions]="{ exact: item().route === '/dashboard' }">
          @if (item().icon) {
            <span class="menu-icon">
              <i [class]="item().icon"></i>
            </span>
          }
          <span class="menu-text">{{ item().label }}</span>
          @if (item().badge && !isCollapsed()) {
            <span class="menu-badge badge badge-light-{{ item().badge!.color }}">
              {{ item().badge!.text }}
            </span>
          }
        </a>
      </li>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .menu-popover {
      position: absolute;
      left: 100%;
      transform: translateX(8px);
      top: 0;
      min-width: 200px;
      background: var(--sidebar-bg);
      border: 1px solid var(--sidebar-border-color);
      backdrop-filter: blur(8px);
      border-radius: 8px;
      box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      overflow: hidden;

      .popover-header {
        padding: 12px 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--sidebar-menu-icon-color);
        border-bottom: 1px solid var(--sidebar-border-color);
      }

      .popover-menu {
        list-style: none;
        margin: 0;
        padding: 8px 0;

        li a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          color: var(--sidebar-menu-link-color);
          text-decoration: none;
          font-size: 13px;
          transition: all 0.2s ease;

          &:hover {
            color: var(--sidebar-menu-link-hover-color);
            background: rgba(255, 255, 255, 0.05);
          }

          &.active {
            color: var(--sidebar-menu-active-color);
            background: var(--sidebar-menu-active-bg);
          }

          i {
            width: 18px;
            text-align: center;
            font-size: 14px;
          }
        }
      }
    }
  `],
  animations: [
    trigger('slideUpDown', [
      state('closed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        opacity: 1
      })),
      transition('closed <=> open', [
        animate('250ms ease-in-out')
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'translateX(-10px)' }))
      ])
    ])
  ]
})
export class MenuItemComponent implements OnInit {
  item = input.required<MenuItem>();
  depth = input<number>(0);
  isCollapsed = input<boolean>(false);

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Estado local - propriedade simples, não signal
  expanded = false;

  // Estado do popover (para modo colapsado)
  showPopover = signal(false);
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Verifica se o item atual ou algum filho está ativo
   */
  isActive(): boolean {
    const currentUrl = this.router.url;
    const itemRoute = this.item().route;

    // Se tem rota direta, verifica se está ativa
    if (itemRoute) {
      if (itemRoute === '/dashboard') {
        return currentUrl === itemRoute || currentUrl === '/';
      }
      return currentUrl.startsWith(itemRoute);
    }

    // Se tem filhos, verifica se algum filho está ativo
    const children = this.item().children;
    if (children && children.length > 0) {
      return this.isAnyChildActive(children);
    }

    return false;
  }

  /**
   * Verifica recursivamente se algum filho está ativo
   */
  private isAnyChildActive(children: MenuItem[]): boolean {
    const currentUrl = this.router.url;
    for (const child of children) {
      if (child.route && currentUrl.startsWith(child.route)) {
        return true;
      }
      if (child.children && this.isAnyChildActive(child.children)) {
        return true;
      }
    }
    return false;
  }

  // Toggle do submenu
  toggleExpanded(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Navega para rota principal do grupo, se existir
    const route = this.item().route;
    if (route) {
      this.router.navigateByUrl(route);
    }

    // Em modo colapsado, exibe popover ao clicar
    if (this.isCollapsed()) {
      this.showPopover.update(open => !open);
      return;
    }

    this.expanded = !this.expanded;
  }

  // Mouse enter - mostra popover quando colapsado
  onMouseEnter(): void {
    const children = this.item().children;
    if (this.isCollapsed() && children && children.length > 0) {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.showPopover.set(true);
    }
  }

  // Mouse leave - esconde popover
  onMouseLeave(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.hoverTimeout = setTimeout(() => {
      this.showPopover.set(false);
    }, 100);
  }

  // Esconde o popover
  hidePopover(): void {
    this.showPopover.set(false);
  }

  ngOnInit(): void {
    // Abre automaticamente grupos que contém a rota ativa
    this.syncExpandedWithRoute();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.syncExpandedWithRoute());
  }

  private syncExpandedWithRoute(): void {
    const children = this.item().children;
    if (children && this.isAnyChildActive(children)) {
      this.expanded = true;
    }
  }
}

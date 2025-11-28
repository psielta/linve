import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../../../core/models/menu-item.model';

/**
 * Service para gerenciar breadcrumbs automáticos
 * Baseado em route.data['breadcrumb']
 */
@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // Breadcrumbs atuais
  private _breadcrumbs = signal<Breadcrumb[]>([]);

  // Título da página atual
  private _pageTitle = signal<string>('');

  // Signals públicos readonly
  readonly breadcrumbs = this._breadcrumbs.asReadonly();
  readonly pageTitle = this._pageTitle.asReadonly();

  constructor() {
    // Escuta mudanças de rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
      });
  }

  /**
   * Constrói breadcrumbs a partir das rotas
   */
  private buildBreadcrumbs(): void {
    const breadcrumbs: Breadcrumb[] = [];
    let currentRoute: ActivatedRoute = this.activatedRoute.root;
    let url = '';

    while (currentRoute.children.length > 0) {
      const childRoute: ActivatedRoute = currentRoute.children[0];
      const snapshot = childRoute.snapshot;
      const routeConfig = snapshot?.routeConfig;

      if (routeConfig?.path) {
        // Constrói URL
        const path = routeConfig.path
          .split('/')
          .map(segment => {
            if (segment.startsWith(':')) {
              const paramName = segment.substring(1);
              return snapshot.params[paramName] || segment;
            }
            return segment;
          })
          .join('/');

        if (path) {
          url += `/${path}`;
        }

        // Verifica se tem breadcrumb definido
        const breadcrumbLabel = snapshot.data?.['breadcrumb'];

        if (breadcrumbLabel) {
          breadcrumbs.push({
            label: this.resolveBreadcrumbLabel(breadcrumbLabel, childRoute),
            route: url
          });
        }
      }

      currentRoute = childRoute;
    }

    // Remove a rota do último item (página atual não é clicável)
    if (breadcrumbs.length > 0) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      this._pageTitle.set(lastBreadcrumb.label);

      // Remove route do último item
      breadcrumbs[breadcrumbs.length - 1] = {
        ...lastBreadcrumb,
        route: undefined
      };
    } else {
      this._pageTitle.set('');
    }

    this._breadcrumbs.set(breadcrumbs);
  }

  /**
   * Resolve o label do breadcrumb
   * Suporta strings simples ou funções que recebem os params
   */
  private resolveBreadcrumbLabel(
    label: string | ((data: Record<string, unknown>) => string),
    route: ActivatedRoute
  ): string {
    if (typeof label === 'function') {
      return label({
        ...route.snapshot.params,
        ...route.snapshot.data
      });
    }
    return label;
  }

  /**
   * Define breadcrumbs manualmente
   * Útil para casos especiais onde a rota não define
   */
  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this._breadcrumbs.set(breadcrumbs);
    if (breadcrumbs.length > 0) {
      this._pageTitle.set(breadcrumbs[breadcrumbs.length - 1].label);
    }
  }

  /**
   * Define título da página manualmente
   */
  setPageTitle(title: string): void {
    this._pageTitle.set(title);
  }

  /**
   * Adiciona um breadcrumb ao final
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this._breadcrumbs.update(current => [...current, breadcrumb]);
    this._pageTitle.set(breadcrumb.label);
  }
}

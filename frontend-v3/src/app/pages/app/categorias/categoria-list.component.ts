import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import {
  BrButton,
  BrCard,
  BrInput,
  BrLoading,
  BrMessage,
  BrPagination,
  BrSelect,
  BrTable,
  BrTableCell,
  BrTableHeaderCell,
  BrTableHeaderRow,
  BrTableRow,
  BrTag,
} from '@govbr-ds/webcomponents-angular/standalone';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { listar3 } from '../../../core/api/fn/categorias-de-produtos/listar-3';
import { excluir3 } from '../../../core/api/fn/categorias-de-produtos/excluir-3';
import { listar6 } from '../../../core/api/fn/culinarias/listar-6';
import { CategoriaOutput } from '../../../core/api/models/categoria-output';
import { CulinariaOutput } from '../../../core/api/models/culinaria-output';
import { TenantService } from '../../../core/services/tenant.service';

interface FilterOption {
  label: string;
  value: number | null;
}

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BrButton,
    BrCard,
    BrInput,
    BrLoading,
    BrMessage,
    BrPagination,
    BrSelect,
    BrTable,
    BrTableCell,
    BrTableHeaderCell,
    BrTableHeaderRow,
    BrTableRow,
    BrTag,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.scss',
})
export class CategoriaListComponent implements OnInit {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  categorias = signal<CategoriaOutput[]>([]);
  culinarias = signal<CulinariaOutput[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);
  feedback = signal<string | null>(null);

  searchTerm = signal('');
  selectedCulinaria = signal<number | null>(null);

  currentPage = signal(1);
  perPage = signal(10);

  private lastOrgId: number | null = null;

  constructor() {
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.lastOrgId) {
        this.lastOrgId = orgId;
        this.loadCulinarias();
        this.loadCategorias();
      }
    });
  }

  ngOnInit(): void {
    // initial load handled by effect above when organization is available
  }

  filterOptions = computed<FilterOption[]>(() => [
    { label: 'Todas as culinarias', value: null },
    ...this.culinarias().map((c) => ({
      label: c.nome ?? `Culinaria #${c.id}`,
      value: c.id ?? null,
    })),
  ]);

  filteredCategorias = computed(() => {
    let result = this.categorias();

    const culinaria = this.selectedCulinaria();
    if (culinaria !== null) {
      result = result.filter((c) => c.id_culinaria === culinaria);
    }

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(search) ||
          (c.descricao ?? '').toLowerCase().includes(search) ||
          this.culinariaNome(c.id_culinaria).toLowerCase().includes(search)
      );
    }

    return result;
  });

  totalItems = computed(() => this.filteredCategorias().length);

  totalPages = computed(() =>
    this.perPage() > 0 ? Math.ceil(this.totalItems() / this.perPage()) : 0
  );

  paginatedCategorias = computed(() => {
    const items = this.filteredCategorias();
    const page = this.currentPage();
    const size = this.perPage();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  loadCulinarias(): void {
    listar6(this.http, this.apiConfig.rootUrl).subscribe({
      next: (response) => {
        this.culinarias.set(response.body ?? []);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar as culinarias.');
      },
    });
  }

  loadCategorias(): void {
    this.loading.set(true);
    this.error.set(null);

    listar3(this.http, this.apiConfig.rootUrl).subscribe({
      next: (response) => {
        this.categorias.set(response.body ?? []);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar as categorias.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(event: CustomEvent): void {
    this.searchTerm.set(event.detail ?? '');
    this.currentPage.set(1);
  }

  onFilterChange(event: CustomEvent): void {
    const raw = event.detail;
    const value =
      raw === null || raw === 'null' || raw === ''
        ? null
        : Number(raw);
    this.selectedCulinaria.set(Number.isNaN(value) ? null : value);
    this.currentPage.set(1);
  }

  onPageChange(event: CustomEvent<{ page: number }>): void {
    this.currentPage.set(event.detail.page);
  }

  onPerPageChange(event: CustomEvent<{ perPage: number }>): void {
    this.perPage.set(event.detail.perPage);
    this.currentPage.set(1);
  }

  goToNew(): void {
    this.router.navigate(['/app/categorias/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/categorias/${id}`]);
  }

  confirmarExcluir(cat: CategoriaOutput): void {
    const ok = confirm(`Desativar a categoria "${cat.nome}"?`);
    if (!ok) return;
    this.excluir(cat.id_categoria);
  }

  excluir(id: number): void {
    excluir3(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: () => {
        this.feedback.set('Categoria desativada com sucesso.');
        this.loadCategorias();
      },
      error: () => {
        this.error.set('Nao foi possivel desativar a categoria.');
      },
    });
  }

  dismissError(): void {
    this.error.set(null);
  }

  dismissFeedback(): void {
    this.feedback.set(null);
  }

  culinariaNome(id: number): string {
    const found = this.culinarias().find((c) => c.id === id);
    return found?.nome ?? `Culinaria #${id}`;
  }

  diasAtivos(cat: CategoriaOutput): string[] {
    const d = cat.disponivel || {};
    const map: Record<string, string> = {
      domingo: 'Dom',
      segunda: 'Seg',
      terca: 'Ter',
      quarta: 'Qua',
      quinta: 'Qui',
      sexta: 'Sex',
      sabado: 'Sab',
    };
    return Object.entries(map)
      .filter(([k]) => (d as any)[k])
      .map(([, v]) => v);
  }

  statusColor(cat: CategoriaOutput): string {
    return cat.ativo ? 'green-vivid-50' : 'red-vivid-60';
  }

  opcoesLabel(cat: CategoriaOutput): string {
    const total = cat.opcoes?.length ?? 0;
    return `${total} opcao${total === 1 ? '' : 'es'}`;
  }

  trackByCat(_: number, item: CategoriaOutput): number {
    return item.id_categoria ?? _;
  }
}

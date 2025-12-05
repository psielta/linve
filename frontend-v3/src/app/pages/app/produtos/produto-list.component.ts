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
import { listar1 } from '../../../core/api/fn/produtos/listar-1';
import { excluir1 } from '../../../core/api/fn/produtos/excluir-1';
import { listar3 } from '../../../core/api/fn/categorias-de-produtos/listar-3';
import { ProdutoOutput } from '../../../core/api/models/produto-output';
import { CategoriaOutput } from '../../../core/api/models/categoria-output';
import { TenantService } from '../../../core/services/tenant.service';

interface FilterOption {
  label: string;
  value: number | null;
}

@Component({
  selector: 'app-produto-list',
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
  templateUrl: './produto-list.component.html',
  styleUrl: './produto-list.component.scss',
})
export class ProdutoListComponent implements OnInit {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  produtos = signal<ProdutoOutput[]>([]);
  categorias = signal<CategoriaOutput[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);
  feedback = signal<string | null>(null);

  searchTerm = signal('');
  selectedCategoria = signal<number | null>(null);

  currentPage = signal(1);
  perPage = signal(10);

  private lastOrgId: number | null = null;

  constructor() {
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.lastOrgId) {
        this.lastOrgId = orgId;
        this.loadCategorias();
        this.loadProdutos();
      }
    });
  }

  ngOnInit(): void {
    // carregamento inicial via effect
  }

  filterOptions = computed<FilterOption[]>(() => [
    { label: 'Todas as categorias', value: null },
    ...this.categorias().map((c) => ({
      label: c.nome ?? `Categoria #${c.id_categoria}`,
      value: c.id_categoria ?? null,
    })),
  ]);

  filteredProdutos = computed(() => {
    let result = this.produtos();
    const cat = this.selectedCategoria();
    if (cat !== null) {
      result = result.filter((p) => p.id_categoria === cat);
    }
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(search) ||
          (p.descricao ?? '').toLowerCase().includes(search) ||
          this.categoriaNome(p.id_categoria).toLowerCase().includes(search)
      );
    }
    return result;
  });

  totalItems = computed(() => this.filteredProdutos().length);
  totalPages = computed(() =>
    this.perPage() > 0 ? Math.ceil(this.totalItems() / this.perPage()) : 0
  );

  paginatedProdutos = computed(() => {
    const items = this.filteredProdutos();
    const page = this.currentPage();
    const size = this.perPage();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  loadCategorias(): void {
    listar3(this.http, this.apiConfig.rootUrl).subscribe({
      next: (response) => this.categorias.set(response.body ?? []),
      error: () => (this.error.set('Nao foi possivel carregar as categorias.'), this.loading.set(false)),
    });
  }

  loadProdutos(): void {
    this.loading.set(true);
    this.error.set(null);

    listar1(this.http, this.apiConfig.rootUrl).subscribe({
      next: (response) => {
        this.produtos.set(response.body ?? []);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os produtos.');
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
    this.selectedCategoria.set(Number.isNaN(value) ? null : value);
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
    this.router.navigate(['/app/produtos/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/produtos/${id}`]);
  }

  confirmarExcluir(prod: ProdutoOutput): void {
    const ok = confirm(`Desativar o produto "${prod.nome}"?`);
    if (!ok) return;
    this.excluir(prod.id_produto);
  }

  excluir(id: number): void {
    excluir1(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: () => {
        this.feedback.set('Produto desativado com sucesso.');
        this.loadProdutos();
      },
      error: () => this.error.set('Nao foi possivel desativar o produto.'),
    });
  }

  dismissError(): void {
    this.error.set(null);
  }

  dismissFeedback(): void {
    this.feedback.set(null);
  }

  categoriaNome(id: number): string {
    const found = this.categorias().find((c) => c.id_categoria === id);
    return found?.nome ?? `Categoria #${id}`;
  }

  statusColor(prod: ProdutoOutput): string {
    return prod.status ? 'green-vivid-50' : 'red-vivid-60';
  }

  precoLabel(p: { nome?: string; valor?: number }): string {
    const nome = p.nome ?? '';
    const valor = p.valor ?? 0;
    const format = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    return nome ? `${nome} • ${format}` : format;
  }

  trackByProd(_: number, item: ProdutoOutput): number {
    return item.id_produto ?? _;
  }
}

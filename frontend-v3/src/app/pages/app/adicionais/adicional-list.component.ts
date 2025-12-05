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
import { listar5 } from '../../../core/api/fn/adicionais/listar-5';
import { excluir4 } from '../../../core/api/fn/adicionais/excluir-4';
import { listar3 } from '../../../core/api/fn/categorias-de-produtos/listar-3';
import { AdicionalOutput } from '../../../core/api/models/adicional-output';
import { CategoriaOutput } from '../../../core/api/models/categoria-output';
import { TenantService } from '../../../core/services/tenant.service';

interface FilterOption {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-adicional-list',
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
  templateUrl: './adicional-list.component.html',
  styleUrls: ['./adicional-list.component.scss'],
})
export class AdicionalListComponent implements OnInit {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  adicionais = signal<AdicionalOutput[]>([]);
  categorias = signal<CategoriaOutput[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);
  feedback = signal<string | null>(null);

  searchTerm = signal('');
  selectedCategoria = signal<string>('');

  currentPage = signal(1);
  perPage = signal(10);

  private lastOrgId: number | null = null;

  constructor() {
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.lastOrgId) {
        this.lastOrgId = orgId;
        this.loadCategorias();
        this.loadAdicionais();
      }
    });
  }

  ngOnInit(): void {}

  categoriaOptions = computed<FilterOption[]>(() => [
    { label: 'Todas as categorias', value: '' },
    ...this.categorias().map((c) => ({
      label: c.nome ?? `Categoria #${c.id_categoria}`,
      value: c.id_categoria != null ? String(c.id_categoria) : '',
    })),
  ]);

  filteredAdicionais = computed(() => {
    let result = this.adicionais();
    const cat = this.selectedCategoria();
    if (cat) {
      const num = Number(cat);
      result = result.filter((a) => a.id_categoria === num);
    }
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (a) =>
          (a.nome ?? '').toLowerCase().includes(search) ||
          this.categoriaNome(a.id_categoria!).toLowerCase().includes(search) ||
          this.selecaoLabel(a.selecao).toLowerCase().includes(search)
      );
    }
    return result;
  });

  totalItems = computed(() => this.filteredAdicionais().length);
  totalPages = computed(() =>
    this.perPage() > 0 ? Math.ceil(this.totalItems() / this.perPage()) : 0
  );

  paginatedAdicionais = computed(() => {
    const items = this.filteredAdicionais();
    const page = this.currentPage();
    const size = this.perPage();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  loadCategorias(): void {
    listar3(this.http, this.apiConfig.rootUrl).subscribe({
      next: (resp) => this.categorias.set(resp.body ?? []),
      error: () => this.error.set('Nao foi possivel carregar categorias.'),
    });
  }

  loadAdicionais(): void {
    this.loading.set(true);
    this.error.set(null);

    listar5(this.http, this.apiConfig.rootUrl).subscribe({
      next: (resp) => {
        const body = resp.body;
        const list = Array.isArray(body) ? body : body ? [body] : [];
        this.adicionais.set(list);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os adicionais.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(event: CustomEvent): void {
    this.searchTerm.set(event.detail ?? '');
    this.currentPage.set(1);
  }

  onCategoriaChange(event: CustomEvent): void {
    const value = event.detail ?? '';
    this.selectedCategoria.set(value);
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
    this.router.navigate(['/app/adicionais/new']);
  }

  goToEdit(id: number | undefined): void {
    if (id == null) return;
    this.router.navigate([`/app/adicionais/${id}`]);
  }

  confirmarExcluir(adicional: AdicionalOutput): void {
    const ok = confirm(`Desativar o adicional "${adicional.nome}"?`);
    if (!ok || adicional.id_adicional == null) return;
    this.excluir(adicional.id_adicional);
  }

  excluir(id: number): void {
    excluir4(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: () => {
        this.feedback.set('Adicional desativado com sucesso.');
        this.loadAdicionais();
      },
      error: () => this.error.set('Nao foi possivel desativar o adicional.'),
    });
  }

  dismissError(): void {
    this.error.set(null);
  }

  dismissFeedback(): void {
    this.feedback.set(null);
  }

  categoriaNome(id: number | undefined): string {
    if (id == null) return '—';
    const found = this.categorias().find((c) => c.id_categoria === id);
    return found?.nome ?? `Categoria #${id}`;
  }

  selecaoLabel(selecao: string | null | undefined): string {
    switch (selecao) {
      case 'U':
        return 'Única';
      case 'M':
        return 'Múltipla';
      case 'Q':
        return 'Qtd. múltipla';
      default:
        return selecao || '';
    }
  }

  regrasLabel(a: AdicionalOutput): string {
    if (a.selecao === 'Q') {
      const min = a.minimo ?? 0;
      const lim = a.limite ?? 0;
      return `Mín ${min} • Máx ${lim}`;
    }
    if (a.selecao === 'M') {
      return a.limite ? `Até ${a.limite}` : 'Sem limite';
    }
    return 'Obrigatório 1';
  }

  opcoesLabel(a: AdicionalOutput): string {
    const total = a.opcoes?.length ?? 0;
    return total === 0 ? 'Sem opções' : `${total} opção${total > 1 ? 's' : ''}`;
  }

  precoLabel(valor?: number): string {
    const price = valor ?? 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }

  trackByAdicional(_: number, item: AdicionalOutput): number | undefined {
    return item.id_adicional ?? _;
  }
}

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
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
import { listar6 } from '../../../core/api/fn/culinarias/listar-6';
import { CulinariaOutput } from '../../../core/api/models/culinaria-output';

interface FilterOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-culinaria-list',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './culinaria-list.component.html',
  styleUrl: './culinaria-list.component.scss',
})
export class CulinariaListComponent implements OnInit {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);

  // Estado
  culinarias = signal<CulinariaOutput[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Paginação
  currentPage = signal(1);
  perPage = signal(10);

  // Filtros
  selectedFilter = signal<boolean | null>(null);
  searchTerm = signal('');

  // Opções do filtro
  filterOptions: FilterOption[] = [
    { label: 'Todas', value: null },
    { label: 'Aceita Meio a Meio', value: true },
    { label: 'Não Aceita Meio a Meio', value: false },
  ];

  // Computed: culinárias filtradas por busca
  filteredCulinarias = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const items = this.culinarias();
    if (!search) return items;
    return items.filter((c) => c.nome?.toLowerCase().includes(search));
  });

  // Computed: total de itens após filtro de busca
  totalItems = computed(() => this.filteredCulinarias().length);

  // Computed: total de páginas
  totalPages = computed(() => Math.ceil(this.totalItems() / this.perPage()));

  // Computed: itens da página atual
  paginatedCulinarias = computed(() => {
    const filtered = this.filteredCulinarias();
    const page = this.currentPage();
    const size = this.perPage();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  ngOnInit(): void {
    this.loadCulinarias();
  }

  loadCulinarias(): void {
    this.loading.set(true);
    this.error.set(null);

    const meioMeio = this.selectedFilter();
    const params = meioMeio !== null ? { meioMeio } : undefined;

    listar6(this.http, this.apiConfig.rootUrl, params).subscribe({
      next: (response) => {
        this.culinarias.set(response.body ?? []);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar culinárias:', err);
        this.error.set('Erro ao carregar culinárias. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(event: CustomEvent): void {
    const value = event.detail;
    this.selectedFilter.set(value === 'null' ? null : value === 'true');
    this.loadCulinarias();
  }

  onSearchChange(event: CustomEvent): void {
    this.searchTerm.set(event.detail ?? '');
    this.currentPage.set(1);
  }

  onPageChange(event: CustomEvent<{ page: number }>): void {
    this.currentPage.set(event.detail.page);
  }

  onPerPageChange(event: CustomEvent<{ perPage: number }>): void {
    this.perPage.set(event.detail.perPage);
    this.currentPage.set(1);
  }

  dismissError(): void {
    this.error.set(null);
  }

  trackByCulinaria(_: number, item: CulinariaOutput): number {
    return item.id ?? _;
  }
}

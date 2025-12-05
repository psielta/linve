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
  BrTable,
  BrTableCell,
  BrTableHeaderCell,
  BrTableHeaderRow,
  BrTableRow,
} from '@govbr-ds/webcomponents-angular/standalone';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { listar2 } from '../../../core/api/fn/clientes/listar-2';
import { excluir2 } from '../../../core/api/fn/clientes/excluir-2';
import { ClienteOutput } from '../../../core/api/models/cliente-output';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-cliente-list',
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
    BrTable,
    BrTableCell,
    BrTableHeaderCell,
    BrTableHeaderRow,
    BrTableRow,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.scss'],
})
export class ClienteListComponent implements OnInit {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  clientes = signal<ClienteOutput[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  feedback = signal<string | null>(null);

  searchTerm = signal('');
  currentPage = signal(1);
  perPage = signal(10);

  private lastOrgId: number | null = null;

  constructor() {
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.lastOrgId) {
        this.lastOrgId = orgId;
        this.loadClientes();
      }
    });
  }

  ngOnInit(): void {}

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.clientes();
    return this.clientes().filter((c) => {
      const doc = c.documento ?? '';
      const t1 = c.tel_1 ?? '';
      const city = c.enderecos?.[0]?.rua ?? '';
      return (
        c.nome.toLowerCase().includes(term) ||
        doc.toLowerCase().includes(term) ||
        t1.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term)
      );
    });
  });

  totalItems = computed(() => this.filtered().length);
  totalPages = computed(() =>
    this.perPage() > 0 ? Math.ceil(this.totalItems() / this.perPage()) : 0
  );

  paginated = computed(() => {
    const items = this.filtered();
    const page = this.currentPage();
    const size = this.perPage();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  loadClientes(): void {
    this.loading.set(true);
    this.error.set(null);
    listar2(this.http, this.apiConfig.rootUrl).subscribe({
      next: (resp) => {
        const body = resp.body;
        const list = Array.isArray(body) ? body : body ? [body] : [];
        this.clientes.set(list);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os clientes.');
        this.loading.set(false);
      },
    });
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

  goToNew(): void {
    this.router.navigate(['/app/clientes/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/clientes/${id}`]);
  }

  confirmarExcluir(cliente: ClienteOutput): void {
    const ok = confirm(`Desativar o cliente "${cliente.nome}"?`);
    if (!ok) return;
    this.excluir(cliente.id);
  }

  excluir(id: number): void {
    excluir2(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: () => {
        this.feedback.set('Cliente desativado com sucesso.');
        this.loadClientes();
      },
      error: () => this.error.set('Não foi possível desativar o cliente.'),
    });
  }

  formatDoc(doc?: string): string {
    if (!doc) return '-';
    const num = doc.replace(/\D/g, '');
    if (num.length === 11) return num.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (num.length === 14) return num.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return doc;
  }

  formatTel(t?: string): string {
    if (!t) return '-';
    const num = t.replace(/\D/g, '');
    if (num.length === 11) return num.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (num.length === 10) return num.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return t;
  }

  firstCity(cliente: ClienteOutput): string {
    const end = cliente.enderecos?.[0];
    if (!end) return 'Sem endereço';
    return end.bairro ? `${end.rua ?? ''} - ${end.bairro}` : end.rua ?? 'Sem endereço';
  }

  trackByCliente(_: number, item: ClienteOutput): number {
    return item.id ?? _;
  }
}

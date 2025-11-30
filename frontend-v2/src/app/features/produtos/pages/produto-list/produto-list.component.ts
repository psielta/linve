import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProdutoOutput } from '../../../../core/api/models/produto-output';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { CategoriaOutput } from '../../../../core/api/models/categoria-output';
import { TenantService } from '../../../../core/services/tenant.service';

interface FilterOption {
  label: string;
  value: number | null;
}

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    SkeletonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="card">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Gestao de cardapio</p>
          <h2 class="text-2xl font-bold m-0">Produtos</h2>
          <p class="text-surface-500 mt-1 mb-0">Cadastre produtos e vincule precos por opcao de categoria.</p>
        </div>

        <div class="flex gap-2">
          <p-button label="Recarregar" icon="pi pi-refresh" [text]="true" (onClick)="load()" [loading]="loading()" />
          <p-button label="Novo Produto" icon="pi pi-plus" (onClick)="goToNew()" />
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1">
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              [(ngModel)]="searchTerm"
              (input)="aplicarFiltros()"
              placeholder="Pesquisar por nome, descricao..."
              class="w-full"
            />
          </p-iconfield>
        </div>

        <div class="w-full md:w-72">
          <p-select
            [options]="categoriaOptions()"
            [(ngModel)]="selectedCategoria"
            (ngModelChange)="aplicarFiltros()"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas as categorias"
            [showClear]="true"
            styleClass="w-full"
          />
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col gap-3">
          @for (i of [1,2,3,4]; track i) {
            <p-skeleton height="4rem" borderRadius="12px" />
          }
        </div>
      } @else {
        <p-table
          #dt
          [value]="produtosFiltrados()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5,10,25,50]"
          [tableStyle]="{ 'min-width': '65rem' }"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} produtos"
          dataKey="id_produto"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="nome" style="width: 28%">
                <div class="flex items-center gap-2">
                  Produto
                  <p-sortIcon field="nome" />
                </div>
              </th>
              <th style="width: 18%">Categoria</th>
              <th style="width: 20%">Opcoes / Precos</th>
              <th style="width: 10%">Status</th>
              <th style="width: 8%">Acoes</th>
            </tr>
          </ng-template>
          <ng-template #body let-prod>
            <tr>
              <td>
                <div class="font-semibold text-lg">{{ prod.nome }}</div>
                <div class="text-sm text-surface-500 truncate max-w-xs" [title]="prod.descricao">
                  {{ prod.descricao || 'Sem descricao' }}
                </div>
              </td>
              <td>
                <p-tag
                  [value]="categoriaNome(prod.id_categoria)"
                  severity="info"
                  icon="pi pi-sitemap"
                />
              </td>
              <td class="text-sm">
                <div class="flex flex-wrap gap-1">
                  @if ((prod.opcoes?.length || 0) === 0) {
                    <p-tag value="Sem precos" severity="danger" />
                  } @else {
                    @for (p of prod.opcoes; track p.id_preco) {
                      <p-tag
                        [value]="p.nome ? p.nome + ' • ' + (p.valor | currency:'BRL':'symbol-narrow') : (p.valor || 0)"
                        [severity]="p.status ? 'success' : 'secondary'"
                        styleClass="text-xs"
                        [pTooltip]="p.nome"
                        tooltipPosition="bottom"
                      />
                    }
                  }
                </div>
              </td>
              <td>
                <p-tag
                  [value]="prod.status ? 'Ativo' : 'Inativo'"
                  [severity]="prod.status ? 'success' : 'danger'"
                />
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    pTooltip="Editar"
                    tooltipPosition="top"
                    (onClick)="goToEdit(prod.id_produto)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Excluir"
                    tooltipPosition="top"
                    (onClick)="confirmDelete(prod)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="5">
                <div class="flex flex-col items-center justify-center py-16 px-4">
                  <div class="relative mb-6">
                    <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                      @if (searchTerm || selectedCategoria) {
                        <i class="pi pi-search text-5xl text-primary/60"></i>
                      } @else {
                        <i class="pi pi-box text-5xl text-primary/60"></i>
                      }
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center border border-surface-200 dark:border-surface-600">
                      @if (searchTerm || selectedCategoria) {
                        <i class="pi pi-times text-surface-400 text-sm"></i>
                      } @else {
                        <i class="pi pi-plus text-primary text-sm"></i>
                      }
                    </div>
                  </div>

                  <h3 class="text-xl font-semibold text-surface-700 dark:text-surface-200 mb-2">
                    @if (searchTerm || selectedCategoria) {
                      Nenhum resultado encontrado
                    } @else {
                      Nenhum produto cadastrado
                    }
                  </h3>

                  <p class="text-surface-500 text-center max-w-md mb-6">
                    @if (searchTerm || selectedCategoria) {
                      Ajuste os filtros ou limpe a busca para ver outros resultados.
                    } @else {
                      Cadastre produtos e atribua precos por opcao para montar seu cardapio.
                    }
                  </p>

                  <div class="flex gap-3">
                    @if (searchTerm || selectedCategoria) {
                      <p-button
                        label="Limpar filtros"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="resetFiltros()"
                      />
                    } @else {
                      <p-button
                        label="Criar primeiro produto"
                        icon="pi pi-plus"
                        (onClick)="goToNew()"
                      />
                    }
                  </div>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
  `
})
export class ProdutoListComponent implements OnInit {
  private tenantService = inject(TenantService);

  @ViewChild('dt') table!: Table;

  produtos = signal<ProdutoOutput[]>([]);
  produtosFiltrados = signal<ProdutoOutput[]>([]);
  categorias = signal<CategoriaOutput[]>([]);
  categoriaOptions = signal<FilterOption[]>([]);
  loading = signal(true);

  searchTerm = '';
  selectedCategoria: number | null = null;

  private currentOrgId: number | null = null;

  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.currentOrgId) {
        this.currentOrgId = orgId;
        this.load();
        this.loadCategorias();
      }
    });
  }

  ngOnInit(): void {
    // carregamento inicial via effect
  }

  load(): void {
    this.loading.set(true);
    this.produtoService.listar().subscribe({
      next: (data) => {
        this.produtos.set(data);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel carregar os produtos'
        });
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.categoriaOptions.set(
          data.map((c) => ({ label: c.nome || `Categoria #${c.id_categoria}`, value: c.id_categoria }))
        );
      },
      error: () =>
        this.messageService.add({
          severity: 'warn',
          summary: 'Atencao',
          detail: 'Nao foi possivel carregar as categorias'
        })
    });
  }

  aplicarFiltros(): void {
    let resultado = this.produtos();

    if (this.selectedCategoria !== null) {
      resultado = resultado.filter((p) => p.id_categoria === this.selectedCategoria);
    }

    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(
        (p) =>
          p.nome?.toLowerCase().includes(termo) ||
          p.descricao?.toLowerCase().includes(termo) ||
          this.categoriaNome(p.id_categoria).toLowerCase().includes(termo)
      );
    }

    this.produtosFiltrados.set(resultado);
  }

  resetFiltros(): void {
    this.searchTerm = '';
    this.selectedCategoria = null;
    this.aplicarFiltros();
  }

  categoriaNome(id: number): string {
    const found = this.categorias().find((c) => c.id_categoria === id);
    return found?.nome ?? `Categoria #${id}`;
  }

  goToNew(): void {
    this.router.navigate(['/app/produtos/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/produtos/${id}`]);
  }

  confirmDelete(prod: ProdutoOutput): void {
    this.confirmationService.confirm({
      header: 'Confirmacao',
      message: `Desativar o produto "${prod.nome}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluir(prod.id_produto)
    });
  }

  excluir(id: number): void {
    this.produtoService.excluir(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Produto desativado',
          detail: 'O produto foi desativado (soft delete).'
        });
        this.load();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel desativar o produto'
        })
    });
  }
}


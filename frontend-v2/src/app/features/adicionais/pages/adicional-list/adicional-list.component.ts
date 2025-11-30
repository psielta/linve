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
import { AdicionalOutput } from '../../../../core/api/models/adicional-output';
import { AdicionalService } from '../../services/adicional.service';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { CategoriaOutput } from '../../../../core/api/models/categoria-output';
import { TenantService } from '../../../../core/services/tenant.service';

interface FilterOption {
  label: string;
  value: number | null;
}

@Component({
  selector: 'app-adicional-list',
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
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Gestao de cardapio</p>
          <h2 class="text-2xl font-bold m-0">Adicionais</h2>
          <p class="text-surface-500 mt-1 mb-0">
            Gerencie grupos de adicionais (complementos) vinculados a categorias de produtos.
          </p>
        </div>

        <div class="flex gap-2">
          <p-button label="Recarregar" icon="pi pi-refresh" [text]="true" (onClick)="load()" [loading]="loading()" />
          <p-button label="Novo Adicional" icon="pi pi-plus" (onClick)="goToNew()" />
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1">
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              [(ngModel)]="searchTerm"
              (input)="aplicarFiltros()"
              placeholder="Pesquisar por nome, categoria..."
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
          @for (i of [1, 2, 3, 4]; track i) {
            <p-skeleton height="4rem" borderRadius="12px" />
          }
        </div>
      } @else {
        <p-table
          #dt
          [value]="adicionaisFiltrados()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25, 50]"
          [tableStyle]="{ 'min-width': '65rem' }"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} adicionais"
          dataKey="id_adicional"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="nome" style="width: 28%">
                <div class="flex items-center gap-2">
                  Adicional
                  <p-sortIcon field="nome" />
                </div>
              </th>
              <th style="width: 18%">Categoria</th>
              <th style="width: 14%">Tipo de selecao</th>
              <th style="width: 18%">Regras</th>
              <th style="width: 22%">Opcoes / Valores</th>
              <th style="width: 10%">Status</th>
              <th style="width: 8%">Acoes</th>
            </tr>
          </ng-template>

          <ng-template #body let-adicional>
            <tr>
              <td>
                <div class="flex flex-col gap-1">
                  <span class="font-medium">{{ adicional.nome }}</span>
                </div>
              </td>
              <td>
                {{ categoriaNome(adicional.id_categoria) }}
              </td>
              <td>
                <span class="text-sm">
                  {{ selecaoLabel(adicional.selecao) }}
                </span>
              </td>
              <td>
                <div class="flex flex-col text-xs text-surface-600 dark:text-surface-300">
                  @if (adicional.selecao === 'Q') {
                    <span>Minimo: {{ adicional.minimo ?? 0 }}</span>
                    <span>Limite: {{ adicional.limite ?? 0 }}</span>
                  } @else if (adicional.selecao === 'M') {
                    <span *ngIf="adicional.limite">Limite: {{ adicional.limite }}</span>
                    <span *ngIf="!adicional.limite">Sem limite</span>
                  } @else {
                    <span>Escolha obrigatória de 1 item</span>
                  }
                </div>
              </td>
              <td class="text-sm">
                <div class="flex flex-wrap gap-1">
                  @if ((adicional.opcoes?.length || 0) === 0) {
                    <p-tag value="Sem adicionais" severity="danger" />
                  } @else {
                    @for (item of adicional.opcoes; track item.id_item) {
                      <p-tag
                        [value]="
                          item.nome
                            ? item.nome + ' • ' + (item.valor | currency: 'BRL':'symbol-narrow')
                            : (item.valor || 0)
                        "
                        [severity]="item.status ? 'success' : 'secondary'"
                        styleClass="text-xs"
                        [pTooltip]="item.nome"
                        tooltipPosition="bottom"
                      />
                    }
                  }
                </div>
              </td>
              <td>
                <p-tag
                  [value]="adicional.status ? 'Ativo' : 'Inativo'"
                  [severity]="adicional.status ? 'success' : 'danger'"
                />
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    pTooltip="Editar"
                    (onClick)="goToEdit(adicional.id_adicional!)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Desativar"
                    (onClick)="confirmDelete(adicional)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="7">
                <div class="flex flex-col items-center justify-center py-10 gap-3">
                  <i class="pi pi-plus-circle text-4xl text-surface-400"></i>
                  <p class="m-0 text-surface-500 text-center max-w-md">
                    Nenhum adicional foi encontrado.
                    @if (searchTerm || selectedCategoria) {
                      Ajuste os filtros ou limpe para ver todos.
                    } @else {
                      Cadastre grupos de adicionais para enriquecer seus produtos.
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
                        label="Criar primeiro adicional"
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
export class AdicionalListComponent implements OnInit {
  private tenantService = inject(TenantService);

  @ViewChild('dt') table!: Table;

  adicionais = signal<AdicionalOutput[]>([]);
  adicionaisFiltrados = signal<AdicionalOutput[]>([]);
  categorias = signal<CategoriaOutput[]>([]);
  categoriaOptions = signal<FilterOption[]>([]);
  loading = signal(true);

  searchTerm = '';
  selectedCategoria: number | null = null;

  private currentOrgId: number | null = null;

  constructor(
    private adicionalService: AdicionalService,
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

  ngOnInit(): void {}

  load(): void {
    this.loading.set(true);
    this.adicionalService.listar().subscribe({
      next: (data) => {
        this.adicionais.set(data);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel carregar os adicionais'
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
    let resultado = this.adicionais();

    if (this.selectedCategoria !== null) {
      resultado = resultado.filter((a) => a.id_categoria === this.selectedCategoria);
    }

    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(
        (a) =>
          (a.nome || '').toLowerCase().includes(termo) ||
          this.categoriaNome(a.id_categoria!).toLowerCase().includes(termo) ||
          this.selecaoLabel(a.selecao).toLowerCase().includes(termo)
      );
    }

    this.adicionaisFiltrados.set(resultado);
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

  selecaoLabel(selecao: string | null | undefined): string {
    switch (selecao) {
      case 'U':
        return 'Único (obrigatório)';
      case 'M':
        return 'Múltiplo (livre)';
      case 'Q':
        return 'Quantidade múltipla';
      default:
        return selecao || '';
    }
  }

  goToNew(): void {
    this.router.navigate(['/app/adicionais/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/adicionais/${id}`]);
  }

  confirmDelete(adicional: AdicionalOutput): void {
    this.confirmationService.confirm({
      header: 'Confirmacao',
      message: `Desativar o adicional "${adicional.nome}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluir(adicional.id_adicional!)
    });
  }

  excluir(id: number): void {
    this.adicionalService.excluir(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Adicional desativado',
          detail: 'O adicional foi desativado (soft delete).'
        });
        this.load();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel desativar o adicional'
        })
    });
  }
}

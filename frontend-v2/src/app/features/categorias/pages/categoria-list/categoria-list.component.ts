import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { TableModule, Table } from 'primeng/table';
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
import { CategoriaOutput } from '../../../../core/api/models/categoria-output';
import { CategoriaService } from '../../services/categoria.service';
import { CulinariaService } from '../../../../core/services/culinaria.service';
import { CulinariaOutput } from '../../../../core/api/models/culinaria-output';

interface FilterOption {
  label: string;
  value: number | null;
}

@Component({
  selector: 'app-categoria-list',
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
          <h2 class="text-2xl font-bold m-0">Categorias de Produtos</h2>
          <p class="text-surface-500 mt-1 mb-0">Cadastre categorias e suas opcoes (tamanhos/variacoes).</p>
        </div>

        <div class="flex gap-2">
          <p-button label="Recarregar" icon="pi pi-refresh" [text]="true" (onClick)="load()" [loading]="loading()" />
          <p-button label="Nova Categoria" icon="pi pi-plus" (onClick)="goToNew()" />
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <!-- Pesquisa global -->
        <div class="flex-1">
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              [(ngModel)]="searchTerm"
              (input)="onSearch($event)"
              placeholder="Pesquisar por nome, descricao..."
              class="w-full"
            />
          </p-iconfield>
        </div>

        <!-- Filtro por culinaria -->
        <div class="w-full md:w-64">
          <p-select
            [options]="culinariaOptions()"
            [(ngModel)]="selectedCulinaria"
            (ngModelChange)="onCulinariaChange()"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas as culinarias"
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
          [value]="categoriasFiltradas()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5,10,25,50]"
          [tableStyle]="{ 'min-width': '65rem' }"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorias"
          dataKey="id_categoria"
          [globalFilterFields]="['nome', 'descricao']"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="nome" style="width: 25%">
                <div class="flex items-center gap-2">
                  Nome
                  <p-sortIcon field="nome" />
                </div>
              </th>
              <th style="width: 18%">Culinaria</th>
              <th style="width: 12%">Opcoes</th>
              <th style="width: 18%">Disponibilidade</th>
              <th pSortableColumn="inicio" style="width: 12%">
                <div class="flex items-center gap-2">
                  Horario
                  <p-sortIcon field="inicio" />
                </div>
              </th>
              <th style="width: 8%">Status</th>
              <th style="width: 7%">Acoes</th>
            </tr>
          </ng-template>
          <ng-template #body let-cat>
            <tr>
              <td>
                <div class="font-semibold text-lg">{{ cat.nome }}</div>
                <div class="text-sm text-surface-500 truncate max-w-xs" [title]="cat.descricao">
                  {{ cat.descricao || 'Sem descricao' }}
                </div>
              </td>
              <td>
                <p-tag
                  [value]="culinariaNome(cat.id_culinaria)"
                  severity="info"
                  icon="pi pi-compass"
                />
              </td>
              <td class="cursor-help">
                <span
                  [pTooltip]="opcoesTooltip(cat)"
                  tooltipPosition="bottom"
                  appendTo="body"
                >
                  <p-tag [value]="(cat.opcoes?.length || 0) + ' opcao(oes)'" severity="secondary" />
                </span>
              </td>
              <td class="text-sm">
                <div class="flex flex-wrap gap-1">
                  @for (dia of diasAtivos(cat); track dia) {
                    <p-tag [value]="dia" severity="success" styleClass="text-xs" />
                  }
                  @if (diasAtivos(cat).length === 0) {
                    <p-tag value="Nenhum dia" severity="danger" />
                  }
                </div>
              </td>
              <td>
                @if (cat.inicio && cat.fim) {
                  <div class="flex items-center gap-1 text-sm">
                    <i class="pi pi-clock text-surface-400"></i>
                    <span>{{ cat.inicio }} - {{ cat.fim }}</span>
                  </div>
                } @else {
                  <p-tag value="Sempre" severity="info" icon="pi pi-check" />
                }
              </td>
              <td>
                <p-tag
                  [value]="cat.ativo ? 'Ativa' : 'Inativa'"
                  [severity]="cat.ativo ? 'success' : 'danger'"
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
                    (onClick)="goToEdit(cat.id_categoria)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Excluir"
                    tooltipPosition="top"
                    (onClick)="confirmDelete(cat)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="7">
                <div class="flex flex-col items-center justify-center py-16 px-4">
                  <!-- Icone com fundo estilizado -->
                  <div class="relative mb-6">
                    <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                      @if (searchTerm || selectedCulinaria) {
                        <i class="pi pi-search text-5xl text-primary/60"></i>
                      } @else {
                        <i class="pi pi-th-large text-5xl text-primary/60"></i>
                      }
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center border border-surface-200 dark:border-surface-600">
                      @if (searchTerm || selectedCulinaria) {
                        <i class="pi pi-times text-surface-400 text-sm"></i>
                      } @else {
                        <i class="pi pi-plus text-primary text-sm"></i>
                      }
                    </div>
                  </div>

                  <!-- Titulo -->
                  <h3 class="text-xl font-semibold text-surface-700 dark:text-surface-200 mb-2">
                    @if (searchTerm || selectedCulinaria) {
                      Nenhum resultado encontrado
                    } @else {
                      Nenhuma categoria cadastrada
                    }
                  </h3>

                  <!-- Descricao -->
                  <p class="text-surface-500 text-center max-w-md mb-6">
                    @if (searchTerm || selectedCulinaria) {
                      Nao encontramos categorias com os filtros aplicados. Tente ajustar sua busca ou limpar os filtros.
                    } @else {
                      Categorias ajudam a organizar seus produtos no cardapio. Crie sua primeira categoria para comecar.
                    }
                  </p>

                  <!-- Acoes -->
                  <div class="flex gap-3">
                    @if (searchTerm || selectedCulinaria) {
                      <p-button
                        label="Limpar filtros"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="searchTerm = ''; selectedCulinaria = null; aplicarFiltros()"
                      />
                    } @else {
                      <p-button
                        label="Criar primeira categoria"
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
export class CategoriaListComponent implements OnInit {
  private tenantService = inject(TenantService);

  @ViewChild('dt') table!: Table;

  categorias = signal<CategoriaOutput[]>([]);
  categoriasFiltradas = signal<CategoriaOutput[]>([]);
  culinarias = signal<CulinariaOutput[]>([]);
  loading = signal(true);

  searchTerm = '';
  selectedCulinaria: number | null = null;

  culinariaOptions = signal<FilterOption[]>([]);

  private currentOrgId: number | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private culinariaService: CulinariaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    // Recarrega dados quando a organizacao mudar
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.currentOrgId) {
        this.currentOrgId = orgId;
        this.load();
        this.loadCulinarias();
      }
    });
  }

  ngOnInit(): void {
    // Carregamento inicial eh feito pelo effect quando a organizacao eh definida
  }

  load(): void {
    this.loading.set(true);
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel carregar as categorias'
        });
      }
    });
  }

  loadCulinarias(): void {
    this.culinariaService.listar().subscribe({
      next: (data) => {
        this.culinarias.set(data);
        const options: FilterOption[] = data.map((c) => ({
          label: c.nome || `Culinaria #${c.id}`,
          value: c.id!
        }));
        this.culinariaOptions.set(options);
      },
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atencao',
          detail: 'Nao foi possivel carregar as culinarias'
        });
      }
    });
  }

  onSearch(event: Event): void {
    this.aplicarFiltros();
  }

  onCulinariaChange(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = this.categorias();

    // Filtro por culinaria
    if (this.selectedCulinaria !== null) {
      resultado = resultado.filter((c) => c.id_culinaria === this.selectedCulinaria);
    }

    // Filtro por texto
    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(
        (c) =>
          c.nome?.toLowerCase().includes(termo) ||
          c.descricao?.toLowerCase().includes(termo) ||
          this.culinariaNome(c.id_culinaria).toLowerCase().includes(termo)
      );
    }

    this.categoriasFiltradas.set(resultado);
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
      sabado: 'Sab'
    };
    return Object.entries(map)
      .filter(([k]) => (d as any)[k])
      .map(([, v]) => v);
  }

  opcoesTooltip(cat: CategoriaOutput): string {
    const opcoes = cat.opcoes || [];
    if (opcoes.length === 0) {
      return 'Nenhuma opcao cadastrada';
    }
    return opcoes.map((o) => o.nome).join(', ');
  }

  goToNew(): void {
    this.router.navigate(['/app/categorias/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/categorias/${id}`]);
  }

  confirmDelete(cat: CategoriaOutput): void {
    this.confirmationService.confirm({
      header: 'Confirmacao',
      message: `Desativar a categoria "${cat.nome}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluir(cat.id_categoria)
    });
  }

  excluir(id: number): void {
    this.categoriaService.excluir(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Categoria desativada',
          detail: 'A categoria foi desativada (soft delete).'
        });
        this.load();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel desativar a categoria'
        });
      }
    });
  }
}

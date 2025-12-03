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
import { MessageService, ConfirmationService } from 'primeng/api';
import { ClienteOutput } from '../../../../core/api/models/cliente-output';
import { ClienteService } from '../../services/cliente.service';
import { TenantService } from '../../../../core/services/tenant.service';

@Component({
  selector: 'app-cliente-list',
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
    InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="card">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Cadastros</p>
          <h2 class="text-2xl font-bold m-0">Clientes</h2>
          <p class="text-surface-500 mt-1 mb-0">Gerencie os clientes e seus enderecos.</p>
        </div>

        <div class="flex gap-2">
          <p-button label="Recarregar" icon="pi pi-refresh" [text]="true" (onClick)="load()" [loading]="loading()" />
          <p-button label="Novo Cliente" icon="pi pi-plus" (onClick)="goToNew()" />
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
              placeholder="Pesquisar por nome, documento, telefone..."
              class="w-full"
            />
          </p-iconfield>
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
          [value]="clientesFiltrados()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5,10,25,50]"
          [tableStyle]="{ 'min-width': '60rem' }"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
          dataKey="id"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="nome" style="width: 30%">
                <div class="flex items-center gap-2">
                  Nome
                  <p-sortIcon field="nome" />
                </div>
              </th>
              <th style="width: 18%">Documento</th>
              <th style="width: 18%">Telefone</th>
              <th style="width: 22%">Cidade/UF</th>
              <th style="width: 12%">Acoes</th>
            </tr>
          </ng-template>
          <ng-template #body let-cliente>
            <tr>
              <td>
                <div class="font-semibold text-lg">{{ cliente.nome }}</div>
              </td>
              <td>
                <span class="text-sm">{{ formatarDocumento(cliente.documento) }}</span>
              </td>
              <td>
                <span class="text-sm">{{ formatarTelefone(cliente.tel_1) }}</span>
              </td>
              <td>
                @if (cliente.enderecos && cliente.enderecos.length > 0) {
                  <p-tag
                    [value]="cliente.enderecos[0].cidade + ' / ' + cliente.enderecos[0].uf"
                    severity="info"
                    icon="pi pi-map-marker"
                  />
                } @else {
                  <span class="text-surface-400">Sem endereco</span>
                }
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
                    (onClick)="goToEdit(cliente.id)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Excluir"
                    tooltipPosition="top"
                    (onClick)="confirmDelete(cliente)"
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
                      @if (searchTerm) {
                        <i class="pi pi-search text-5xl text-primary/60"></i>
                      } @else {
                        <i class="pi pi-users text-5xl text-primary/60"></i>
                      }
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center border border-surface-200 dark:border-surface-600">
                      @if (searchTerm) {
                        <i class="pi pi-times text-surface-400 text-sm"></i>
                      } @else {
                        <i class="pi pi-plus text-primary text-sm"></i>
                      }
                    </div>
                  </div>

                  <h3 class="text-xl font-semibold text-surface-700 dark:text-surface-200 mb-2">
                    @if (searchTerm) {
                      Nenhum resultado encontrado
                    } @else {
                      Nenhum cliente cadastrado
                    }
                  </h3>

                  <p class="text-surface-500 text-center max-w-md mb-6">
                    @if (searchTerm) {
                      Ajuste os filtros ou limpe a busca para ver outros resultados.
                    } @else {
                      Cadastre clientes para gerenciar seus dados e enderecos.
                    }
                  </p>

                  <div class="flex gap-3">
                    @if (searchTerm) {
                      <p-button
                        label="Limpar filtros"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="resetFiltros()"
                      />
                    } @else {
                      <p-button
                        label="Criar primeiro cliente"
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
export class ClienteListComponent implements OnInit {
  private tenantService = inject(TenantService);

  @ViewChild('dt') table!: Table;

  clientes = signal<ClienteOutput[]>([]);
  clientesFiltrados = signal<ClienteOutput[]>([]);
  loading = signal(true);

  searchTerm = '';

  private currentOrgId: number | null = null;

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.currentOrgId) {
        this.currentOrgId = orgId;
        this.load();
      }
    });
  }

  ngOnInit(): void {
    // carregamento inicial via effect
  }

  load(): void {
    this.loading.set(true);
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel carregar os clientes'
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = this.clientes();

    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(
        (c) =>
          c.nome?.toLowerCase().includes(termo) ||
          c.documento?.toLowerCase().includes(termo) ||
          c.tel_1?.toLowerCase().includes(termo) ||
          c.enderecos?.some(e => e.cidade?.toLowerCase().includes(termo))
      );
    }

    this.clientesFiltrados.set(resultado);
  }

  resetFiltros(): void {
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  formatarDocumento(documento?: string): string {
    if (!documento) return '-';
    const num = documento.replace(/\D/g, '');
    if (num.length === 11) {
      return num.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (num.length === 14) {
      return num.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return documento;
  }

  formatarTelefone(telefone?: string): string {
    if (!telefone) return '-';
    const num = telefone.replace(/\D/g, '');
    if (num.length === 11) {
      return num.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (num.length === 10) {
      return num.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  goToNew(): void {
    this.router.navigate(['/app/clientes/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/clientes/${id}`]);
  }

  confirmDelete(cliente: ClienteOutput): void {
    this.confirmationService.confirm({
      header: 'Confirmacao',
      message: `Desativar o cliente "${cliente.nome}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluir(cliente.id)
    });
  }

  excluir(id: number): void {
    this.clienteService.excluir(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cliente desativado',
          detail: 'O cliente foi desativado (soft delete).'
        });
        this.load();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel desativar o cliente'
        })
    });
  }
}

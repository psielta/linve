import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoriaOutput } from '../../../../core/api/models/categoria-output';
import { CategoriaService } from '../../services/categoria.service';
import { CulinariaService } from '../../../../core/services/culinaria.service';
import { CulinariaOutput } from '../../../../core/api/models/culinaria-output';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="card">
      <div class="flex flex-column md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Gestão de cardápio</p>
          <h2 class="text-2xl font-bold m-0">Categorias de Produtos</h2>
          <p class="text-surface-500 mt-1 mb-0">Cadastre categorias e suas opções (tamanhos/variações).</p>
        </div>

        <div class="flex gap-2">
          <p-button label="Recarregar" icon="pi pi-refresh" [text]="true" (onClick)="load()" />
          <p-button label="Nova Categoria" icon="pi pi-plus" (onClick)="goToNew()" />
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
          [value]="categorias()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5,10,25,50]"
          [tableStyle]="{ 'min-width': '65rem' }"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorias"
          dataKey="id_categoria"
        >
          <ng-template #header>
            <tr>
              <th style="width: 28%">Nome</th>
              <th style="width: 20%">Culinária</th>
              <th style="width: 12%">Opções</th>
              <th style="width: 18%">Disponibilidade</th>
              <th style="width: 12%">Horário</th>
              <th style="width: 10%">Status</th>
              <th style="width: 10%">Ações</th>
            </tr>
          </ng-template>
          <ng-template #body let-cat>
            <tr>
              <td>
                <div class="font-semibold text-lg">{{ cat.nome }}</div>
                <div class="text-sm text-surface-500">{{ cat.descricao || 'Sem descrição' }}</div>
              </td>
              <td>
                <p-tag
                  [value]="culinariaNome(cat.id_culinaria)"
                  severity="info"
                  icon="pi pi-compass"
                />
              </td>
              <td>
                <p-tag [value]="(cat.opcoes?.length || 0) + ' opção(ões)'" severity="secondary" />
              </td>
              <td class="text-sm">
                <div class="flex flex-wrap gap-1">
                  @for (dia of diasAtivos(cat); track dia) {
                    <p-tag [value]="dia" severity="success" />
                  }
                  @if (diasAtivos(cat).length === 0) {
                    <p-tag value="Nenhum dia" severity="danger" />
                  }
                </div>
              </td>
              <td>
                @if (cat.inicio && cat.fim) {
                  <span class="text-sm text-surface-600">{{ cat.inicio }} - {{ cat.fim }}</span>
                } @else {
                  <p-tag value="Sempre" severity="info" />
                }
              </td>
              <td>
                <p-tag
                  [value]="cat.ativo ? 'Ativa' : 'Inativa'"
                  [severity]="cat.ativo ? 'success' : 'danger'"
                />
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    pTooltip="Editar"
                    (onClick)="goToEdit(cat.id_categoria)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Excluir"
                    (onClick)="confirmDelete(cat)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="7" class="text-center py-8">
                <i class="pi pi-inbox text-4xl text-surface-300 mb-4"></i>
                <p class="text-surface-500">Nenhuma categoria cadastrada</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
  `
})
export class CategoriaListComponent implements OnInit {
  categorias = signal<CategoriaOutput[]>([]);
  culinarias = signal<CulinariaOutput[]>([]);
  loading = signal(true);

  constructor(
    private categoriaService: CategoriaService,
    private culinariaService: CulinariaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadCulinarias();
  }

  load(): void {
    this.loading.set(true);
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as categorias'
        });
      }
    });
  }

  loadCulinarias(): void {
    this.culinariaService.listar().subscribe({
      next: (data) => this.culinarias.set(data),
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Não foi possível carregar as culinárias'
        });
      }
    });
  }

  culinariaNome(id: number): string {
    const found = this.culinarias().find((c) => c.id === id);
    return found?.nome ?? `Culinária #${id}`;
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
      sabado: 'Sáb'
    };
    return Object.entries(map)
      .filter(([k]) => (d as any)[k])
      .map(([, v]) => v);
  }

  goToNew(): void {
    this.router.navigate(['/app/categorias/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate([`/app/categorias/${id}`]);
  }

  confirmDelete(cat: CategoriaOutput): void {
    this.confirmationService.confirm({
      header: 'Confirmação',
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
          detail: 'Não foi possível desativar a categoria'
        });
      }
    });
  }
}

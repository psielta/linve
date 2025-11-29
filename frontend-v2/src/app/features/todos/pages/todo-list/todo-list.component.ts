import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TodoOutput } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';
import { TodoFormComponent } from '../../components/todo-form/todo-form.component';
import { TenantService } from '../../../../core/services/tenant.service';

interface FilterOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    TodoFormComponent
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold m-0">Tarefas</h2>
        <p-button label="Nova Tarefa" icon="pi pi-plus" (onClick)="openNew()" />
      </div>

      <div class="mb-4">
        <p-select
          [options]="filterOptions"
          [(ngModel)]="selectedFilter"
          (ngModelChange)="onFilterChange()"
          optionLabel="label"
          optionValue="value"
          placeholder="Filtrar por status"
          [style]="{ 'min-width': '200px' }"
        />
      </div>

      @if (loading()) {
        <div class="flex flex-col gap-4">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <p-skeleton height="3rem" />
          }
        </div>
      } @else {
        <p-table
          [value]="todos()"
          [tableStyle]="{ 'min-width': '60rem' }"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tarefas"
        >
          <ng-template #header>
            <tr>
              <th style="width: 35%">Título</th>
              <th style="width: 30%">Descrição</th>
              <th style="width: 10%">Status</th>
              <th style="width: 15%">Data Criação</th>
              <th style="width: 10%">Ações</th>
            </tr>
          </ng-template>
          <ng-template #body let-todo>
            <tr>
              <td>
                <span [class.line-through]="todo.concluido" [class.text-surface-400]="todo.concluido">
                  {{ todo.titulo }}
                </span>
              </td>
              <td>
                <span class="text-surface-500 text-sm" [class.line-through]="todo.concluido">
                  {{ todo.descricao || '-' }}
                </span>
              </td>
              <td>
                @if (todo.concluido) {
                  <p-tag value="Concluída" severity="success" />
                } @else {
                  <p-tag value="Pendente" severity="warn" />
                }
              </td>
              <td>
                <span class="text-surface-500 text-sm">
                  {{ formatDate(todo.dataCriacao) }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  @if (todo.concluido) {
                    <p-button
                      icon="pi pi-refresh"
                      [rounded]="true"
                      [text]="true"
                      severity="info"
                      pTooltip="Reabrir"
                      (onClick)="reabrir(todo)"
                    />
                  } @else {
                    <p-button
                      icon="pi pi-check"
                      [rounded]="true"
                      [text]="true"
                      severity="success"
                      pTooltip="Concluir"
                      (onClick)="concluir(todo)"
                    />
                  }
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    pTooltip="Editar"
                    (onClick)="edit(todo)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Excluir"
                    (onClick)="confirmDelete(todo)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="5" class="text-center py-8">
                <i class="pi pi-inbox text-4xl text-surface-300 mb-4"></i>
                <p class="text-surface-500">Nenhuma tarefa encontrada</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <app-todo-form
      [(visible)]="formVisible"
      [todo]="selectedTodo"
      (saved)="onSaved($event)"
    />
  `
})
export class TodoListComponent implements OnInit {
  private tenantService = inject(TenantService);

  todos = signal<TodoOutput[]>([]);
  loading = signal(true);
  formVisible = false;
  selectedTodo: TodoOutput | null = null;

  filterOptions: FilterOption[] = [
    { label: 'Todas', value: null },
    { label: 'Pendentes', value: false },
    { label: 'Concluídas', value: true }
  ];
  selectedFilter: boolean | null = null;

  private currentOrgId: number | null = null;

  constructor(
    private todoService: TodoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    // Recarrega dados quando a organização mudar
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId && orgId !== this.currentOrgId) {
        this.currentOrgId = orgId;
        // Fecha o formulário se estiver aberto (evita salvar na org errada)
        if (this.formVisible) {
          this.formVisible = false;
          this.selectedTodo = null;
        }
        this.loadTodos();
      }
    });
  }

  ngOnInit(): void {
    // Carregamento inicial é feito pelo effect quando a organização é definida
  }

  loadTodos(): void {
    this.loading.set(true);
    const filter = this.selectedFilter;

    this.todoService.list(filter ?? undefined).subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar tarefas:', error);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar tarefas'
        });
      }
    });
  }

  onFilterChange(): void {
    this.loadTodos();
  }

  openNew(): void {
    this.selectedTodo = null;
    this.formVisible = true;
  }

  edit(todo: TodoOutput): void {
    this.selectedTodo = todo;
    this.formVisible = true;
  }

  onSaved(todo: TodoOutput): void {
    this.loadTodos();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: this.selectedTodo ? 'Tarefa atualizada' : 'Tarefa criada'
    });
  }

  concluir(todo: TodoOutput): void {
    this.todoService.concluir(todo.id).subscribe({
      next: () => {
        this.loadTodos();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Tarefa concluída'
        });
      },
      error: (error) => {
        console.error('Erro ao concluir tarefa:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao concluir tarefa'
        });
      }
    });
  }

  reabrir(todo: TodoOutput): void {
    this.todoService.reabrir(todo.id).subscribe({
      next: () => {
        this.loadTodos();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Tarefa reaberta'
        });
      },
      error: (error) => {
        console.error('Erro ao reabrir tarefa:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao reabrir tarefa'
        });
      }
    });
  }

  confirmDelete(todo: TodoOutput): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a tarefa "${todo.titulo}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(todo)
    });
  }

  delete(todo: TodoOutput): void {
    this.todoService.delete(todo.id).subscribe({
      next: () => {
        this.loadTodos();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Tarefa excluída'
        });
      },
      error: (error) => {
        console.error('Erro ao excluir tarefa:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir tarefa'
        });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

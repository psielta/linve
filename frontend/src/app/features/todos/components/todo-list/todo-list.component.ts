import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TodoService } from '../../../../core/services/todo.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { Todo, TodoInput } from '../../../../core/models/todo.model';
import { TodoFormComponent } from '../todo-form/todo-form.component';

type FilterType = 'todas' | 'pendentes' | 'concluidas';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    TodoFormComponent
  ],
  template: `
    <div class="todo-container">
      <mat-toolbar color="primary" class="toolbar">
        <mat-icon class="toolbar-icon">checklist</mat-icon>
        <span class="toolbar-title">Minhas Tarefas</span>

        <span class="spacer"></span>

        @if (authService.currentUser; as user) {
          <span class="user-info">{{ user.nome }}</span>
        }

        <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Menu">
          <mat-icon>account_circle</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item disabled>
            <mat-icon>business</mat-icon>
            <span>{{ authService.organizationName }}</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="themeService.toggle()">
            <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            <span>{{ themeService.isDark() ? 'Tema Claro' : 'Tema Escuro' }}</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Sair</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <main class="main-content">
        <div class="actions-bar">
          <mat-chip-listbox [value]="filter()" (change)="onFilterChange($event.value)" aria-label="Filtros">
            <mat-chip-option value="todas">Todas</mat-chip-option>
            <mat-chip-option value="pendentes">Pendentes</mat-chip-option>
            <mat-chip-option value="concluidas">Concluídas</mat-chip-option>
          </mat-chip-listbox>

          <button mat-raised-button color="primary" (click)="openNewForm()">
            <mat-icon>add</mat-icon>
            Nova Tarefa
          </button>
        </div>

        @if (error()) {
          <div class="error-alert">
            <mat-icon>error</mat-icon>
            <span>{{ error() }}</span>
          </div>
        }

        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="48"></mat-spinner>
            <span>Carregando tarefas...</span>
          </div>
        } @else if (todos().length === 0) {
          <mat-card class="empty-state">
            <mat-card-content>
              <mat-icon class="empty-icon">task_alt</mat-icon>
              <h3>Nenhuma tarefa encontrada</h3>
              <p>Clique em "Nova Tarefa" para começar a organizar suas atividades</p>
              <button mat-stroked-button color="primary" (click)="openNewForm()">
                <mat-icon>add</mat-icon>
                Criar primeira tarefa
              </button>
            </mat-card-content>
          </mat-card>
        } @else {
          <div class="todo-list">
            @for (todo of todos(); track todo.id) {
              <mat-card class="todo-card" [class.completed]="todo.concluido">
                <mat-card-content class="todo-card-content">
                  <mat-checkbox
                    [checked]="todo.concluido"
                    (change)="toggleConcluido(todo)"
                    color="primary"
                  ></mat-checkbox>

                  <div class="todo-info" (click)="openEditForm(todo)">
                    <span class="todo-title">{{ todo.titulo }}</span>
                    @if (todo.descricao) {
                      <span class="todo-description">{{ todo.descricao }}</span>
                    }
                    <span class="todo-date">
                      <mat-icon class="date-icon">schedule</mat-icon>
                      {{ todo.concluido ? 'Concluída em ' + formatDate(todo.dataConclusao) : 'Criada em ' + formatDate(todo.dataCriacao) }}
                    </span>
                  </div>

                  <button mat-icon-button [matMenuTriggerFor]="todoMenu" matTooltip="Opções">
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #todoMenu="matMenu">
                    <button mat-menu-item (click)="openEditForm(todo)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item (click)="toggleConcluido(todo)">
                      <mat-icon>{{ todo.concluido ? 'replay' : 'check' }}</mat-icon>
                      <span>{{ todo.concluido ? 'Reabrir' : 'Concluir' }}</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item class="delete-option" (click)="delete(todo)">
                      <mat-icon>delete</mat-icon>
                      <span>Excluir</span>
                    </button>
                  </mat-menu>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }
      </main>

      @if (showForm()) {
        <app-todo-form
          [todo]="editingTodo()"
          (save)="onSave($event)"
          (cancel)="closeForm()"
        />
      }
    </div>
  `,
  styles: [`
    .todo-container {
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-icon {
      margin-right: 12px;
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .user-info {
      margin-right: 8px;
      font-size: 14px;
      opacity: 0.9;
    }

    .main-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #ffebee;
      color: #c62828;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    :host-context(.dark-theme) .error-alert {
      background: #4a1c1c;
      color: #ef9a9a;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      gap: 16px;
      color: var(--text-secondary);
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--text-secondary);
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px 0;
        color: var(--text-primary);
      }

      p {
        margin: 0 0 24px 0;
        color: var(--text-secondary);
      }
    }

    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .todo-card {
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow-color);
      }

      &.completed {
        opacity: 0.7;

        .todo-title {
          text-decoration: line-through;
          color: var(--text-secondary);
        }
      }
    }

    .todo-card-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 8px 0 !important;
    }

    .todo-info {
      flex: 1;
      min-width: 0;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .todo-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
      word-break: break-word;
    }

    .todo-description {
      font-size: 14px;
      color: var(--text-secondary);
      word-break: break-word;
    }

    .todo-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .date-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .delete-option {
      color: #f44336;
    }
  `]
})
export class TodoListComponent implements OnInit {
  todos = signal<Todo[]>([]);
  loading = signal(false);
  filter = signal<FilterType>('todas');
  showForm = signal(false);
  editingTodo = signal<Todo | null>(null);
  error = signal<string | null>(null);

  constructor(
    private todoService: TodoService,
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading.set(true);
    this.error.set(null);

    let concluido: boolean | undefined;
    if (this.filter() === 'pendentes') {
      concluido = false;
    } else if (this.filter() === 'concluidas') {
      concluido = true;
    }

    this.todoService.listar(concluido).subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar tarefas');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onFilterChange(filter: FilterType): void {
    if (filter) {
      this.filter.set(filter);
      this.loadTodos();
    }
  }

  openNewForm(): void {
    this.editingTodo.set(null);
    this.showForm.set(true);
  }

  openEditForm(todo: Todo): void {
    this.editingTodo.set(todo);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingTodo.set(null);
  }

  onSave(input: TodoInput): void {
    const editing = this.editingTodo();
    if (editing) {
      this.todoService.atualizar(editing.id, input).subscribe({
        next: () => {
          this.closeForm();
          this.loadTodos();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.todoService.criar(input).subscribe({
        next: () => {
          this.closeForm();
          this.loadTodos();
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleConcluido(todo: Todo): void {
    const action = todo.concluido
      ? this.todoService.reabrir(todo.id)
      : this.todoService.concluir(todo.id);

    action.subscribe({
      next: () => this.loadTodos(),
      error: (err) => console.error(err)
    });
  }

  delete(todo: Todo): void {
    if (confirm(`Deseja excluir "${todo.titulo}"?`)) {
      this.todoService.excluir(todo.id).subscribe({
        next: () => this.loadTodos(),
        error: (err) => console.error(err)
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

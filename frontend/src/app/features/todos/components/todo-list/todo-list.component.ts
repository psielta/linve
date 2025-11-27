import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../../../core/services/todo.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Todo, TodoInput } from '../../../../core/models/todo.model';
import { TodoFormComponent } from '../todo-form/todo-form.component';

type FilterType = 'todas' | 'pendentes' | 'concluidas';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoFormComponent],
  template: `
    <div class="todo-container">
      <header class="header">
        <div class="header-content">
          <div class="brand">
            <h1>📋 Minhas Tarefas</h1>
            @if (authService.currentUser; as user) {
              <span class="user-info">{{ user.nome }} • {{ authService.organizationName }}</span>
            }
          </div>
          <button class="btn-logout" (click)="logout()">Sair</button>
        </div>
      </header>

      <main class="main">
        <div class="toolbar">
          <div class="filters">
            <button
              class="filter-btn"
              [class.active]="filter() === 'todas'"
              (click)="onFilterChange('todas')"
            >Todas</button>
            <button
              class="filter-btn"
              [class.active]="filter() === 'pendentes'"
              (click)="onFilterChange('pendentes')"
            >Pendentes</button>
            <button
              class="filter-btn"
              [class.active]="filter() === 'concluidas'"
              (click)="onFilterChange('concluidas')"
            >Concluídas</button>
          </div>
          <button class="btn-add" (click)="openNewForm()">+ Nova Tarefa</button>
        </div>

        @if (error()) {
          <div class="error-message">{{ error() }}</div>
        }

        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            <span>Carregando tarefas...</span>
          </div>
        } @else if (todos().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Nenhuma tarefa encontrada</h3>
            <p>Clique em "Nova Tarefa" para começar</p>
          </div>
        } @else {
          <div class="todo-list">
            @for (todo of todos(); track todo.id) {
              <div class="todo-item" [class.completed]="todo.concluido">
                <button
                  class="checkbox"
                  [class.checked]="todo.concluido"
                  (click)="toggleConcluido(todo)"
                  [attr.aria-label]="todo.concluido ? 'Marcar como pendente' : 'Marcar como concluída'"
                >
                  @if (todo.concluido) {
                    <span class="check-icon">✓</span>
                  }
                </button>

                <div class="todo-content" (click)="openEditForm(todo)">
                  <h3 class="todo-title">{{ todo.titulo }}</h3>
                  @if (todo.descricao) {
                    <p class="todo-description">{{ todo.descricao }}</p>
                  }
                  <span class="todo-date">
                    {{ todo.concluido ? 'Concluída em ' + formatDate(todo.dataConclusao) : 'Criada em ' + formatDate(todo.dataCriacao) }}
                  </span>
                </div>

                <button class="btn-delete" (click)="delete(todo)" aria-label="Excluir tarefa">
                  🗑️
                </button>
              </div>
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
      background: #f5f7fa;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }
    }

    .user-info {
      font-size: 14px;
      opacity: 0.9;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .main {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 20px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .filters {
      display: flex;
      gap: 8px;
    }

    .filter-btn {
      background: white;
      border: 1px solid #ddd;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #667eea;
        color: #667eea;
      }

      &.active {
        background: #667eea;
        border-color: #667eea;
        color: white;
      }
    }

    .btn-add {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #eee;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .todo-item {
      background: white;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      &.completed {
        opacity: 0.7;

        .todo-title {
          text-decoration: line-through;
          color: #888;
        }
      }
    }

    .checkbox {
      width: 24px;
      height: 24px;
      min-width: 24px;
      border: 2px solid #ddd;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      margin-top: 2px;

      &:hover {
        border-color: #667eea;
      }

      &.checked {
        background: #667eea;
        border-color: #667eea;
      }

      .check-icon {
        color: white;
        font-size: 14px;
        font-weight: bold;
      }
    }

    .todo-content {
      flex: 1;
      cursor: pointer;
      min-width: 0;
    }

    .todo-title {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
      word-break: break-word;
    }

    .todo-description {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      word-break: break-word;
    }

    .todo-date {
      font-size: 12px;
      color: #999;
    }

    .btn-delete {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
      padding: 4px;

      &:hover {
        opacity: 1;
      }
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
    public authService: AuthService
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
    this.filter.set(filter);
    this.loadTodos();
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

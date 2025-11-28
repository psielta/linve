import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../../../core/services/todo.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TodoOutput, TodoInput } from '../../../../core/api';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import Swal from 'sweetalert2';

type FilterType = 'todas' | 'pendentes' | 'concluidas';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoFormComponent],
  template: `
    <div class="todo-list-container">
      <!-- Toolbar -->
      <div class="todo-toolbar">
        <div class="toolbar-left">
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn"
              [class.btn-primary]="filter() === 'todas'"
              [class.btn-light]="filter() !== 'todas'"
              (click)="onFilterChange('todas')">
              Todas
              <span class="badge ms-1" [class.bg-white]="filter() === 'todas'" [class.text-primary]="filter() === 'todas'" [class.bg-secondary]="filter() !== 'todas'">
                {{ totalCount() }}
              </span>
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-primary]="filter() === 'pendentes'"
              [class.btn-light]="filter() !== 'pendentes'"
              (click)="onFilterChange('pendentes')">
              Pendentes
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-primary]="filter() === 'concluidas'"
              [class.btn-light]="filter() !== 'concluidas'"
              (click)="onFilterChange('concluidas')">
              Concluídas
            </button>
          </div>
        </div>

        <button class="btn btn-primary" (click)="openNewForm()">
          <i class="fa-solid fa-plus me-2"></i>Nova Tarefa
        </button>
      </div>

      <!-- Error Alert -->
      @if (error()) {
        <div class="alert alert-danger d-flex align-items-center" role="alert">
          <i class="fa-solid fa-circle-exclamation me-2"></i>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="text-muted">Carregando tarefas...</p>
        </div>
      } @else if (todos().length === 0) {
        <!-- Empty State -->
        <div class="empty-state-card">
          <div class="empty-state-icon">
            <i class="fa-solid fa-clipboard-list"></i>
          </div>
          <h4>Nenhuma tarefa encontrada</h4>
          <p class="text-muted">Clique em "Nova Tarefa" para começar a organizar suas atividades</p>
          <button class="btn btn-primary" (click)="openNewForm()">
            <i class="fa-solid fa-plus me-2"></i>Criar primeira tarefa
          </button>
        </div>
      } @else {
        <!-- Todo List -->
        <div class="todo-list">
          @for (todo of todos(); track todo.id) {
            <div class="todo-card" [class.completed]="todo.concluido">
              <!-- Checkbox -->
              <div class="todo-checkbox">
                <input
                  type="checkbox"
                  [checked]="todo.concluido"
                  (change)="toggleConcluido(todo)"
                  [id]="'todo-' + todo.id" />
              </div>

              <!-- Content -->
              <div class="todo-content" (click)="openEditForm(todo)">
                <h6 class="todo-title" [class.completed]="todo.concluido">
                  {{ todo.titulo }}
                </h6>
                @if (todo.descricao) {
                  <p class="todo-description">{{ todo.descricao }}</p>
                }
                <div class="todo-meta">
                  <span class="todo-date">
                    <i class="fa-regular fa-clock me-1"></i>
                    {{ todo.concluido ? 'Concluída em ' + formatDate(todo.dataConclusao) : 'Criada em ' + formatDate(todo.dataCriacao) }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="todo-actions">
                <div class="dropdown">
                  <button class="btn btn-light btn-sm btn-icon" type="button" data-bs-toggle="dropdown">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item" href="javascript:void(0)" (click)="openEditForm(todo)">
                        <i class="fa-solid fa-pen me-2"></i>Editar
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="javascript:void(0)" (click)="toggleConcluido(todo)">
                        <i class="fa-solid me-2" [ngClass]="todo.concluido ? 'fa-rotate-left' : 'fa-check'"></i>
                        {{ todo.concluido ? 'Reabrir' : 'Concluir' }}
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item text-danger" href="javascript:void(0)" (click)="delete(todo)">
                        <i class="fa-solid fa-trash me-2"></i>Excluir
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Form Modal -->
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
    .todo-list-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .todo-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-state-card {
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      padding: 60px 40px;
      text-align: center;
    }

    .empty-state-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(var(--primary-rgb), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;

      i {
        font-size: 2.5rem;
        color: var(--primary-color);
      }
    }

    .empty-state-card h4 {
      margin: 0 0 10px;
      color: var(--text-color);
    }

    .empty-state-card p {
      margin-bottom: 20px;
    }

    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .todo-card {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      background: var(--card-bg);
      border-radius: 10px;
      box-shadow: var(--shadow-sm);
      padding: 16px 20px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &.completed {
        opacity: 0.7;
      }
    }

    .todo-checkbox {
      padding-top: 2px;

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: var(--primary-color);
      }
    }

    .todo-content {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }

    .todo-title {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 500;
      color: var(--text-color);
      transition: all 0.2s ease;

      &.completed {
        text-decoration: line-through;
        color: var(--text-muted);
      }
    }

    .todo-description {
      margin: 0 0 8px;
      font-size: 13px;
      color: var(--text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .todo-meta {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .todo-date {
      font-size: 12px;
      color: var(--text-muted);
    }

    .todo-actions {
      flex-shrink: 0;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }
  `]
})
export class TodoListComponent implements OnInit {
  todos = signal<TodoOutput[]>([]);
  totalCount = signal(0);
  loading = signal(false);
  filter = signal<FilterType>('todas');
  showForm = signal(false);
  editingTodo = signal<TodoOutput | null>(null);
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
        if (this.filter() === 'todas') {
          this.totalCount.set(todos.length);
        }
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

  openEditForm(todo: TodoOutput): void {
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
      this.todoService.atualizar(editing.id!, input).subscribe({
        next: () => {
          this.closeForm();
          this.loadTodos();
          Swal.fire({
            icon: 'success',
            title: 'Tarefa atualizada!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (err) => console.error(err)
      });
    } else {
      this.todoService.criar(input).subscribe({
        next: () => {
          this.closeForm();
          this.loadTodos();
          Swal.fire({
            icon: 'success',
            title: 'Tarefa criada!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleConcluido(todo: TodoOutput): void {
    const action = todo.concluido
      ? this.todoService.reabrir(todo.id!)
      : this.todoService.concluir(todo.id!);

    action.subscribe({
      next: () => this.loadTodos(),
      error: (err) => console.error(err)
    });
  }

  delete(todo: TodoOutput): void {
    Swal.fire({
      title: 'Excluir tarefa?',
      text: `Deseja excluir "${todo.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--danger)',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim, excluir'
    }).then((result) => {
      if (result.isConfirmed) {
        this.todoService.excluir(todo.id!).subscribe({
          next: () => {
            this.loadTodos();
            Swal.fire({
              icon: 'success',
              title: 'Tarefa excluída!',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000
            });
          },
          error: (err) => console.error(err)
        });
      }
    });
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

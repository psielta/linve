import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../../../core/services/todo.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TodoOutput, TodoInput } from '../../../../core/api';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import Swal from 'sweetalert2';

type FilterType = 'todas' | 'pendentes' | 'concluidas';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoFormComponent],
  template: `
    <div class="app-wrapper">
      <!-- Header -->
      <header class="app-header">
        <div class="d-flex align-items-center gap-3">
          <i class="fa-solid fa-list-check fs-4 text-primary"></i>
          <div>
            <h1 class="h5 mb-0 fw-bold">Minhas Tarefas</h1>
            @if (authService.currentUser; as user) {
              <small class="text-muted">{{ user.nome }} &bull; {{ authService.organizationName }}</small>
            }
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <!-- Theme Toggle -->
          <button class="theme-toggle" (click)="themeService.cycle()" type="button" title="Alternar tema">
            <i class="fa-solid" [ngClass]="themeService.getIcon()"></i>
          </button>

          <!-- User Menu -->
          <div class="dropdown">
            <button class="btn btn-light btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-user"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><span class="dropdown-item-text text-muted">{{ authService.currentUser?.email }}</span></li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="javascript:void(0)" (click)="logout()">
                  <i class="fa-solid fa-right-from-bracket me-2"></i>Sair
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="app-content">
        <!-- Toolbar -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn"
              [class.btn-primary]="filter() === 'todas'"
              [class.btn-light]="filter() !== 'todas'"
              (click)="onFilterChange('todas')"
            >
              Todas
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-primary]="filter() === 'pendentes'"
              [class.btn-light]="filter() !== 'pendentes'"
              (click)="onFilterChange('pendentes')"
            >
              Pendentes
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-primary]="filter() === 'concluidas'"
              [class.btn-light]="filter() !== 'concluidas'"
              (click)="onFilterChange('concluidas')"
            >
              Concluídas
            </button>
          </div>

          <button class="btn btn-primary" (click)="openNewForm()">
            <i class="fa-solid fa-plus me-2"></i>Nova Tarefa
          </button>
        </div>

        <!-- Error Alert -->
        @if (error()) {
          <div class="alert alert-danger d-flex align-items-center mb-4" role="alert">
            <i class="fa-solid fa-circle-exclamation me-2"></i>
            <span>{{ error() }}</span>
          </div>
        }

        <!-- Loading -->
        @if (loading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="text-muted">Carregando tarefas...</p>
          </div>
        } @else if (todos().length === 0) {
          <!-- Empty State -->
          <div class="card">
            <div class="card-body text-center py-5">
              <i class="fa-solid fa-clipboard-list fa-4x text-muted mb-4"></i>
              <h4>Nenhuma tarefa encontrada</h4>
              <p class="text-muted mb-4">Clique em "Nova Tarefa" para começar a organizar suas atividades</p>
              <button class="btn btn-primary" (click)="openNewForm()">
                <i class="fa-solid fa-plus me-2"></i>Criar primeira tarefa
              </button>
            </div>
          </div>
        } @else {
          <!-- Todo List -->
          <div class="d-flex flex-column gap-3">
            @for (todo of todos(); track todo.id) {
              <div class="card todo-card" [class.completed]="todo.concluido">
                <div class="card-body d-flex align-items-start gap-3">
                  <!-- Checkbox -->
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      [checked]="todo.concluido"
                      (change)="toggleConcluido(todo)"
                      [id]="'todo-' + todo.id"
                    >
                  </div>

                  <!-- Content -->
                  <div class="flex-grow-1 cursor-pointer" (click)="openEditForm(todo)">
                    <h6 class="mb-1 todo-title" [class.text-decoration-line-through]="todo.concluido">
                      {{ todo.titulo }}
                    </h6>
                    @if (todo.descricao) {
                      <p class="text-muted small mb-2">{{ todo.descricao }}</p>
                    }
                    <small class="text-muted">
                      <i class="fa-regular fa-clock me-1"></i>
                      {{ todo.concluido ? 'Concluída em ' + formatDate(todo.dataConclusao) : 'Criada em ' + formatDate(todo.dataCriacao) }}
                    </small>
                  </div>

                  <!-- Actions -->
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
      </main>

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
    .todo-card {
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      &.completed {
        opacity: 0.7;
      }
    }

    .todo-title {
      color: var(--text-primary);
    }

    .form-check-input {
      width: 1.25rem;
      height: 1.25rem;
      margin-top: 0;
      cursor: pointer;

      &:checked {
        background-color: var(--primary);
        border-color: var(--primary);
      }
    }
  `]
})
export class TodoListComponent implements OnInit {
  todos = signal<TodoOutput[]>([]);
  loading = signal(false);
  filter = signal<FilterType>('todas');
  showForm = signal(false);
  editingTodo = signal<TodoOutput | null>(null);
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

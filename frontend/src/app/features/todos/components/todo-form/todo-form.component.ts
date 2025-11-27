import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Todo, TodoInput } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay animate__animated animate__fadeIn" (click)="onBackdropClick($event)">
      <div class="modal-container animate__animated animate__fadeInUp animate__faster">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fa-solid me-2" [ngClass]="isEditing ? 'fa-pen-to-square' : 'fa-plus'"></i>
            {{ isEditing ? 'Editar Tarefa' : 'Nova Tarefa' }}
          </h5>
          <button type="button" class="btn-close" (click)="onCancel()" aria-label="Fechar"></button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <div class="mb-3">
              <label for="titulo" class="form-label">Título</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fa-solid fa-heading"></i>
                </span>
                <input
                  type="text"
                  id="titulo"
                  class="form-control"
                  formControlName="titulo"
                  placeholder="O que você precisa fazer?"
                  [class.is-invalid]="f['titulo'].touched && f['titulo'].invalid"
                  autofocus
                />
              </div>
              @if (f['titulo'].touched && f['titulo'].errors?.['required']) {
                <div class="invalid-feedback d-block">Título é obrigatório</div>
              }
              @if (f['titulo'].touched && f['titulo'].errors?.['maxlength']) {
                <div class="invalid-feedback d-block">Máximo 200 caracteres</div>
              }
            </div>

            <div class="mb-0">
              <label for="descricao" class="form-label">
                Descrição
                <span class="text-muted fw-normal">(opcional)</span>
              </label>
              <textarea
                id="descricao"
                class="form-control"
                formControlName="descricao"
                placeholder="Adicione mais detalhes..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" (click)="onCancel()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
              <i class="fa-solid me-2" [ngClass]="isEditing ? 'fa-check' : 'fa-plus'"></i>
              {{ isEditing ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }

    .modal-container {
      background: var(--bg-card);
      border-radius: 0.625rem;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 0 50px 0 var(--shadow-color);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .modal-title {
        margin: 0;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;

        i {
          color: var(--primary);
        }
      }
    }

    .modal-body {
      padding: 2rem;
    }

    .modal-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background: var(--bg-secondary);
    }
  `]
})
export class TodoFormComponent implements OnInit {
  @Input() todo: Todo | null = null;
  @Output() save = new EventEmitter<TodoInput>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: [this.todo?.titulo || '', [Validators.required, Validators.maxLength(200)]],
      descricao: [this.todo?.descricao || '']
    });
  }

  get isEditing(): boolean {
    return !!this.todo;
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onCancel();
    }
  }
}

import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Todo, TodoInput } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Tarefa' : 'Nova Tarefa' }}</h2>
          <button type="button" class="close-btn" (click)="onCancel()">×</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="titulo">Título</label>
            <input
              type="text"
              id="titulo"
              formControlName="titulo"
              placeholder="O que você precisa fazer?"
              [class.invalid]="f['titulo'].touched && f['titulo'].invalid"
              autofocus
            />
            @if (f['titulo'].touched && f['titulo'].errors?.['required']) {
              <span class="error">Título é obrigatório</span>
            }
            @if (f['titulo'].touched && f['titulo'].errors?.['maxlength']) {
              <span class="error">Máximo 200 caracteres</span>
            }
          </div>

          <div class="form-group">
            <label for="descricao">Descrição <span class="optional">(opcional)</span></label>
            <textarea
              id="descricao"
              formControlName="descricao"
              placeholder="Adicione mais detalhes..."
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">
              {{ isEditing ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.2s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;

      h2 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      color: #999;
      cursor: pointer;
      padding: 0;
      line-height: 1;

      &:hover {
        color: #333;
      }
    }

    form {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      color: #444;
      font-weight: 500;
    }

    .optional {
      color: #999;
      font-weight: 400;
      font-size: 13px;
    }

    input, textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      font-family: inherit;
      transition: border-color 0.2s;
      box-sizing: border-box;
      resize: vertical;

      &:focus {
        outline: none;
        border-color: #667eea;
      }

      &.invalid {
        border-color: #e53935;
      }
    }

    .error {
      color: #e53935;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 8px;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: #f5f5f5;
      color: #666;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #eee;
      }
    }

    .btn-primary {
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
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
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onCancel();
    }
  }
}

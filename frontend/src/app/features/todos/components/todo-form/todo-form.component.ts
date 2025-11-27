import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Todo, TodoInput } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-container">
        <div class="modal-header">
          <h2>
            <mat-icon>{{ isEditing ? 'edit' : 'add_task' }}</mat-icon>
            {{ isEditing ? 'Editar Tarefa' : 'Nova Tarefa' }}
          </h2>
          <button mat-icon-button (click)="onCancel()" aria-label="Fechar">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="modal-content">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input
                matInput
                type="text"
                formControlName="titulo"
                placeholder="O que você precisa fazer?"
                cdkFocusInitial
              />
              <mat-icon matSuffix>title</mat-icon>
              @if (f['titulo'].touched && f['titulo'].errors?.['required']) {
                <mat-error>Título é obrigatório</mat-error>
              }
              @if (f['titulo'].touched && f['titulo'].errors?.['maxlength']) {
                <mat-error>Máximo 200 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descrição (opcional)</mat-label>
              <textarea
                matInput
                formControlName="descricao"
                placeholder="Adicione mais detalhes..."
                rows="4"
              ></textarea>
              <mat-icon matSuffix>notes</mat-icon>
            </mat-form-field>
          </div>

          <div class="modal-actions">
            <button mat-button type="button" (click)="onCancel()">
              Cancelar
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              <mat-icon>{{ isEditing ? 'save' : 'add' }}</mat-icon>
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

    .modal-container {
      background: var(--bg-card);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.2s ease;
      overflow: hidden;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-primary);

        mat-icon {
          color: var(--primary-color);
        }
      }
    }

    .modal-content {
      padding: 24px;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);

      button mat-icon {
        margin-right: 8px;
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

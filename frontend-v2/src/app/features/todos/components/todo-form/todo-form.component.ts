import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TodoInput, TodoOutput } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="todo ? 'Editar Tarefa' : 'Nova Tarefa'"
      [modal]="true"
      [style]="{ width: '450px' }"
      [closable]="true"
      (onHide)="onCancel()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="flex flex-col gap-4">
          <div>
            <label for="titulo" class="block font-medium mb-2">Título *</label>
            <input
              pInputText
              id="titulo"
              formControlName="titulo"
              class="w-full"
              placeholder="Digite o título da tarefa"
            />
            @if (form.get('titulo')?.invalid && form.get('titulo')?.touched) {
              <small class="text-red-500">Título é obrigatório (1-200 caracteres)</small>
            }
          </div>

          <div>
            <label for="descricao" class="block font-medium mb-2">Descrição</label>
            <textarea
              pTextarea
              id="descricao"
              formControlName="descricao"
              class="w-full"
              rows="4"
              placeholder="Digite uma descrição (opcional)"
            ></textarea>
            @if (form.get('descricao')?.invalid && form.get('descricao')?.touched) {
              <small class="text-red-500">Descrição deve ter no máximo 1000 caracteres</small>
            }
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <p-button
            type="button"
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            (onClick)="onCancel()"
          />
          <p-button
            type="submit"
            [label]="todo ? 'Salvar' : 'Criar'"
            [loading]="loading()"
            [disabled]="form.invalid || loading()"
          />
        </div>
      </form>
    </p-dialog>
  `
})
export class TodoFormComponent implements OnChanges {
  @Input() visible = false;
  @Input() todo: TodoOutput | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<TodoOutput>();

  form: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private todoService: TodoService
  ) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      descricao: ['', [Validators.maxLength(1000)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo'] || changes['visible']) {
      if (this.visible) {
        if (this.todo) {
          this.form.patchValue({
            titulo: this.todo.titulo,
            descricao: this.todo.descricao || ''
          });
        } else {
          this.form.reset();
        }
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const input: TodoInput = this.form.value;

    const request$ = this.todo
      ? this.todoService.update(this.todo.id, input)
      : this.todoService.create(input);

    request$.subscribe({
      next: (result) => {
        this.loading.set(false);
        this.saved.emit(result);
        this.close();
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Erro ao salvar tarefa:', error);
      }
    });
  }

  onCancel(): void {
    this.close();
  }

  private close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset();
  }
}

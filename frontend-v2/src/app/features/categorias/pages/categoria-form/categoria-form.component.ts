import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CategoriaService } from '../../services/categoria.service';
import { CategoriaInput } from '../../../../core/api/models/categoria-input';
import { CulinariaService } from '../../../../core/services/culinaria.service';
import { CulinariaOutput } from '../../../../core/api/models/culinaria-output';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    FormsModule,
    InputNumberModule,
    CheckboxModule,
    ToastModule,
    CardModule,
    DividerModule,
    ChipModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="card max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Gestão de cardápio</p>
          <h2 class="text-2xl font-bold m-0">
            {{ isEditMode() ? 'Editar Categoria' : 'Nova Categoria' }}
          </h2>
        </div>
        <div class="flex gap-2">
          <p-button label="Voltar" severity="secondary" icon="pi pi-arrow-left" (onClick)="goBack()" [text]="true" />
          <p-button label="Salvar" icon="pi pi-check" (onClick)="submit()" [loading]="saving()" />
        </div>
      </div>

      <form class="grid grid-cols-1 md:grid-cols-2 gap-6" [formGroup]="form" (ngSubmit)="submit()">
        <div class="space-y-4">
          <div class="field">
            <label class="block text-sm font-semibold mb-2">Culinária *</label>
            <p-select
              formControlName="id_culinaria"
              [options]="culinarias()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione a culinária"
            />
            <p class="text-sm text-red-500 mt-1" *ngIf="invalid('id_culinaria')">Obrigatório</p>
          </div>

          <div class="field">
            <label class="block text-sm font-semibold mb-2">Nome *</label>
            <input pInputText formControlName="nome" placeholder="Ex: Açaís" />
            <p class="text-sm text-red-500 mt-1" *ngIf="invalid('nome')">Informe um nome</p>
          </div>

          <div class="field">
            <label class="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              pTextarea
              rows="3"
              formControlName="descricao"
              placeholder="Breve descrição para o cliente"
            ></textarea>
          </div>

          <div class="field">
            <label class="block text-sm font-semibold mb-2">Opção meia (pizzas)</label>
            <p-select
              formControlName="opcao_meia"
              [options]="opcaoMeiaOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Sem meia"
            />
          </div>

          <div class="field">
            <label class="block text-sm font-semibold mb-2">Ordem no cardápio</label>
            <p-inputNumber formControlName="ordem" mode="decimal" [useGrouping]="false" />
          </div>
        </div>

        <div class="space-y-4">
          <div class="field">
            <label class="block text-sm font-semibold mb-2">Opções (tamanhos/variações) *</label>
            <div class="flex gap-2">
              <input
                pInputText
                [(ngModel)]="novaOpcao"
                [ngModelOptions]="{ standalone: true }"
                name="novaOpcao"
                placeholder="Digite e pressione Enter"
                (keyup.enter)="addOpcao()"
                class="w-full"
              />
              <p-button icon="pi pi-plus" [text]="true" (onClick)="addOpcao()" />
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <p-chip
                *ngFor="let op of opcoesValue(); trackBy: trackByOp"
                [label]="op"
                [removable]="true"
                (onRemove)="removeOpcao(op)"
                styleClass="px-3 py-2"
              />
            </div>
            <p class="text-sm text-red-500 mt-1" *ngIf="invalid('opcoes')">Cadastre ao menos uma opção</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold mb-2">Início</label>
              <input pInputText formControlName="inicio" placeholder="HH:mm" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Fim</label>
              <input pInputText formControlName="fim" placeholder="HH:mm" />
            </div>
            <div class="col-span-2 text-sm text-surface-500" *ngIf="invalid('horario')">
              Informe início e fim (HH:mm) e certifique-se que início < fim.
            </div>
          </div>

          <div class="border border-surface-200 rounded-lg p-4">
            <div class="font-semibold mb-3">Disponibilidade</div>
            <div class="grid grid-cols-3 gap-3 text-sm">
              @for (dia of diasSemana; track dia.control) {
                <label class="flex items-center gap-2">
                  <p-checkbox [binary]="true" [formControlName]="dia.control" />
                  <span>{{ dia.label }}</span>
                </label>
              }
            </div>
          </div>
        </div>
      </form>

      <p-divider />
      <div class="flex justify-end gap-2">
        <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="goBack()" />
        <p-button label="Salvar" icon="pi pi-check" (onClick)="submit()" [loading]="saving()" />
      </div>
    </div>
  `
})
export class CategoriaFormComponent implements OnInit {
  form: FormGroup<{
    id_culinaria: FormControl<number | null>;
    nome: FormControl<string>;
    descricao: FormControl<string>;
    opcao_meia: FormControl<string>;
    opcoes: FormControl<string[]>;
    ordem: FormControl<number | null>;
    inicio: FormControl<string>;
    fim: FormControl<string>;
    domingo: FormControl<boolean>;
    segunda: FormControl<boolean>;
    terca: FormControl<boolean>;
    quarta: FormControl<boolean>;
    quinta: FormControl<boolean>;
    sexta: FormControl<boolean>;
    sabado: FormControl<boolean>;
  }>;

  saving = signal(false);
  isEditMode = signal(false);
  currentId: number | null = null;

  culinarias = signal<CulinariaOutput[]>([]);
  novaOpcao = '';

  opcaoMeiaOptions = [
    { label: 'Sem meia', value: '' },
    { label: 'Metade pelo valor médio (M)', value: 'M' },
    { label: 'Metade pelo maior valor (V)', value: 'V' }
  ];

  diasSemana = [
    { label: 'Domingo', control: 'domingo' },
    { label: 'Segunda', control: 'segunda' },
    { label: 'Terça', control: 'terca' },
    { label: 'Quarta', control: 'quarta' },
    { label: 'Quinta', control: 'quinta' },
    { label: 'Sexta', control: 'sexta' },
    { label: 'Sábado', control: 'sabado' }
  ];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private culinariaService: CulinariaService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = new FormGroup(
      {
        id_culinaria: new FormControl<number | null>(null, { validators: Validators.required }),
        nome: new FormControl<string>('', {
          nonNullable: true,
          validators: [Validators.required, Validators.maxLength(150)]
        }),
        descricao: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
        opcao_meia: new FormControl<string>('', { nonNullable: true }),
        opcoes: new FormControl<string[]>([], {
          nonNullable: true,
          validators: [Validators.required, this.minArrayLength(1)]
        }),
        ordem: new FormControl<number | null>(null),
        inicio: new FormControl<string>('', { nonNullable: true }),
        fim: new FormControl<string>('', { nonNullable: true }),
        domingo: new FormControl<boolean>(false, { nonNullable: true }),
        segunda: new FormControl<boolean>(true, { nonNullable: true }),
        terca: new FormControl<boolean>(true, { nonNullable: true }),
        quarta: new FormControl<boolean>(true, { nonNullable: true }),
        quinta: new FormControl<boolean>(true, { nonNullable: true }),
        sexta: new FormControl<boolean>(true, { nonNullable: true }),
        sabado: new FormControl<boolean>(true, { nonNullable: true })
      },
      { validators: (ctrl) => this.horarioValidator(ctrl) }
    );
  }

  ngOnInit(): void {
    this.loadCulinarias();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentId = Number(id);
      this.loadCategoria(this.currentId);
    }
  }

  loadCulinarias(): void {
    this.culinariaService.listar().subscribe({
      next: (data) => this.culinarias.set(data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as culinárias'
        })
    });
  }

  loadCategoria(id: number): void {
    this.categoriaService.buscar(id).subscribe({
      next: (cat) => {
        this.form.patchValue({
          id_culinaria: cat.id_culinaria,
          nome: cat.nome,
          descricao: cat.descricao || '',
          opcao_meia: cat.opcao_meia ?? '',
          ordem: cat.ordem ?? null,
          inicio: cat.inicio ?? '',
          fim: cat.fim ?? '',
          domingo: cat.disponivel?.domingo ?? false,
          segunda: cat.disponivel?.segunda ?? true,
          terca: cat.disponivel?.terca ?? true,
          quarta: cat.disponivel?.quarta ?? true,
          quinta: cat.disponivel?.quinta ?? true,
          sexta: cat.disponivel?.sexta ?? true,
          sabado: cat.disponivel?.sabado ?? true
        });
        const nomes = (cat.opcoes || []).map((o) => o.nome);
        this.form.get('opcoes')?.setValue(nomes);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Categoria não encontrada'
        });
        this.goBack();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Revise os campos destacados'
      });
      return;
    }

    this.saving.set(true);
    const payload = this.mapToPayload();

    const request$ = this.isEditMode()
      ? this.categoriaService.atualizar(this.currentId!, payload)
      : this.categoriaService.criar(payload);

    request$.subscribe({
      next: (resp) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode() ? 'Categoria atualizada' : 'Categoria criada'
        });
        this.router.navigate(['/app/categorias']);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.detail || 'Não foi possível salvar a categoria'
        });
      }
    });
  }

  mapToPayload(): CategoriaInput {
    const value = this.form.getRawValue();
    const opcoes = (value.opcoes || [])
      .map((o: string) => o?.toString().trim())
      .filter((o: string) => !!o) as string[];

    const payload: CategoriaInput = {
      id_culinaria: value.id_culinaria!,
      nome: value.nome.trim(),
      descricao: value.descricao?.trim() || undefined,
      opcao_meia: value.opcao_meia ?? '',
      opcoes,
      ordem: value.ordem ?? undefined,
      disponivel: {
        domingo: value.domingo ?? false,
        segunda: value.segunda ?? false,
        terca: value.terca ?? false,
        quarta: value.quarta ?? false,
        quinta: value.quinta ?? false,
        sexta: value.sexta ?? false,
        sabado: value.sabado ?? false
      }
    };

    if (value.inicio && value.fim) {
      payload.inicio = value.inicio;
      payload.fim = value.fim;
    }

    return payload;
  }

  goBack(): void {
    this.router.navigate(['/app/categorias']);
  }

  invalid(controlName: string): boolean {
    if (controlName === 'horario') {
      return !!this.form.errors?.['horario'] && this.form.touched;
    }
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  minArrayLength(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as any[];
      return value && value.length >= min ? null : { minArray: true };
    };
  }

  horarioValidator(group: AbstractControl): ValidationErrors | null {
    const inicio = group.get('inicio')?.value;
    const fim = group.get('fim')?.value;
    if (!inicio && !fim) return null;
    if (!inicio || !fim) return { horario: true };
    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map((v) => Number(v));
      return h * 60 + m;
    };
    if (!/^[0-2][0-9]:[0-5][0-9]$/.test(inicio) || !/^[0-2][0-9]:[0-5][0-9]$/.test(fim)) {
      return { horario: true };
    }
    if (toMinutes(inicio) >= toMinutes(fim)) {
      return { horario: true };
    }
    return null;
  }

  opcoesValue(): string[] {
    return this.form.controls.opcoes.value ?? [];
  }

  addOpcao(): void {
    const value = this.novaOpcao.trim();
    if (!value) {
      return;
    }
    const current = this.opcoesValue();
    if (!current.includes(value)) {
      const updated = [...current, value];
      this.form.get('opcoes')?.setValue(updated);
      this.form.get('opcoes')?.markAsDirty();
      this.form.get('opcoes')?.updateValueAndValidity();
    }
    this.novaOpcao = '';
  }

  removeOpcao(op: string): void {
    const updated = this.opcoesValue().filter((o) => o !== op);
    this.form.get('opcoes')?.setValue(updated);
    this.form.get('opcoes')?.markAsDirty();
    this.form.get('opcoes')?.updateValueAndValidity();
  }

  trackByOp(_index: number, op: string): string {
    return op;
  }
}

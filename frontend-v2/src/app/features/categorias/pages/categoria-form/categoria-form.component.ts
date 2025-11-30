import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
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
import { TenantService } from '../../../../core/services/tenant.service';
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
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { InputMaskModule } from 'primeng/inputmask';
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
    ChipModule,
    AutoCompleteModule,
    InputMaskModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="card">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Gestao de cardapio</p>
          <h2 class="text-2xl font-bold m-0">
            {{ isEditMode() ? 'Editar Categoria' : 'Nova Categoria' }}
          </h2>
        </div>
        <div class="flex gap-2">
          <p-button label="Voltar" severity="secondary" icon="pi pi-arrow-left" (onClick)="goBack()" [text]="true" />
          <p-button label="Salvar" icon="pi pi-check" (onClick)="submit()" [loading]="saving()" />
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <!-- Secao: Dados Basicos -->
        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="pi pi-info-circle text-primary"></i>
            Dados Basicos
          </h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Culinaria com AutoComplete -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Culinaria *</label>
              <p-autocomplete
                formControlName="culinariaSelecionada"
                [suggestions]="culinariasFiltradas()"
                (completeMethod)="filtrarCulinarias($event)"
                optionLabel="nome"
                placeholder="Digite para buscar a culinaria..."
                [dropdown]="true"
                [forceSelection]="true"
                [showClear]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
              >
                <ng-template let-culinaria #item>
                  <div class="flex items-center justify-between w-full gap-2">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-compass text-primary"></i>
                      <span>{{ culinaria.nome }}</span>
                    </div>
                    @if (culinaria.meioMeio) {
                      <span class="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                        <i class="pi pi-check-circle mr-1"></i>Meio a meio
                      </span>
                    }
                  </div>
                </ng-template>
              </p-autocomplete>
              <small class="text-red-500" *ngIf="invalid('culinariaSelecionada')">Selecione uma culinaria</small>
            </div>

            <!-- Nome -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Nome da Categoria *</label>
              <input
                pInputText
                formControlName="nome"
                placeholder="Ex: Acais, Pizzas, Bebidas..."
                class="w-full"
              />
              <small class="text-red-500" *ngIf="invalid('nome')">Informe um nome (max. 150 caracteres)</small>
            </div>

            <!-- Descricao -->
            <div class="flex flex-col gap-2 lg:col-span-2">
              <label class="font-semibold">Descricao</label>
              <textarea
                pTextarea
                rows="3"
                formControlName="descricao"
                placeholder="Breve descricao para o cliente (opcional)"
                class="w-full"
              ></textarea>
            </div>

            <!-- Ordem -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Ordem no cardapio</label>
              <p-inputNumber
                formControlName="ordem"
                mode="decimal"
                [useGrouping]="false"
                placeholder="Ex: 1, 2, 3..."
                styleClass="w-full"
                inputStyleClass="w-full"
              />
              <small class="text-surface-500">Define a posicao desta categoria no cardapio</small>
            </div>

            <!-- Opcao Meia -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold flex items-center gap-2">
                Opcao meia (pizzas)
                @if (!culinariaSupportsMeioMeio()) {
                  <span class="text-xs text-surface-400 font-normal">(culinaria nao suporta)</span>
                }
              </label>
              <p-select
                formControlName="opcao_meia"
                [options]="opcaoMeiaOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Sem meia"
                styleClass="w-full"
                [disabled]="!culinariaSupportsMeioMeio()"
              />
              <small class="text-surface-500">
                @if (culinariaSupportsMeioMeio()) {
                  Para categorias de pizza com meia/meia
                } @else {
                  Selecione uma culinaria que suporte meio a meio para habilitar
                }
              </small>
            </div>
          </div>
        </div>

        <!-- Secao: Opcoes/Tamanhos -->
        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="pi pi-list text-primary"></i>
            Opcoes (Tamanhos/Variacoes) *
          </h3>

          <div class="flex flex-col gap-4">
            <div class="flex gap-2">
              <input
                pInputText
                [(ngModel)]="novaOpcao"
                [ngModelOptions]="{ standalone: true }"
                placeholder="Digite uma opcao e pressione Enter (ex: Pequeno, Medio, Grande)"
                (keyup.enter)="addOpcao()"
                class="flex-1"
              />
              <p-button
                icon="pi pi-plus"
                label="Adicionar"
                (onClick)="addOpcao()"
                [outlined]="true"
              />
            </div>

            <div class="flex flex-wrap gap-2 min-h-12 p-3 bg-surface-0 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
              @if (opcoesValue().length === 0) {
                <span class="text-surface-400 text-sm">Nenhuma opcao adicionada</span>
              } @else {
                @for (op of opcoesValue(); track op) {
                  <p-chip
                    [label]="op"
                    [removable]="true"
                    (onRemove)="removeOpcao(op)"
                    styleClass="text-sm"
                  />
                }
              }
            </div>
            <small class="text-red-500" *ngIf="invalid('opcoes')">Cadastre ao menos uma opcao</small>
          </div>
        </div>

        <!-- Secao: Horario e Disponibilidade -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Horario -->
          <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i class="pi pi-clock text-primary"></i>
              Horario de Funcionamento
            </h3>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">Inicio</label>
                <p-inputMask
                  formControlName="inicio"
                  mask="99:99"
                  placeholder="00:00"
                  slotChar="HH:MM"
                  styleClass="w-full"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-semibold">Fim</label>
                <p-inputMask
                  formControlName="fim"
                  mask="99:99"
                  placeholder="23:59"
                  slotChar="HH:MM"
                  styleClass="w-full"
                />
              </div>
            </div>

            <small class="text-surface-500 block mt-3">
              <i class="pi pi-info-circle mr-1"></i>
              Deixe vazio para disponivel o dia todo
            </small>
            <small class="text-red-500 block mt-1" *ngIf="invalid('horario')">
              Horario invalido. Preencha ambos (HH:MM) com inicio menor que fim.
            </small>
          </div>

          <!-- Disponibilidade -->
          <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i class="pi pi-calendar text-primary"></i>
              Dias Disponiveis
            </h3>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              @for (dia of diasSemana; track dia.control) {
                <label class="flex items-center gap-2 p-3 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                  <p-checkbox [binary]="true" [formControlName]="dia.control" />
                  <span class="text-sm font-medium">{{ dia.label }}</span>
                </label>
              }
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p-divider />
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <p-button
            label="Cancelar"
            severity="secondary"
            [text]="true"
            (onClick)="goBack()"
            styleClass="w-full sm:w-auto"
          />
          <p-button
            label="Salvar Categoria"
            icon="pi pi-check"
            (onClick)="submit()"
            [loading]="saving()"
            styleClass="w-full sm:w-auto"
          />
        </div>
      </form>
    </div>
  `
})
export class CategoriaFormComponent implements OnInit {
  private tenantService = inject(TenantService);

  form: FormGroup<{
    culinariaSelecionada: FormControl<CulinariaOutput | null>;
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
  culinariasFiltradas = signal<CulinariaOutput[]>([]);
  culinariaSelecionada = signal<CulinariaOutput | null>(null);
  novaOpcao = '';

  private currentOrgId: number | null = null;

  // Verifica se culinaria selecionada suporta meio a meio
  culinariaSupportsMeioMeio = computed(() => {
    const culinaria = this.culinariaSelecionada();
    return culinaria?.meioMeio === true;
  });

  opcaoMeiaOptions = [
    { label: 'Sem meia', value: '' },
    { label: 'Metade pelo valor medio (M)', value: 'M' },
    { label: 'Metade pelo maior valor (V)', value: 'V' }
  ];

  diasSemana = [
    { label: 'Domingo', control: 'domingo' },
    { label: 'Segunda', control: 'segunda' },
    { label: 'Terca', control: 'terca' },
    { label: 'Quarta', control: 'quarta' },
    { label: 'Quinta', control: 'quinta' },
    { label: 'Sexta', control: 'sexta' },
    { label: 'Sabado', control: 'sabado' }
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
        culinariaSelecionada: new FormControl<CulinariaOutput | null>(null, { validators: Validators.required }),
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

    // Redireciona para listagem se a organizacao mudar durante edicao
    // (ao criar, nao redireciona pois a nova categoria sera da org atual)
    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId) {
        // So redireciona se estiver EDITANDO e a org mudou
        if (this.isEditMode() && this.currentOrgId !== null && orgId !== this.currentOrgId) {
          this.messageService.add({
            severity: 'info',
            summary: 'Organizacao alterada',
            detail: 'Voce foi redirecionado para a listagem de categorias'
          });
          this.router.navigate(['/app/categorias']);
        }
        this.currentOrgId = orgId;
      }
    });

    // Escuta mudancas na culinaria selecionada
    this.form.controls.culinariaSelecionada.valueChanges.subscribe((culinaria) => {
      this.culinariaSelecionada.set(culinaria);
      // Reseta opcao_meia se culinaria nao suporta meio a meio
      if (!culinaria?.meioMeio) {
        this.form.controls.opcao_meia.setValue('');
      }
    });
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
      next: (data) => {
        this.culinarias.set(data);
        this.culinariasFiltradas.set(data);
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel carregar as culinarias'
        })
    });
  }

  filtrarCulinarias(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const filtered = this.culinarias().filter((c) => c.nome?.toLowerCase().includes(query));
    this.culinariasFiltradas.set(filtered);
  }

  loadCategoria(id: number): void {
    this.categoriaService.buscar(id).subscribe({
      next: (cat) => {
        // Encontra a culinaria selecionada
        const culinariaSelecionadaObj = this.culinarias().find((c) => c.id === cat.id_culinaria) || null;
        this.culinariaSelecionada.set(culinariaSelecionadaObj);

        this.form.patchValue({
          culinariaSelecionada: culinariaSelecionadaObj,
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
          detail: 'Categoria nao encontrada'
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
        summary: 'Campos obrigatorios',
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
          detail: err?.error?.detail || 'Nao foi possivel salvar a categoria'
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
      id_culinaria: value.culinariaSelecionada?.id!,
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

    // Limpa mascara se incompleta
    const inicioLimpo = value.inicio?.replace(/_/g, '').trim();
    const fimLimpo = value.fim?.replace(/_/g, '').trim();

    if (inicioLimpo && fimLimpo && inicioLimpo.length === 5 && fimLimpo.length === 5) {
      payload.inicio = inicioLimpo;
      payload.fim = fimLimpo;
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
    const inicio = group.get('inicio')?.value?.replace(/_/g, '').trim();
    const fim = group.get('fim')?.value?.replace(/_/g, '').trim();

    // Se ambos vazios, OK
    if (!inicio && !fim) return null;

    // Se apenas um preenchido, erro
    if (!inicio || !fim) return { horario: true };

    // Valida formato
    if (!/^[0-2][0-9]:[0-5][0-9]$/.test(inicio) || !/^[0-2][0-9]:[0-5][0-9]$/.test(fim)) {
      return { horario: true };
    }

    // Valida hora valida (00-23)
    const hInicio = parseInt(inicio.split(':')[0]);
    const hFim = parseInt(fim.split(':')[0]);
    if (hInicio > 23 || hFim > 23) return { horario: true };

    // Valida inicio < fim
    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map((v) => Number(v));
      return h * 60 + m;
    };
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
}

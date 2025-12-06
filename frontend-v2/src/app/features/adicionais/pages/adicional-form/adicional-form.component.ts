import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdicionalService } from '../../services/adicional.service';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { AdicionalInput } from '../../../../core/api/models/adicional-input';
import { CategoriaOutput } from '../../../../core/api/models/categoria-output';
import { AdicionalOutput } from '../../../../core/api/models/adicional-output';
import { TenantService } from '../../../../core/services/tenant.service';

@Component({
  selector: 'app-adicional-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    CardModule,
    DividerModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="card">
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Gestao de cardapio</p>
          <h2 class="text-2xl font-bold m-0">
            {{ isEditMode ? 'Editar Adicional' : 'Novo Adicional' }}
          </h2>
        </div>
        <div class="flex gap-2">
          <p-button label="Voltar" severity="secondary" icon="pi pi-arrow-left" (onClick)="goBack()" [text]="true" />
          <p-button label="Salvar" icon="pi pi-check" (onClick)="submit()" [loading]="saving()" />
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="pi pi-info-circle text-primary"></i>
            Dados basicos
          </h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Categoria *</label>
              <p-select
                formControlName="categoria"
                [options]="categoriaOptions()"
                optionLabel="nome"
                optionValue="id_categoria"
                placeholder="Selecione a categoria"
                [filter]="true"
                [showClear]="true"
                filterBy="nome"
                styleClass="w-full"
                [invalid]="invalid('categoria')"
              />
              <small class="text-red-500" *ngIf="invalid('categoria')">Selecione uma categoria</small>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Nome do adicional *</label>
              <input
                pInputText
                formControlName="nome"
                placeholder="Ex: Escolha um adicional"
                [ngClass]="{'w-full': true, 'ng-invalid ng-dirty': invalid('nome')}"
              />
              <small class="text-red-500" *ngIf="invalid('nome')">Informe um nome (max. 150 caracteres)</small>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Tipo de selecao *</label>
              <p-select
                formControlName="selecao"
                [options]="selecaoOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o tipo"
                styleClass="w-full"
                [invalid]="invalid('selecao')"
              />
              <small class="text-xs text-surface-500">
                U = Unico (obrigatorio); M = Multiplo; Q = Quantidade multipla com minimo/limite.
              </small>
              <small class="text-red-500" *ngIf="invalid('selecao')">Selecione o tipo de selecao</small>
            </div>
          </div>
        </div>

        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="pi pi-sliders-h text-primary"></i>
            Regras de selecao
          </h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="form.get('selecao')?.value === 'M' || form.get('selecao')?.value === 'Q'">
            <div class="flex flex-col gap-2" *ngIf="form.get('selecao')?.value === 'Q'">
              <label class="font-semibold">Minimo *</label>
              <p-inputNumber
                formControlName="minimo"
                [min]="0"
                [useGrouping]="false"
                inputStyleClass="w-full"
                [invalid]="invalidMinimo()"
              />
              <small class="text-xs text-surface-500">
                0 = opcional, maior que 0 = obrigatorio escolher ao menos X
              </small>
              <small class="text-red-500" *ngIf="invalidMinimo()">
                {{ getMinimoErrorMessage() }}
              </small>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">
                Limite {{ form.get('selecao')?.value === 'Q' ? '*' : '(opcional)' }}
              </label>
              <p-inputNumber
                formControlName="limite"
                [min]="1"
                [useGrouping]="false"
                inputStyleClass="w-full"
                [invalid]="invalidLimite()"
              />
              <small class="text-xs text-surface-500" *ngIf="form.get('selecao')?.value === 'M'">
                Limite maximo de adicionais (deixe vazio para ilimitado)
              </small>
              <small class="text-red-500" *ngIf="invalidLimite()">
                Limite e obrigatorio para selecao "Q" (minimo 1)
              </small>
            </div>
          </div>

          <p class="text-surface-500 text-sm" *ngIf="form.get('selecao')?.value === 'U'">
            Selecao unica nao requer configuracao de minimo/limite.
          </p>

          <p class="text-surface-500 text-sm" *ngIf="!form.get('selecao')?.value">
            Selecione o tipo de selecao para configurar as regras.
          </p>
        </div>

        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="pi pi-plus-circle text-primary"></i>
            Opcoes de adicionais *
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4" [formGroup]="opcaoForm">
            <div class="flex flex-col gap-2 md:col-span-1">
              <label class="font-semibold">Nome da opcao *</label>
              <input
                pInputText
                formControlName="nome"
                placeholder="Ex: Chocolate, Morango..."
                [ngClass]="{'w-full': true, 'ng-invalid ng-dirty': invalidOpcaoField('nome')}"
              />
              <small class="text-red-500" *ngIf="invalidOpcaoField('nome')">Informe o nome da opcao</small>
            </div>

            <div class="flex flex-col gap-2 md:col-span-1">
              <label class="font-semibold">Valor *</label>
              <p-inputNumber
                formControlName="valor"
                [min]="0"
                [mode]="'currency'"
                currency="BRL"
                locale="pt-BR"
                inputStyleClass="w-full"
                [invalid]="invalidOpcaoField('valor')"
              />
              <small class="text-red-500" *ngIf="invalidOpcaoField('valor')">Informe o valor da opcao</small>
            </div>

            <div class="md:col-span-3 flex justify-end">
              <p-button label="Adicionar opcao" icon="pi pi-plus" (onClick)="addOpcao()" />
            </div>
          </div>

          @if (opcoesArray.length > 0) {
            <div class="space-y-3" formArrayName="opcoes">
              @for (opcaoGroup of opcoesArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="flex items-center gap-4 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-4 py-3">
                  <div class="flex-1 flex flex-col gap-1">
                    <label class="text-xs text-surface-500">Nome</label>
                    <input
                      pInputText
                      formControlName="nome"
                      class="w-full"
                    />
                  </div>
                  <div class="w-40 flex flex-col gap-1">
                    <label class="text-xs text-surface-500">Valor</label>
                    <p-inputNumber
                      formControlName="valor"
                      [min]="0"
                      mode="currency"
                      currency="BRL"
                      locale="pt-BR"
                      inputStyleClass="w-full"
                      styleClass="w-full"
                    />
                  </div>
                  <div class="flex items-center">
                    <p-button
                      icon="pi pi-trash"
                      [text]="true"
                      severity="danger"
                      [rounded]="true"
                      (onClick)="removeOpcao(i)"
                    />
                  </div>
                </div>
              }
            </div>
          } @else {
            <div
              class="p-4 rounded-lg border"
              [ngClass]="{
                'border-dashed border-surface-300 dark:border-surface-600 text-surface-500': !opcoesInvalidas,
                'border-solid border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20': opcoesInvalidas
              }"
            >
              @if (opcoesInvalidas) {
                <div class="flex items-center gap-3 text-red-700 dark:text-red-400">
                  <i class="pi pi-exclamation-triangle text-xl"></i>
                  <span class="font-medium">Adicione ao menos uma opcao para este adicional</span>
                </div>
              } @else {
                <span>Nenhuma opcao adicionada. Informe o nome e valor para adicionar uma opcao.</span>
              }
            </div>
          }
        </div>
      </form>
    </div>
  `
})
export class AdicionalFormComponent implements OnInit {
  private tenantService = inject(TenantService);

  form: FormGroup<{
    categoria: FormControl<number | null>;
    nome: FormControl<string>;
    selecao: FormControl<'U' | 'M' | 'Q' | null>;
    minimo: FormControl<number | null>;
    limite: FormControl<number | null>;
    opcoes: FormArray<FormGroup<{
      id_item: FormControl<number | null>;
      nome: FormControl<string>;
      valor: FormControl<number>;
      status: FormControl<boolean>;
    }>>;
  }>;

  opcaoForm: FormGroup<{
    nome: FormControl<string>;
    valor: FormControl<number | null>;
  }>;

  categoriaOptions = signal<CategoriaOutput[]>([]);
  opcoesInvalidas = false;
  saving = signal(false);

  selecaoOptions = [
    { label: 'Unico (obrigatorio)', value: 'U' },
    { label: 'Multiplo (livre)', value: 'M' },
    { label: 'Quantidade multipla', value: 'Q' }
  ];

  private currentId: number | null = null;

  get opcoesArray() {
    return this.form.controls.opcoes;
  }

  constructor(
    private adicionalService: AdicionalService,
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = new FormGroup({
      categoria: new FormControl<number | null>(null, { validators: [Validators.required] }),
      nome: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(150)]
      }),
      selecao: new FormControl<'U' | 'M' | 'Q' | null>(null, { validators: [Validators.required] }),
      minimo: new FormControl<number | null>(null),
      limite: new FormControl<number | null>(null),
      opcoes: new FormArray<FormGroup<{
        id_item: FormControl<number | null>;
        nome: FormControl<string>;
        valor: FormControl<number>;
        status: FormControl<boolean>;
      }>>([])
    });

    this.opcaoForm = new FormGroup({
      nome: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      valor: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)]
      })
    });

    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId) {
        this.loadCategorias();
      }
    });
  }

  private createOpcaoGroup(nome: string, valor: number, idItem?: number, status: boolean = true) {
    return new FormGroup({
      id_item: new FormControl<number | null>(idItem ?? null),
      nome: new FormControl<string>(nome, { nonNullable: true, validators: [Validators.required] }),
      valor: new FormControl<number>(valor, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
      status: new FormControl<boolean>(status, { nonNullable: true })
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.currentId = Number(idParam);
      this.loadAdicional(this.currentId);
    }
  }

  get isEditMode(): boolean {
    return this.currentId !== null;
  }


  get formInvalidRegras(): boolean {
    return this.invalidMinimo() || this.invalidLimite();
  }

  invalidMinimo(): boolean {
    const selecao = this.form.controls.selecao.value;
    const minimo = this.form.controls.minimo.value;
    const limite = this.form.controls.limite.value;
    const formTouched = this.form.touched || this.form.dirty;

    if (selecao === 'Q') {
      // Minimo e obrigatorio para selecao Q (deve ser >= 0)
      if (minimo === null && formTouched) {
        return true;
      }
      // Minimo nao pode ser maior que limite
      if (minimo !== null && limite !== null && minimo > limite) {
        return true;
      }
    }
    return false;
  }

  getMinimoErrorMessage(): string {
    const minimo = this.form.controls.minimo.value;
    const limite = this.form.controls.limite.value;

    if (minimo === null) {
      return 'Minimo e obrigatorio (deve ser >= 0)';
    }
    if (limite !== null && minimo > limite) {
      return 'Minimo nao pode ser maior que o limite';
    }
    return '';
  }

  invalidLimite(): boolean {
    const selecao = this.form.controls.selecao.value;
    const limite = this.form.controls.limite.value;
    const formTouched = this.form.touched || this.form.dirty;

    if (selecao === 'Q' && (limite === null || limite < 1) && formTouched) {
      return true;
    }
    return false;
  }

  loadCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (data) => this.categoriaOptions.set(data),
      error: () =>
        this.messageService.add({
          severity: 'warn',
          summary: 'Atencao',
          detail: 'Nao foi possivel carregar as categorias'
        })
    });
  }

  loadAdicional(id: number): void {
    this.adicionalService.buscar(id).subscribe({
      next: (adc: AdicionalOutput) => {
        this.form.patchValue({
          categoria: adc.id_categoria!,
          nome: adc.nome || '',
          selecao: (adc.selecao as any) ?? null,
          minimo: adc.minimo ?? null,
          limite: adc.limite ?? null
        });

        this.opcoesArray.clear();
        (adc.opcoes || []).forEach((o: any) => {
          this.opcoesArray.push(this.createOpcaoGroup(
            o.nome || '',
            o.valor ?? 0,
            o.id_item,
            o.status ?? true
          ));
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Adicional nao encontrado'
        });
        this.goBack();
      }
    });
  }

  addOpcao(): void {
    if (this.opcaoForm.invalid) {
      this.opcaoForm.markAllAsTouched();
      return;
    }

    const nome = this.opcaoForm.controls.nome.value.trim();
    const valor = Number(this.opcaoForm.controls.valor.value);

    if (!nome) {
      return;
    }

    const jaExiste = this.opcoesArray.controls.some(
      (g) => g.controls.nome.value.toLowerCase() === nome.toLowerCase()
    );
    if (jaExiste) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Opcao duplicada',
        detail: 'Esta opcao ja foi adicionada'
      });
      return;
    }

    this.opcoesArray.push(this.createOpcaoGroup(nome, valor));
    this.opcoesInvalidas = false;
    this.opcaoForm.reset();
  }

  removeOpcao(index: number): void {
    this.opcoesArray.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid || this.formInvalidRegras) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos obrigatorios',
        detail: 'Revise os campos destacados'
      });
      return;
    }

    if (this.opcoesArray.length === 0) {
      this.opcoesInvalidas = true;
      this.messageService.add({
        severity: 'warn',
        summary: 'Adicione ao menos uma opcao',
        detail: 'Informe pelo menos um adicional com valor'
      });
      return;
    }

    const payload: AdicionalInput = {
      id_categoria: this.form.controls.categoria.value!,
      nome: this.form.controls.nome.value.trim(),
      selecao: this.form.controls.selecao.value as any,
      minimo: this.form.controls.minimo.value ?? undefined,
      limite: this.form.controls.limite.value ?? undefined,
      status: true,
      opcoes: this.opcoesArray.controls.map((g) => ({
        nome: g.controls.nome.value,
        valor: g.controls.valor.value,
        status: g.controls.status.value
      }))
    };

    this.saving.set(true);
    const request$ = this.isEditMode
      ? this.adicionalService.atualizar(this.currentId!, payload)
      : this.adicionalService.criar(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode ? 'Adicional atualizado' : 'Adicional criado'
        });
        this.router.navigate(['/app/adicionais']);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.detail || 'Nao foi possivel salvar o adicional'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/adicionais']);
  }

  invalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  invalidOpcaoField(controlName: string): boolean {
    const control = this.opcaoForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}

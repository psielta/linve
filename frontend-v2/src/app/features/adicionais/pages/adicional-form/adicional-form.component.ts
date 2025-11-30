import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

interface OpcaoAdicionalView {
  id_item?: number;
  _trackId: string;
  nome: string;
  valor: number;
  status?: boolean;
}

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

          <div class="space-y-3">
            <ng-container *ngFor="let op of opcoesSelecionadas; trackBy: trackByFn">
              <div class="flex items-center justify-between bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-4 py-3">
                <div class="flex flex-col">
                  <span class="font-semibold">{{ op.nome }}</span>
                  <span class="text-sm text-surface-600 dark:text-surface-300">
                    R$ {{ op.valor.toFixed(2) }}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="p-button p-button-rounded p-button-text p-button-danger"
                    (click)="removeOpcao(op)"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </ng-container>
          </div>

          <div
            *ngIf="opcoesSelecionadas.length === 0"
            class="p-4 rounded-lg border"
            [ngClass]="{
              'border-dashed border-surface-300 dark:border-surface-600 text-surface-500': !opcoesInvalidas,
              'border-solid border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20': opcoesInvalidas
            }"
          >
            <div *ngIf="opcoesInvalidas" class="flex items-center gap-3 text-red-700 dark:text-red-400">
              <i class="pi pi-exclamation-triangle text-xl"></i>
              <span class="font-medium">Adicione ao menos uma opcao para este adicional</span>
            </div>
            <span *ngIf="!opcoesInvalidas">
              Nenhuma opcao adicionada. Informe o nome e valor para adicionar uma opcao.
            </span>
          </div>
        </div>
      </form>
    </div>
  `
})
export class AdicionalFormComponent implements OnInit {
  private tenantService = inject(TenantService);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup;
  opcaoForm: FormGroup;

  categoriaOptions = signal<CategoriaOutput[]>([]);
  opcoesSelecionadas: OpcaoAdicionalView[] = [];
  opcoesInvalidas = false;
  saving = signal(false);

  selecaoOptions = [
    { label: 'Unico (obrigatorio)', value: 'U' },
    { label: 'Multiplo (livre)', value: 'M' },
    { label: 'Quantidade multipla', value: 'Q' }
  ];

  private currentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private adicionalService: AdicionalService,
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      categoria: new FormControl<number | null>(null, { validators: [Validators.required] }),
      nome: new FormControl<string>('', {
        validators: [Validators.required, Validators.maxLength(150)]
      }),
      selecao: new FormControl<'U' | 'M' | 'Q' | null>(null, { validators: [Validators.required] }),
      minimo: new FormControl<number | null>(null),
      limite: new FormControl<number | null>(null)
    });

    this.opcaoForm = this.fb.group({
      nome: new FormControl<string>('', { validators: [Validators.required] }),
      valor: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0.01)]
      })
    });

    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId) {
        this.loadCategorias();
      }
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
    const selecao = this.form.get('selecao')?.value as 'U' | 'M' | 'Q' | null;
    const minimo = this.form.get('minimo')?.value;
    const limite = this.form.get('limite')?.value ?? null;
    const formTouched = this.form.touched || this.form.dirty;

    if (selecao === 'Q') {
      // Mínimo é obrigatório para seleção Q (deve ser >= 0)
      if ((minimo === null || minimo === undefined || minimo === '') && formTouched) {
        return true;
      }
      // Mínimo não pode ser maior que limite
      if (minimo !== null && limite !== null && minimo > limite) {
        return true;
      }
    }
    return false;
  }

  getMinimoErrorMessage(): string {
    const minimo = this.form.get('minimo')?.value;
    const limite = this.form.get('limite')?.value ?? null;

    if (minimo === null || minimo === undefined || minimo === '') {
      return 'Minimo e obrigatorio (deve ser >= 0)';
    }
    if (limite !== null && minimo > limite) {
      return 'Minimo nao pode ser maior que o limite';
    }
    return '';
  }

  invalidLimite(): boolean {
    const selecao = this.form.get('selecao')?.value as 'U' | 'M' | 'Q' | null;
    const limite = this.form.get('limite')?.value ?? null;
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

        const opcoesView: OpcaoAdicionalView[] = (adc.opcoes || []).map((o: any, idx: number) => ({
          id_item: o.id_item,
          _trackId: o.id_item ? `db-${o.id_item}` : `load-${idx}-${Date.now()}`,
          nome: o.nome || '',
          valor: o.valor ?? 0,
          status: o.status ?? true
        }));

        this.opcoesSelecionadas = opcoesView;
        this.cdr.detectChanges();
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

    const nomeRaw = this.opcaoForm.get('nome')?.value;
    const valorRaw = this.opcaoForm.get('valor')?.value;
    const nome = (nomeRaw ?? '').toString().trim();
    const valor = Number(valorRaw);

    if (!nome) {
      return;
    }

    const jaExiste = this.opcoesSelecionadas.some((o) => o.nome.toLowerCase() === nome.toLowerCase());
    if (jaExiste) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Opcao duplicada',
        detail: 'Esta opcao ja foi adicionada'
      });
      return;
    }

    const nova: OpcaoAdicionalView = {
      _trackId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nome,
      valor,
      status: true
    };
    console.log('Adicionando opcao:', nova);
    this.opcoesSelecionadas = [...this.opcoesSelecionadas, nova];
    console.log('Lista atual:', this.opcoesSelecionadas);
    this.opcoesInvalidas = false;
    this.opcaoForm.reset();
    this.cdr.detectChanges();
  }

  removeOpcao(op: OpcaoAdicionalView): void {
    this.opcoesSelecionadas = this.opcoesSelecionadas.filter((o) => o._trackId !== op._trackId);
    this.cdr.detectChanges();
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

    if (this.opcoesSelecionadas.length === 0) {
      this.opcoesInvalidas = true;
      this.messageService.add({
        severity: 'warn',
        summary: 'Adicione ao menos uma opcao',
        detail: 'Informe pelo menos um adicional com valor'
      });
      return;
    }

    const payload: AdicionalInput = {
      id_categoria: this.form.get('categoria')?.value!,
      nome: this.form.get('nome')?.value!.toString().trim(),
      selecao: this.form.get('selecao')?.value as any,
      minimo: this.form.get('minimo')?.value ?? undefined,
      limite: this.form.get('limite')?.value ?? undefined,
      status: true,
      opcoes: this.opcoesSelecionadas.map((o) => ({
        nome: o.nome,
        valor: o.valor,
        status: o.status ?? true
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

  trackByFn(index: number, item: OpcaoAdicionalView): string {
    return item._trackId;
  }
}

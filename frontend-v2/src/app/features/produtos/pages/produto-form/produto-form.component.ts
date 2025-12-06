import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { ProdutoInput } from '../../../../core/api/models/produto-input';
import { CategoriaOutput } from '../../../../core/api/models/categoria-output';
import { CategoriaOpcaoOutput } from '../../../../core/api/models/categoria-opcao-output';
import { ProdutoOutput } from '../../../../core/api/models/produto-output';
import { TenantService } from '../../../../core/services/tenant.service';

interface OpcaoFormValue {
  id_opcao: number;
  nome: string;
  valor: number;
}

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
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
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Gestao de cardapio</p>
          <h2 class="text-2xl font-bold m-0">
            {{ isEditMode() ? 'Editar Produto' : 'Novo Produto' }}
          </h2>
        </div>
        <div class="flex gap-2">
          <p-button label="Voltar" severity="secondary" icon="pi pi-arrow-left" (onClick)="goBack()" [text]="true" />
          <p-button label="Salvar" icon="pi pi-check" (onClick)="submit()" [loading]="saving()" />
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <!-- Dados basicos -->
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
              <label class="font-semibold">Nome do produto *</label>
              <input
                pInputText
                formControlName="nome"
                placeholder="Ex: Acai no copo, X-Tudo, Pizza Calabresa..."
                [ngClass]="{'w-full': true, 'ng-invalid ng-dirty': invalid('nome')}"
              />
              <small class="text-red-500" *ngIf="invalid('nome')">Informe um nome (max. 150 caracteres)</small>
            </div>

            <div class="flex flex-col gap-2 lg:col-span-2">
              <label class="font-semibold">Descricao</label>
              <textarea
                pTextarea
                rows="3"
                formControlName="descricao"
                placeholder="Ingredientes ou observacoes importantes (opcional)"
                [ngClass]="{'w-full': true, 'ng-invalid ng-dirty': invalid('descricao')}"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Precos por opcao -->
        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="pi pi-dollar text-primary"></i>
            Opcoes e precos *
          </h3>

          @if (!todasOpcoesLancadas) {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4" [formGroup]="opcaoForm">
              <div class="flex flex-col gap-2 md:col-span-1">
                <label class="font-semibold">Opcao da categoria</label>
                <p-select
                  formControlName="id_opcao"
                  [options]="opcoesDisponiveis"
                  optionLabel="nome"
                  optionValue="id_opcao"
                  placeholder="Selecione a opcao"
                  [filter]="true"
                  [showClear]="true"
                  [disabled]="!opcoesDisponiveis.length"
                  styleClass="w-full"
                  [invalid]="invalidOpcaoField('id_opcao')"
                />
                <small class="text-red-500" *ngIf="invalidOpcaoField('id_opcao')">
                  Selecione uma opcao
                </small>
              </div>

              <div class="flex flex-col gap-2 md:col-span-1">
                <label class="font-semibold">Valor</label>
                <p-inputNumber
                  formControlName="valor"
                  mode="currency"
                  currency="BRL"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="2"
                  [useGrouping]="true"
                  inputStyleClass="w-full"
                  styleClass="w-full"
                  [invalid]="invalidOpcaoField('valor')"
                />
                <small class="text-red-500" *ngIf="invalidOpcaoField('valor')">
                  Informe um valor maior que zero
                </small>
              </div>

              <div class="flex gap-2 md:col-span-1">
                <p-button
                  label="Adicionar opcao"
                  icon="pi pi-plus"
                  class="w-full md:w-auto"
                  (onClick)="addOpcao()"
                  [outlined]="true"
                />
              </div>
            </div>
          } @else {
            <div class="p-3 mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-2">
              <i class="pi pi-check-circle"></i>
              <span>Todas as opcoes da categoria ja foram lancadas.</span>
            </div>
          }

          @if (opcoesArray.length === 0) {
            <div
              class="p-4 rounded-lg border"
              [ngClass]="{
                'border-dashed border-surface-300 dark:border-surface-600 text-surface-500': !opcoesInvalidas(),
                'border-solid border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20': opcoesInvalidas()
              }"
            >
              @if (opcoesInvalidas()) {
                <div class="flex items-center gap-3 text-red-700 dark:text-red-400">
                  <i class="pi pi-exclamation-triangle text-xl"></i>
                  <span class="font-medium">Adicione ao menos uma opcao com preco para este produto</span>
                </div>
              } @else {
                Nenhuma opcao adicionada. Selecione uma opcao da categoria e informe o valor para adicionar.
              }
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" formArrayName="opcoes">
              @for (opcaoGroup of opcoesArray.controls; track opcaoGroup.controls.id_opcao.value; let i = $index) {
                <div [formGroupName]="i" class="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-2">
                  <div class="flex justify-between items-start gap-2">
                    <div>
                      <p class="text-sm text-surface-500 mb-1">Opcao</p>
                      <p class="text-base font-semibold m-0">{{ opcaoGroup.controls.nome.value }}</p>
                    </div>
                    <p-tag value="Ativo" severity="success" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-sm text-surface-500">Valor</label>
                    <p-inputNumber
                      formControlName="valor"
                      mode="currency"
                      currency="BRL"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      [useGrouping]="true"
                      inputStyleClass="w-full"
                      styleClass="w-full"
                    />
                  </div>
                  <div class="flex justify-end">
                    <p-button
                      icon="pi pi-trash"
                      [text]="true"
                      severity="danger"
                      [rounded]="true"
                      pTooltip="Remover"
                      tooltipPosition="top"
                      (onClick)="removeOpcao(i)"
                    />
                  </div>
                </div>
              }
            </div>
          }
        </div>

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
            label="Salvar Produto"
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
export class ProdutoFormComponent implements OnInit {
  private tenantService = inject(TenantService);

  form: FormGroup<{
    categoria: FormControl<number | null>;
    nome: FormControl<string>;
    descricao: FormControl<string>;
    opcoes: FormArray<FormGroup<{
      id_opcao: FormControl<number>;
      nome: FormControl<string>;
      valor: FormControl<number>;
    }>>;
  }>;

  opcaoForm: FormGroup<{
    id_opcao: FormControl<number | null>;
    valor: FormControl<number | null>;
  }>;

  saving = signal(false);
  isEditMode = signal(false);
  currentId: number | null = null;
  opcoesInvalidas = signal(false);

  categorias = signal<CategoriaOutput[]>([]);
  categoriaOptions = signal<CategoriaOutput[]>([]);
  opcoesCategoria = signal<CategoriaOpcaoOutput[]>([]);

  private currentOrgId: number | null = null;

  get opcoesArray() {
    return this.form.controls.opcoes;
  }

  get opcoesDisponiveis(): CategoriaOpcaoOutput[] {
    const idsJaLancados = new Set(this.opcoesArray.controls.map((g) => g.controls.id_opcao.value));
    return this.opcoesCategoria().filter((o) => !idsJaLancados.has(o.id_opcao!));
  }

  get todasOpcoesLancadas(): boolean {
    return this.opcoesCategoria().length > 0 && this.opcoesDisponiveis.length === 0;
  }

  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = new FormGroup({
      categoria: new FormControl<number | null>(null, { validators: Validators.required }),
      nome: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(150)]
      }),
      descricao: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
      opcoes: new FormArray<FormGroup<{
        id_opcao: FormControl<number>;
        nome: FormControl<string>;
        valor: FormControl<number>;
      }>>([])
    });

    this.opcaoForm = new FormGroup({
      id_opcao: new FormControl<number | null>(null, { validators: Validators.required }),
      valor: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] })
    });

    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId) {
        // se estiver editando e org mudar, volta para listagem
        if (this.isEditMode() && this.currentOrgId && orgId !== this.currentOrgId) {
          this.messageService.add({
            severity: 'info',
            summary: 'Organizacao alterada',
            detail: 'Voce foi redirecionado para a listagem de produtos'
          });
          this.router.navigate(['/app/produtos']);
        }
        this.currentOrgId = orgId;
      }
    });

    this.form.controls.categoria.valueChanges.subscribe((categoriaId) => {
      this.handleCategoriaChange(categoriaId);
    });
  }

  ngOnInit(): void {
    this.loadCategorias().then(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.currentId = Number(id);
        this.loadProduto(this.currentId);
      }
    });
  }

  async loadCategorias(): Promise<void> {
    return new Promise((resolve) => {
      this.categoriaService.listar().subscribe({
        next: (data) => {
          this.categorias.set(data);
          this.categoriaOptions.set(data);
          resolve();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Nao foi possivel carregar as categorias'
          });
          resolve();
        }
      });
    });
  }

  loadProduto(id: number): void {
    this.produtoService.buscar(id).subscribe({
      next: (prod) => {
        this.form.patchValue({
          categoria: prod.id_categoria,
          nome: prod.nome,
          descricao: prod.descricao || ''
        });

        // Carrega opcoes da categoria e, depois, as selecionadas
        this.handleCategoriaChange(prod.id_categoria, () => {
          this.opcoesArray.clear();
          (prod.opcoes || []).forEach((p) => {
            this.opcoesArray.push(this.createOpcaoGroup(
              p.id_opcao!,
              p.nome || `Opcao #${p.id_opcao}`,
              p.valor || 0
            ));
          });
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Produto nao encontrado'
        });
        this.goBack();
      }
    });
  }

  private createOpcaoGroup(idOpcao: number, nome: string, valor: number) {
    return new FormGroup({
      id_opcao: new FormControl<number>(idOpcao, { nonNullable: true }),
      nome: new FormControl<string>(nome, { nonNullable: true }),
      valor: new FormControl<number>(valor, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] })
    });
  }

  handleCategoriaChange(categoriaId: number | null, afterLoad?: () => void): void {
    if (!categoriaId) {
      this.opcoesCategoria.set([]);
      this.opcoesArray.clear();
      return;
    }

    this.categoriaService.listarOpcoes(categoriaId).subscribe({
      next: (ops) => {
        this.opcoesCategoria.set(ops);

        // Se categoria mudou manualmente, limpamos opcoes selecionadas
        if (!afterLoad) {
          this.opcoesArray.clear();
        }
        if (afterLoad) {
          afterLoad();
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atencao',
          detail: 'Nao foi possivel carregar opcoes da categoria selecionada'
        });
        this.opcoesArray.clear();
      }
    });
  }

  addOpcao(): void {
    if (this.opcaoForm.invalid) {
      this.opcaoForm.markAllAsTouched();
      return;
    }

    const id_opcao = this.opcaoForm.controls.id_opcao.value!;
    const valor = Number(this.opcaoForm.controls.valor.value);

    const opcaoCatalogo = this.opcoesCategoria().find((o) => o.id_opcao === id_opcao);
    if (!opcaoCatalogo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Opcao invalida',
        detail: 'Selecione uma opcao valida da categoria'
      });
      return;
    }

    // Evita duplicados
    const jaExiste = this.opcoesArray.controls.some((g) => g.controls.id_opcao.value === id_opcao);
    if (jaExiste) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Opcao duplicada',
        detail: 'Esta opcao ja foi adicionada'
      });
      return;
    }

    this.opcoesArray.push(this.createOpcaoGroup(
      id_opcao,
      opcaoCatalogo.nome || `Opcao #${id_opcao}`,
      valor
    ));
    this.opcaoForm.reset();
    this.opcoesInvalidas.set(false);
  }

  removeOpcao(index: number): void {
    this.opcoesArray.removeAt(index);
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

    if (this.opcoesArray.length === 0) {
      this.opcoesInvalidas.set(true);
      this.messageService.add({
        severity: 'warn',
        summary: 'Adicione ao menos uma opcao',
        detail: 'Informe pelo menos um preco vinculado a uma opcao da categoria'
      });
      return;
    }

    this.opcoesInvalidas.set(false);

    const payload: ProdutoInput = {
      id_categoria: this.form.controls.categoria.value!,
      nome: this.form.controls.nome.value.trim(),
      descricao: this.form.controls.descricao.value?.trim() || undefined,
      opcoes: this.opcoesArray.controls.map((g) => ({
        id_opcao: g.controls.id_opcao.value,
        valor: g.controls.valor.value
      }))
    };

    this.saving.set(true);
    const request$ = this.isEditMode()
      ? this.produtoService.atualizar(this.currentId!, payload)
      : this.produtoService.criar(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode() ? 'Produto atualizado' : 'Produto criado'
        });
        this.router.navigate(['/app/produtos']);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.detail || 'Nao foi possivel salvar o produto'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/produtos']);
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

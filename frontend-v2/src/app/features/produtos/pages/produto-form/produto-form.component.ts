import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import {
  FormBuilder,
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

interface OpcaoPrecoView {
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
              />
              <small class="text-red-500" *ngIf="invalid('categoria')">Selecione uma categoria</small>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Nome do produto *</label>
              <input
                pInputText
                formControlName="nome"
                placeholder="Ex: Acai no copo, X-Tudo, Pizza Calabresa..."
                class="w-full"
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
                class="w-full"
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

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4" [formGroup]="opcaoForm">
            <div class="flex flex-col gap-2 md:col-span-1">
              <label class="font-semibold">Opcao da categoria</label>
              <p-select
                formControlName="id_opcao"
                [options]="opcoesCategoria()"
                optionLabel="nome"
                optionValue="id_opcao"
                placeholder="Selecione a opcao"
                [filter]="true"
                [showClear]="true"
                [disabled]="!opcoesCategoria().length"
                styleClass="w-full"
              />
              <small class="text-red-500" *ngIf="opcaoForm.controls.id_opcao.invalid && opcaoForm.touched">
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
              />
              <small class="text-red-500" *ngIf="opcaoForm.controls.valor.invalid && opcaoForm.touched">
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

          @if (opcoesSelecionadas().length === 0) {
            <div class="p-4 border border-dashed border-surface-300 dark:border-surface-600 rounded-lg text-surface-500">
              Nenhuma opcao adicionada. Selecione uma opcao da categoria e informe o valor para adicionar.
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (op of opcoesSelecionadas(); track op.id_opcao) {
                <div class="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-2">
                  <div class="flex justify-between items-start gap-2">
                    <div>
                      <p class="text-sm text-surface-500 mb-1">Opcao</p>
                      <p class="text-base font-semibold m-0">{{ op.nome }}</p>
                    </div>
                    <p-tag value="Ativo" severity="success" />
                  </div>
                  <div class="text-2xl font-bold text-primary">{{ op.valor | currency: 'BRL':'symbol-narrow' }}</div>
                  <div class="flex justify-end">
                    <p-button
                      icon="pi pi-trash"
                      [text]="true"
                      severity="danger"
                      [rounded]="true"
                      pTooltip="Remover"
                      tooltipPosition="top"
                      (onClick)="removeOpcao(op.id_opcao)"
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
  }>;

  opcaoForm: FormGroup<{
    id_opcao: FormControl<number | null>;
    valor: FormControl<number | null>;
  }>;

  saving = signal(false);
  isEditMode = signal(false);
  currentId: number | null = null;

  categorias = signal<CategoriaOutput[]>([]);
  categoriaOptions = signal<CategoriaOutput[]>([]);
  opcoesCategoria = signal<CategoriaOpcaoOutput[]>([]);
  opcoesSelecionadas = signal<OpcaoPrecoView[]>([]);

  private currentOrgId: number | null = null;

  constructor(
    private fb: FormBuilder,
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
      descricao: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(500)] })
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
          const selecionadas: OpcaoPrecoView[] = (prod.opcoes || []).map((p) => ({
            id_opcao: p.id_opcao!,
            nome: p.nome || `Opcao #${p.id_opcao}`,
            valor: p.valor || 0
          }));
          this.opcoesSelecionadas.set(selecionadas);
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

  handleCategoriaChange(categoriaId: number | null, afterLoad?: () => void): void {
    if (!categoriaId) {
      this.opcoesCategoria.set([]);
      this.opcoesSelecionadas.set([]);
      return;
    }

    this.categoriaService.listarOpcoes(categoriaId).subscribe({
      next: (ops) => {
        this.opcoesCategoria.set(ops);

        // Se categoria mudou manualmente, limpamos opcoes selecionadas
        if (!afterLoad) {
          this.opcoesSelecionadas.set([]);
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
        this.opcoesSelecionadas.set([]);
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
    if (this.opcoesSelecionadas().some((o) => o.id_opcao === id_opcao)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Opcao duplicada',
        detail: 'Esta opcao ja foi adicionada'
      });
      return;
    }

    const nova: OpcaoPrecoView = {
      id_opcao,
      nome: opcaoCatalogo.nome || `Opcao #${id_opcao}`,
      valor: valor
    };

    this.opcoesSelecionadas.set([...this.opcoesSelecionadas(), nova]);
    this.opcaoForm.reset();
  }

  removeOpcao(idOpcao: number): void {
    this.opcoesSelecionadas.set(this.opcoesSelecionadas().filter((o) => o.id_opcao !== idOpcao));
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

    if (this.opcoesSelecionadas().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Adicione ao menos uma opcao',
        detail: 'Informe pelo menos um preco vinculado a uma opcao da categoria'
      });
      return;
    }

    const payload: ProdutoInput = {
      id_categoria: this.form.controls.categoria.value!,
      nome: this.form.controls.nome.value.trim(),
      descricao: this.form.controls.descricao.value?.trim() || undefined,
      opcoes: this.opcoesSelecionadas().map((o) => ({
        id_opcao: o.id_opcao,
        valor: o.valor
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
}

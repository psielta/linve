import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  BrButton,
  BrCard,
  BrCheckbox,
  BrInput,
  BrLoading,
  BrMessage,
  BrSelect,
} from '@govbr-ds/webcomponents-angular/standalone';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { listar3 } from '../../../core/api/fn/categorias-de-produtos/listar-3';
import { listarOpcoes } from '../../../core/api/fn/categorias-de-produtos/listar-opcoes';
import { buscar1 } from '../../../core/api/fn/produtos/buscar-1';
import { criar1 } from '../../../core/api/fn/produtos/criar-1';
import { atualizar1 } from '../../../core/api/fn/produtos/atualizar-1';
import { CategoriaOutput } from '../../../core/api/models/categoria-output';
import { CategoriaOpcaoOutput } from '../../../core/api/models/categoria-opcao-output';
import { ProdutoInput } from '../../../core/api/models/produto-input';
import { ProdutoOpcaoInput } from '../../../core/api/models/produto-opcao-input';
import { ProdutoOutput } from '../../../core/api/models/produto-output';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BrButton,
    BrCard,
    BrCheckbox,
    BrInput,
    BrLoading,
    BrMessage,
    BrSelect,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './produto-form.component.html',
  styleUrl: './produto-form.component.scss',
})
export class ProdutoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;

  saving = signal(false);
  loading = signal(false);
  feedback = signal<{ type: 'success' | 'danger'; text: string } | null>(null);
  isEditMode = signal(false);
  currentId: number | null = null;
  opcoesInvalidas = signal(false);
  private patching = false;

  categorias = signal<CategoriaOutput[]>([]);
  opcoesCategoria = signal<CategoriaOpcaoOutput[]>([]);

  // Signal para controle manual do br-select de categoria
  selectedCategoriaValue = signal<string>('');

  // Computed: opções do select (value como string para br-select)
  categoriaOptions = computed(() =>
    this.categorias().map((c) => ({
      label: c.nome ?? `Categoria #${c.id_categoria}`,
      value: String(c.id_categoria ?? ''),
    }))
  );

  // FormArray para opções com preços
  get opcoesFormArray(): FormArray {
    return this.form.get('opcoes') as FormArray;
  }

  constructor() {
    this.form = this.fb.group({
      id_categoria: ['', Validators.required],
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      descricao: ['', [Validators.maxLength(500)]],
      opcoes: this.fb.array([]),
    });

    this.form.get('id_categoria')?.valueChanges.subscribe((id) => {
      if (this.patching) return;
      const num = typeof id === 'string' ? Number(id) : id;
      if (!num || Number.isNaN(num)) {
        this.opcoesCategoria.set([]);
        this.clearOpcoesArray();
        return;
      }
      this.loadOpcoes(num);
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
      listar3(this.http, this.apiConfig.rootUrl).subscribe({
        next: (response) => {
          this.categorias.set(response.body ?? []);
          resolve();
        },
        error: () => {
          this.feedback.set({ type: 'danger', text: 'Não foi possível carregar as categorias.' });
          resolve();
        },
      });
    });
  }

  loadOpcoes(idCategoria: number, afterLoad?: () => void): void {
    listarOpcoes(this.http, this.apiConfig.rootUrl, { idCategoria }).subscribe({
      next: (response) => {
        const opcoes = response.body ?? [];
        this.opcoesCategoria.set(opcoes);
        this.buildOpcoesArray(opcoes);
        if (afterLoad) afterLoad();
      },
      error: () => {
        this.opcoesCategoria.set([]);
        this.clearOpcoesArray();
        this.feedback.set({ type: 'danger', text: 'Não foi possível carregar opções da categoria.' });
      },
    });
  }

  private buildOpcoesArray(opcoes: CategoriaOpcaoOutput[], valoresExistentes?: Map<number, number>): void {
    this.clearOpcoesArray();

    opcoes.forEach((opcao) => {
      const valorExistente = valoresExistentes?.get(opcao.id_opcao!);
      const habilitado = valorExistente !== undefined && valorExistente > 0;

      const group = this.fb.group({
        id_opcao: [opcao.id_opcao],
        nome: [opcao.nome],
        valor: [valorExistente ?? null],
        habilitado: [habilitado],
      });

      this.opcoesFormArray.push(group);
    });
  }

  private clearOpcoesArray(): void {
    while (this.opcoesFormArray.length) {
      this.opcoesFormArray.removeAt(0);
    }
  }

  loadProduto(id: number): void {
    this.loading.set(true);
    buscar1(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: (response) => {
        const prod = response.body as ProdutoOutput | undefined;
        if (!prod) return;

        this.patching = true;
        this.form.patchValue({
          id_categoria: String(prod.id_categoria ?? ''),
          nome: prod.nome,
          descricao: prod.descricao ?? '',
        });
        this.patching = false;

        // Mapeia valores existentes por id_opcao
        const valoresExistentes = new Map<number, number>();
        (prod.opcoes ?? []).forEach((p) => {
          if (p.id_opcao != null) {
            valoresExistentes.set(p.id_opcao, p.valor ?? 0);
          }
        });

        this.loadOpcoes(prod.id_categoria, () => {
          // Rebuilda o array com os valores existentes
          this.buildOpcoesArray(this.opcoesCategoria(), valoresExistentes);
          this.loading.set(false);

          // Delay para o br-select reagir após renderização
          setTimeout(() => {
            this.selectedCategoriaValue.set(String(prod.id_categoria ?? ''));
          }, 50);
        });
      },
      error: () => {
        this.feedback.set({ type: 'danger', text: 'Produto não encontrado.' });
        this.router.navigate(['/app/produtos']);
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    this.feedback.set(null);
    this.opcoesInvalidas.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const opcoesValidas = this.getOpcoesValidas();
    if (opcoesValidas.length === 0) {
      this.opcoesInvalidas.set(true);
      return;
    }

    const payload: ProdutoInput = this.buildPayload(opcoesValidas);
    this.saving.set(true);

    const request$ = this.isEditMode()
      ? atualizar1(this.http, this.apiConfig.rootUrl, { id: this.currentId!, body: payload })
      : criar1(this.http, this.apiConfig.rootUrl, { body: payload });

    request$.subscribe({
      next: () => {
        this.feedback.set({
          type: 'success',
          text: this.isEditMode() ? 'Produto atualizado.' : 'Produto criado.',
        });
        this.router.navigate(['/app/produtos']);
      },
      error: () => {
        this.feedback.set({ type: 'danger', text: 'Não foi possível salvar o produto.' });
      },
      complete: () => this.saving.set(false),
    });
  }

  private getOpcoesValidas(): ProdutoOpcaoInput[] {
    const opcoes: ProdutoOpcaoInput[] = [];

    for (let i = 0; i < this.opcoesFormArray.length; i++) {
      const group = this.opcoesFormArray.at(i) as FormGroup;
      const habilitado = group.get('habilitado')?.value;
      const valor = Number(group.get('valor')?.value);
      const id_opcao = group.get('id_opcao')?.value;

      if (habilitado && valor > 0 && id_opcao != null) {
        opcoes.push({ id_opcao, valor });
      }
    }

    return opcoes;
  }

  buildPayload(opcoes: ProdutoOpcaoInput[]): ProdutoInput {
    const value = this.form.getRawValue();

    return {
      id_categoria: Number(value.id_categoria),
      nome: (value.nome ?? '').trim(),
      descricao: (value.descricao ?? '').trim() || undefined,
      opcoes,
    };
  }

  invalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  onCategoriaChange(event: CustomEvent): void {
    const raw = event.detail;
    const value = raw === null || raw === 'null' || raw === '' ? '' : String(raw);
    this.form.get('id_categoria')?.setValue(value);
    this.form.get('id_categoria')?.markAsTouched();
    this.selectedCategoriaValue.set(value);
  }

  onHabilitadoChange(index: number, event: CustomEvent<boolean>): void {
    const group = this.opcoesFormArray.at(index) as FormGroup;
    group.get('habilitado')?.setValue(event.detail);
    this.opcoesInvalidas.set(false);
  }

  onValorChange(index: number, event: CustomEvent): void {
    const group = this.opcoesFormArray.at(index) as FormGroup;
    const valor = event.detail;
    const num = valor === '' || valor === null ? null : Number(valor);
    group.get('valor')?.setValue(Number.isNaN(num!) ? null : num);

    // Auto-habilita quando preenche valor > 0
    if (num && num > 0) {
      group.get('habilitado')?.setValue(true);
      this.opcoesInvalidas.set(false);
    }
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }

  goBack(): void {
    this.router.navigate(['/app/produtos']);
  }
}

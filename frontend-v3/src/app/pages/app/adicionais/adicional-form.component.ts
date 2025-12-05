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
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  BrButton,
  BrCard,
  BrInput,
  BrLoading,
  BrMessage,
  BrSelect,
} from '@govbr-ds/webcomponents-angular/standalone';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { listar3 } from '../../../core/api/fn/categorias-de-produtos/listar-3';
import { buscar5 } from '../../../core/api/fn/adicionais/buscar-5';
import { criar6 } from '../../../core/api/fn/adicionais/criar-6';
import { atualizar6 } from '../../../core/api/fn/adicionais/atualizar-6';
import { CategoriaOutput } from '../../../core/api/models/categoria-output';
import { AdicionalInput } from '../../../core/api/models/adicional-input';
import { AdicionalOpcaoInput } from '../../../core/api/models/adicional-opcao-input';
import { AdicionalOutput } from '../../../core/api/models/adicional-output';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-adicional-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BrButton,
    BrCard,
    BrInput,
    BrLoading,
    BrMessage,
    BrSelect,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './adicional-form.component.html',
  styleUrls: ['./adicional-form.component.scss'],
})
export class AdicionalFormComponent implements OnInit {
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

  categorias = signal<CategoriaOutput[]>([]);
  selectedCategoriaValue = signal<string>('');
  selectedSelecaoValue = signal<string>('');

  // Computed: opções do select (value como string para br-select)
  categoriaOptions = computed(() =>
    this.categorias().map((c) => ({
      label: c.nome ?? `Categoria #${c.id_categoria}`,
      value: String(c.id_categoria ?? ''),
    }))
  );

  selecaoOptions: SelectOption[] = [
    { label: 'Único (obrigatório)', value: 'U' },
    { label: 'Múltiplo (livre)', value: 'M' },
    { label: 'Quantidade múltipla', value: 'Q' },
  ];

  constructor() {
    this.form = this.fb.group({
      id_categoria: ['', Validators.required],
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      selecao: ['', Validators.required],
      minimo: [null],
      limite: [null],
      opcoes: this.fb.array([]),
    }, { validators: this.limiteMinValidator });
  }

  // Validador: limite >= minimo quando selecao === 'Q'
  limiteMinValidator(group: AbstractControl): ValidationErrors | null {
    const selecao = group.get('selecao')?.value;
    if (selecao !== 'Q') return null;

    const minimo = Number(group.get('minimo')?.value) || 0;
    const limite = Number(group.get('limite')?.value) || 0;

    if (limite < minimo) {
      return { limiteInvalido: true };
    }
    return null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentId = Number(id);
    }
    this.loadCategorias();
  }

  // getters
  get opcoesArray(): FormArray<FormGroup> {
    return this.form.get('opcoes') as FormArray<FormGroup>;
  }

  onCategoriaChange(event: CustomEvent): void {
    const raw = event.detail;
    const value = raw === null || raw === 'null' || raw === '' ? '' : String(raw);
    this.form.get('id_categoria')?.setValue(value);
    this.form.get('id_categoria')?.markAsTouched();
    this.selectedCategoriaValue.set(value);
  }

  onSelecaoChange(event: CustomEvent): void {
    const raw = event.detail;
    const value = raw === null || raw === 'null' || raw === '' ? '' : String(raw);
    this.form.get('selecao')?.setValue(value);
    this.form.get('selecao')?.markAsTouched();
    this.selectedSelecaoValue.set(value);
    this.updateRegraValidators(value);
  }

  updateRegraValidators(selecao: string): void {
    const minimoCtrl = this.form.get('minimo');
    const limiteCtrl = this.form.get('limite');

    minimoCtrl?.clearValidators();
    limiteCtrl?.clearValidators();

    if (selecao === 'Q') {
      minimoCtrl?.setValidators([Validators.required, Validators.min(0)]);
      limiteCtrl?.setValidators([Validators.required, Validators.min(1)]);
    } else if (selecao === 'M') {
      limiteCtrl?.setValidators([Validators.min(1)]);
      minimoCtrl?.setValue(null);
    } else {
      minimoCtrl?.setValue(null);
      limiteCtrl?.setValue(null);
    }

    minimoCtrl?.updateValueAndValidity();
    limiteCtrl?.updateValueAndValidity();
  }

  addOpcao(): void {
    const group = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      status: [true],
    });
    this.opcoesArray.push(group);
  }

  removeOpcao(index: number): void {
    this.opcoesArray.removeAt(index);
  }

  loadCategorias(): void {
    this.loading.set(true);
    listar3(this.http, this.apiConfig.rootUrl).subscribe({
      next: (resp) => {
        this.categorias.set(resp.body ?? []);
        if (this.currentId) {
          this.loadAdicional(this.currentId);
        } else {
          // novo: adiciona linha inicial para facilitar preenchimento
          if (this.opcoesArray.length === 0) {
            this.addOpcao();
          }
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.feedback.set({ type: 'danger', text: 'Nao foi possivel carregar categorias.' });
      },
    });
  }

  loadAdicional(id: number): void {
    this.loading.set(true);
    buscar5(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: (resp) => {
        const adc = resp.body as AdicionalOutput | undefined;
        if (!adc) return;

        this.form.patchValue({
          id_categoria: adc.id_categoria != null ? String(adc.id_categoria) : '',
          nome: adc.nome ?? '',
          selecao: adc.selecao ?? '',
          minimo: adc.minimo ?? null,
          limite: adc.limite ?? null,
        });

        // popula opcoes
        this.opcoesArray.clear();
        (adc.opcoes ?? []).forEach((o) => {
          this.opcoesArray.push(
            this.fb.group({
              nome: [o.nome ?? '', [Validators.required, Validators.maxLength(150)]],
              valor: [o.valor ?? 0, [Validators.required, Validators.min(0.01)]],
              status: [o.status ?? true],
            })
          );
        });

        // delay para o br-select exibir valor
        setTimeout(() => {
          this.selectedCategoriaValue.set(adc.id_categoria != null ? String(adc.id_categoria) : '');
          this.selectedSelecaoValue.set(adc.selecao ?? '');
        }, 50);

        this.updateRegraValidators(adc.selecao ?? '');
      },
      error: () => {
        this.feedback.set({ type: 'danger', text: 'Adicional nao encontrado.' });
        this.router.navigate(['/app/adicionais']);
      },
      complete: () => this.loading.set(false),
    });
  }

  submit(): void {
    this.feedback.set(null);

    if (this.form.invalid || this.opcoesArray.length === 0) {
      this.form.markAllAsTouched();
      if (this.opcoesArray.length === 0) {
        this.feedback.set({ type: 'danger', text: 'Adicione ao menos uma opção com valor.' });
      }
      return;
    }

    const payload = this.mapToPayload();
    this.saving.set(true);

    const request$ = this.isEditMode()
      ? atualizar6(this.http, this.apiConfig.rootUrl, { id: this.currentId!, body: payload })
      : criar6(this.http, this.apiConfig.rootUrl, { body: payload });

    request$.subscribe({
      next: () => {
        this.feedback.set({
          type: 'success',
          text: this.isEditMode() ? 'Adicional atualizado.' : 'Adicional criado.',
        });
        this.router.navigate(['/app/adicionais']);
      },
      error: () => {
        this.feedback.set({ type: 'danger', text: 'Nao foi possivel salvar o adicional.' });
      },
      complete: () => this.saving.set(false),
    });
  }

  mapToPayload(): AdicionalInput {
    const value = this.form.getRawValue();
    const opcoes: AdicionalOpcaoInput[] = this.opcoesArray.controls.map((ctrl) => ({
      nome: (ctrl.get('nome')?.value ?? '').toString().trim(),
      valor: Number(ctrl.get('valor')?.value) || 0,
      status: ctrl.get('status')?.value ?? true,
    }));

    return {
      id_categoria: Number(value.id_categoria),
      nome: (value.nome ?? '').trim(),
      selecao: value.selecao ?? '',
      minimo: value.selecao === 'Q' ? value.minimo ?? 0 : undefined,
      limite: value.selecao === 'U' ? undefined : value.limite ?? undefined,
      status: true,
      opcoes,
    };
  }

  invalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  invalidOpcao(group: FormGroup, controlName: string): boolean {
    const control = group.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }

  goBack(): void {
    this.router.navigate(['/app/adicionais']);
  }
}

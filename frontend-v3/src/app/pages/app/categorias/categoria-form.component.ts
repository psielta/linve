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
  FormBuilder,
  FormGroup,
  FormsModule,
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
import { listar6 } from '../../../core/api/fn/culinarias/listar-6';
import { buscar3 } from '../../../core/api/fn/categorias-de-produtos/buscar-3';
import { criar4 } from '../../../core/api/fn/categorias-de-produtos/criar-4';
import { atualizar4 } from '../../../core/api/fn/categorias-de-produtos/atualizar-4';
import { CategoriaInput } from '../../../core/api/models/categoria-input';
import { CulinariaOutput } from '../../../core/api/models/culinaria-output';

interface SelectOption {
  label: string;
  value: number | string | null;
}

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss'],
})
export class CategoriaFormComponent implements OnInit {
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

  culinarias = signal<CulinariaOutput[]>([]);
  selectedCulinariaId = signal<number | null>(null);
  selectedCulinariaValue = signal<string>('');
  selectedOpcaoMeiaValue = signal<string>('');
  novaOpcao = '';

  // Timestamps para debounce de eventos do br-select (workaround para bug)
  private lastCulinariaChangeTime = 0;
  private lastOpcaoMeiaChangeTime = 0;

  // Computed: opções do select de culinária (value como string para br-select)
  culinariaOptions = computed<SelectOption[]>(() =>
    this.culinarias().map((c) => ({
      label: c.nome ?? `Culinária #${c.id}`,
      value: String(c.id ?? ''),
    }))
  );

  opcaoMeiaOptions: SelectOption[] = [
    { label: 'Sem meia', value: '' },
    { label: 'Metade pelo valor medio (M)', value: 'M' },
    { label: 'Metade pelo maior valor (V)', value: 'V' },
  ];

  diasSemana = [
    { label: 'Domingo', control: 'domingo' },
    { label: 'Segunda', control: 'segunda' },
    { label: 'Terca', control: 'terca' },
    { label: 'Quarta', control: 'quarta' },
    { label: 'Quinta', control: 'quinta' },
    { label: 'Sexta', control: 'sexta' },
    { label: 'Sabado', control: 'sabado' },
  ];

  culinariaSupportsMeioMeio = computed(() => {
    const id = this.selectedCulinariaId();
    const found = this.culinarias().find((c) => c.id === id);
    return found?.meioMeio === true;
  });

  constructor() {
    this.form = this.fb.group({
      id_culinaria: ['', Validators.required],
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      descricao: ['', [Validators.maxLength(500)]],
      opcao_meia: [''],
      opcoes: [[], [Validators.required]],
      ordem: [null],
      inicio: [''],
      fim: [''],
      domingo: [false],
      segunda: [true],
      terca: [true],
      quarta: [true],
      quinta: [true],
      sexta: [true],
      sabado: [true],
    });

    this.form.get('id_culinaria')?.valueChanges.subscribe((value) => {
      const num = value ? Number(value) : null;
      this.selectedCulinariaId.set(Number.isNaN(num) ? null : num);
      if (!this.culinariaSupportsMeioMeio()) {
        this.form.get('opcao_meia')?.setValue('');
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentId = Number(id);
    }
    this.loadCulinarias();
  }

  loadCulinarias(): void {
    this.loading.set(true);
    listar6(this.http, this.apiConfig.rootUrl).subscribe({
      next: (response) => {
        this.culinarias.set(response.body ?? []);
        // Carrega categoria só depois das culinarias (para edição)
        if (this.currentId) {
          this.loadCategoria(this.currentId);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.feedback.set({
          type: 'danger',
          text: 'Nao foi possivel carregar as culinarias.',
        });
      },
    });
  }

  loadCategoria(id: number): void {
    buscar3(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: (response) => {
        const cat = response.body;
        if (!cat) return;

        this.form.patchValue({
          id_culinaria: String(cat.id_culinaria ?? ''),
          nome: cat.nome,
          descricao: cat.descricao ?? '',
          opcao_meia: cat.opcao_meia ?? '',
          opcoes: (cat.opcoes ?? []).map((o) => o.nome),
          ordem: cat.ordem ?? null,
          inicio: cat.inicio ?? '',
          fim: cat.fim ?? '',
          domingo: cat.disponivel?.domingo ?? false,
          segunda: cat.disponivel?.segunda ?? false,
          terca: cat.disponivel?.terca ?? false,
          quarta: cat.disponivel?.quarta ?? false,
          quinta: cat.disponivel?.quinta ?? false,
          sexta: cat.disponivel?.sexta ?? false,
          sabado: cat.disponivel?.sabado ?? false,
        });
        this.selectedCulinariaId.set(cat.id_culinaria);
        this.loading.set(false);
        // Delay para o br-select reagir após renderização
        setTimeout(() => {
          this.selectedCulinariaValue.set(String(cat.id_culinaria ?? ''));
          this.selectedOpcaoMeiaValue.set(cat.opcao_meia ?? '');
        }, 50);
      },
      error: () => {
        this.loading.set(false);
        this.feedback.set({
          type: 'danger',
          text: 'Categoria nao encontrada.',
        });
        this.router.navigate(['/app/categorias']);
      },
    });
  }

  submit(): void {
    this.feedback.set(null);

    if (this.form.invalid || this.hasHorarioError() || this.opcoesValue().length === 0) {
      this.form.markAllAsTouched();
      if (this.opcoesValue().length === 0) {
        this.form.get('opcoes')?.setErrors({ required: true });
      }
      return;
    }

    const payload = this.mapToPayload();
    this.saving.set(true);

    const request$ = this.isEditMode()
      ? atualizar4(this.http, this.apiConfig.rootUrl, {
          id: this.currentId!,
          body: payload,
        })
      : criar4(this.http, this.apiConfig.rootUrl, { body: payload });

    request$.subscribe({
      next: () => {
        this.feedback.set({
          type: 'success',
          text: this.isEditMode() ? 'Categoria atualizada.' : 'Categoria criada.',
        });
        this.router.navigate(['/app/categorias']);
      },
      error: () => {
        this.feedback.set({
          type: 'danger',
          text: 'Nao foi possivel salvar a categoria.',
        });
      },
      complete: () => this.saving.set(false),
    });
  }

  mapToPayload(): CategoriaInput {
    const value = this.form.getRawValue();
    const opcoes = this.opcoesValue()
      .map((o) => (o ?? '').toString().trim())
      .filter((o) => !!o);

    const payload: CategoriaInput = {
      id_culinaria: Number(value.id_culinaria) || 0,
      nome: (value.nome ?? '').trim(),
      descricao: (value.descricao ?? '').trim() || undefined,
      opcao_meia: this.selectedOpcaoMeiaValue() || '',
      opcoes,
      ordem: value.ordem ?? undefined,
      disponivel: {
        domingo: !!value.domingo,
        segunda: !!value.segunda,
        terca: !!value.terca,
        quarta: !!value.quarta,
        quinta: !!value.quinta,
        sexta: !!value.sexta,
        sabado: !!value.sabado,
      },
    };

    if (this.validHorario(value.inicio, value.fim)) {
      payload.inicio = value.inicio.trim();
      payload.fim = value.fim.trim();
    }

    return payload;
  }

  hasHorarioError(): boolean {
    const value = this.form.value;
    return !this.validHorario(value.inicio as string, value.fim as string, true);
  }

  private validHorario(
    inicio?: string,
    fim?: string,
    allowEmpty = false
  ): boolean {
    const ini = (inicio ?? '').trim();
    const end = (fim ?? '').trim();

    if (!ini && !end) return allowEmpty ? true : false;
    if (!ini || !end) return false;
    const regex = /^[0-2][0-9]:[0-5][0-9]$/;
    if (!regex.test(ini) || !regex.test(end)) return false;
    const hIni = Number(ini.split(':')[0]);
    const hEnd = Number(end.split(':')[0]);
    if (hIni > 23 || hEnd > 23) return false;
    const toMinutes = (v: string) => {
      const [h, m] = v.split(':').map((n) => Number(n));
      return h * 60 + m;
    };
    return toMinutes(ini) < toMinutes(end);
  }

  opcoesValue(): string[] {
    return (this.form.get('opcoes')?.value as string[]) ?? [];
  }

  addOpcao(): void {
    const value = this.novaOpcao.trim();
    if (!value) return;
    const current = this.opcoesValue();
    if (!current.includes(value)) {
      this.form.get('opcoes')?.setValue([...current, value]);
      this.form.get('opcoes')?.markAsDirty();
    }
    this.novaOpcao = '';
  }

  removeOpcao(op: string): void {
    const updated = this.opcoesValue().filter((o) => o !== op);
    this.form.get('opcoes')?.setValue(updated);
    this.form.get('opcoes')?.markAsDirty();
  }

  onCulinariaChange(event: CustomEvent): void {
    const raw = event.detail;
    const value = raw === null || raw === 'null' || raw === '' ? null : Number(raw);
    const now = Date.now();

    // Debounce: ignora eventos vazios que chegam em menos de 100ms após uma seleção válida
    if (value === null) {
      if (now - this.lastCulinariaChangeTime < 100) {
        return;
      }
    } else {
      this.lastCulinariaChangeTime = now;
    }

    this.form.get('id_culinaria')?.setValue(raw ?? '');
    this.form.get('id_culinaria')?.markAsTouched();
    this.selectedCulinariaId.set(value);
    this.selectedCulinariaValue.set(raw ?? '');
  }

  onOpcaoMeiaChange(event: CustomEvent): void {
    const raw = event.detail;
    const value = raw === null || raw === 'null' ? '' : String(raw);
    const now = Date.now();

    // Debounce: ignora eventos nulos que chegam em menos de 100ms após uma seleção válida
    if (raw === null) {
      if (now - this.lastOpcaoMeiaChangeTime < 100) {
        return;
      }
    } else {
      this.lastOpcaoMeiaChangeTime = now;
    }

    this.form.get('opcao_meia')?.setValue(value);
    this.selectedOpcaoMeiaValue.set(value);
  }

  onDiaChange(control: string, event: CustomEvent<boolean>): void {
    this.form.get(control)?.setValue(event.detail);
  }

  invalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }

  goBack(): void {
    this.router.navigate(['/app/categorias']);
  }
}

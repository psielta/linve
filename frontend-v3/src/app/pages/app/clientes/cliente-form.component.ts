import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
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
  BrInput,
  BrLoading,
  BrMessage,
  BrSelect,
} from '@govbr-ds/webcomponents-angular/standalone';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { listarUfs } from '../../../core/api/fn/dados-abertos/listar-ufs';
import { listarMunicipiosPorUf } from '../../../core/api/fn/dados-abertos/listar-municipios-por-uf';
import { buscar2 } from '../../../core/api/fn/clientes/buscar-2';
import { criar3 } from '../../../core/api/fn/clientes/criar-3';
import { atualizar3 } from '../../../core/api/fn/clientes/atualizar-3';
import { ClienteInput } from '../../../core/api/models/cliente-input';
import { ClienteOutput } from '../../../core/api/models/cliente-output';
import { UfOutput } from '../../../core/api/models/uf-output';
import { MunicipioOutput } from '../../../core/api/models/municipio-output';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-cliente-form',
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
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss'],
})
export class ClienteFormComponent implements OnInit {
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

  tipoDocumentoValue = signal<'CPF' | 'CNPJ'>('CPF');

  // UFs
  ufsAll = signal<UfOutput[]>([]);
  ufOptions = signal<SelectOption[]>([]);

  // Por endereço: UF selecionada e municípios carregados
  selectedUfs = signal<Record<number, string>>({}); // index -> sigla UF
  selectedMunicipios = signal<Record<number, string>>({}); // index -> codigo municipio
  municipiosPorEndereco = signal<Record<number, SelectOption[]>>({}); // index -> options
  loadingMunicipios = signal<Record<number, boolean>>({}); // index -> loading state


  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(200)]],
      documento: [''],
      tel_1: [''],
      tel_2: [''],
      tel_3: [''],
      enderecos: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentId = Number(id);
    }
    this.loadUfs();
  }

  get enderecos(): FormArray<FormGroup> {
    return this.form.get('enderecos') as FormArray<FormGroup>;
  }

  // Carrega lista de UFs
  loadUfs(): void {
    this.loading.set(true);
    listarUfs(this.http, this.apiConfig.rootUrl).subscribe({
      next: (resp) => {
        const ufs = resp.body ?? [];
        this.ufsAll.set(ufs);
        const opts = ufs
          .map((u) => ({ label: `${u.sigla} - ${u.nome}`, value: u.sigla }))
          .sort((a, b) => a.label.localeCompare(b.label));
        this.ufOptions.set(opts);

        if (this.currentId) {
          this.loadCliente(this.currentId);
        } else {
          this.addEndereco();
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.feedback.set({ type: 'danger', text: 'Não foi possível carregar UFs.' });
      },
    });
  }

  // Carrega municípios de uma UF para um endereço específico
  loadMunicipiosPorUf(index: number, siglaUf: string): void {
    this.loadingMunicipios.update((s) => ({ ...s, [index]: true }));

    listarMunicipiosPorUf(this.http, this.apiConfig.rootUrl, { siglaUf }).subscribe({
      next: (resp) => {
        const municipios = (resp.body ?? [])
          .map((m: MunicipioOutput) => ({
            label: m.nome,
            value: String(m.codigo),
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        this.municipiosPorEndereco.update((s) => ({ ...s, [index]: municipios }));
        this.loadingMunicipios.update((s) => ({ ...s, [index]: false }));
      },
      error: () => {
        this.loadingMunicipios.update((s) => ({ ...s, [index]: false }));
        this.feedback.set({ type: 'danger', text: 'Erro ao carregar municípios.' });
      },
    });
  }

  // Extrai código da UF a partir do código IBGE do município (2 primeiros dígitos)
  getUfCodigoFromMunicipio(codigoMunicipio: number): number {
    return Math.floor(codigoMunicipio / 100000);
  }

  // Encontra a sigla da UF pelo código
  getSiglaUfByCodigo(codigoUf: number): string | null {
    const uf = this.ufsAll().find((u) => u.codigo === codigoUf);
    return uf?.sigla ?? null;
  }

  addEndereco(): void {
    this.enderecos.push(
      this.fb.group({
        id: [null],
        municipio: [null, Validators.required],
        cep: [''],
        bairro: [''],
        rua: [''],
        num: [''],
        complemento: [''],
        ponto_referencia: [''],
      })
    );
    const idx = this.enderecos.length - 1;
    this.selectedUfs.update((s) => ({ ...s, [idx]: '' }));
    this.selectedMunicipios.update((s) => ({ ...s, [idx]: '' }));
    this.municipiosPorEndereco.update((s) => ({ ...s, [idx]: [] }));
  }

  removeEndereco(index: number): void {
    if (this.enderecos.length <= 1) return;
    this.enderecos.removeAt(index);

    // Reindex all signals
    const reindex = <T>(obj: Record<number, T>): Record<number, T> => {
      const copy = { ...obj };
      delete copy[index];
      const result: Record<number, T> = {};
      Object.values(copy).forEach((v, i) => {
        result[i] = v;
      });
      return result;
    };

    this.selectedUfs.set(reindex(this.selectedUfs()));
    this.selectedMunicipios.set(reindex(this.selectedMunicipios()));
    this.municipiosPorEndereco.set(reindex(this.municipiosPorEndereco()));
    this.loadingMunicipios.set(reindex(this.loadingMunicipios()));
  }

  onUfChange(idx: number, event: Event, selectEl?: any): void {
    const raw = (event as CustomEvent).detail;
    const sigla = raw === null || raw === 'null' || raw === '' ? '' : String(raw);

    // Se evento vazio mas já tem valor selecionado, restaura o valor no elemento
    const currentUf = this.selectedUfs()[idx];
    if (!sigla && currentUf && selectEl) {
      setTimeout(() => {
        selectEl.value = currentUf;
      }, 0);
      return;
    }

    this.selectedUfs.update((s) => ({ ...s, [idx]: sigla }));

    // Limpa município selecionado quando muda UF
    this.selectedMunicipios.update((s) => ({ ...s, [idx]: '' }));
    this.enderecos.at(idx).get('municipio')?.setValue(null);

    if (sigla) {
      this.loadMunicipiosPorUf(idx, sigla);
    } else {
      this.municipiosPorEndereco.update((s) => ({ ...s, [idx]: [] }));
    }
  }

  onMunicipioChange(idx: number, event: Event, selectEl?: any): void {
    const raw = (event as CustomEvent).detail;
    const value = raw === null || raw === 'null' || raw === '' ? '' : String(raw);

    // Se evento vazio mas já tem valor selecionado, restaura o valor no elemento
    const currentMunicipio = this.selectedMunicipios()[idx];
    if (!value && currentMunicipio && selectEl) {
      setTimeout(() => {
        selectEl.value = currentMunicipio;
      }, 0);
      return;
    }

    const num = Number(value);
    this.enderecos.at(idx).get('municipio')?.setValue(Number.isNaN(num) ? null : num);
    this.selectedMunicipios.update((s) => ({ ...s, [idx]: value }));
  }

  onDocumentoTypeChange(event: CustomEvent): void {
    const value = (event.detail as 'CPF' | 'CNPJ') ?? 'CPF';
    this.tipoDocumentoValue.set(value);
    this.form.get('documento')?.setValue('');
  }

  loadCliente(id: number): void {
    this.loading.set(true);
    buscar2(this.http, this.apiConfig.rootUrl, { id }).subscribe({
      next: (resp) => {
        const cli = resp.body as ClienteOutput | undefined;
        if (!cli) return;

        this.form.patchValue({
          nome: cli.nome,
          documento: cli.documento ?? '',
          tel_1: cli.tel_1 ?? '',
          tel_2: cli.tel_2 ?? '',
          tel_3: cli.tel_3 ?? '',
        });

        const docNum = (cli.documento ?? '').replace(/\D/g, '');
        this.tipoDocumentoValue.set(docNum.length === 14 ? 'CNPJ' : 'CPF');

        this.enderecos.clear();
        const selectedUfs: Record<number, string> = {};
        const selectedMunicipios: Record<number, string> = {};

        const enderecos = cli.enderecos ?? [];

        if (enderecos.length === 0) {
          this.addEndereco();
          this.loading.set(false);
          return;
        }

        // Processa cada endereço
        enderecos.forEach((e, idx) => {
          this.enderecos.push(
            this.fb.group({
              id: [e.id ?? null],
              municipio: [e.municipio ?? null, Validators.required],
              cep: [e.cep ?? ''],
              bairro: [e.bairro ?? ''],
              rua: [e.rua ?? ''],
              num: [e.num ?? ''],
              complemento: [e.complemento ?? ''],
              ponto_referencia: [e.ponto_referencia ?? ''],
            })
          );

          selectedMunicipios[idx] = e.municipio != null ? String(e.municipio) : '';

          // Descobre a UF pelo código do município
          if (e.municipio) {
            const codigoUf = this.getUfCodigoFromMunicipio(e.municipio);
            const siglaUf = this.getSiglaUfByCodigo(codigoUf);
            if (siglaUf) {
              selectedUfs[idx] = siglaUf;
              // Carrega municípios dessa UF
              this.loadMunicipiosPorUf(idx, siglaUf);
            }
          }
        });

        this.selectedUfs.set(selectedUfs);
        this.selectedMunicipios.set(selectedMunicipios);
        this.loading.set(false);
      },
      error: () => {
        this.feedback.set({ type: 'danger', text: 'Cliente não encontrado.' });
        this.router.navigate(['/app/clientes']);
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    this.feedback.set(null);

    if (this.form.invalid || this.enderecos.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.mapToPayload();
    this.saving.set(true);

    const request$ = this.isEditMode()
      ? atualizar3(this.http, this.apiConfig.rootUrl, { id: this.currentId!, body: payload })
      : criar3(this.http, this.apiConfig.rootUrl, { body: payload });

    request$.subscribe({
      next: () => {
        this.feedback.set({
          type: 'success',
          text: this.isEditMode() ? 'Cliente atualizado.' : 'Cliente criado.',
        });
        this.router.navigate(['/app/clientes']);
      },
      error: () => {
        this.feedback.set({ type: 'danger', text: 'Não foi possível salvar o cliente.' });
      },
      complete: () => this.saving.set(false),
    });
  }

  mapToPayload(): ClienteInput {
    const v = this.form.getRawValue();
    const clean = (s?: string | null) => (s ? s.replace(/\D/g, '') : undefined);
    return {
      nome: (v.nome ?? '').trim(),
      documento: clean(v.documento),
      tel_1: clean(v.tel_1),
      tel_2: clean(v.tel_2),
      tel_3: clean(v.tel_3),
      enderecos: this.enderecos.controls.map((ctrl) => ({
        id: ctrl.get('id')?.value ?? undefined,
        municipio: ctrl.get('municipio')?.value,
        cep: clean(ctrl.get('cep')?.value),
        bairro: (ctrl.get('bairro')?.value ?? '').trim() || undefined,
        rua: (ctrl.get('rua')?.value ?? '').trim() || undefined,
        num: (ctrl.get('num')?.value ?? '').trim() || undefined,
        complemento: (ctrl.get('complemento')?.value ?? '').trim() || undefined,
        ponto_referencia: (ctrl.get('ponto_referencia')?.value ?? '').trim() || undefined,
      })),
    };
  }

  invalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  invalidEndereco(idx: number, controlName: string): boolean {
    const c = this.enderecos.at(idx)?.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }

  goBack(): void {
    this.router.navigate(['/app/clientes']);
  }
}

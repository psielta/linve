import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageService } from 'primeng/api';
import { ClienteService } from '../../services/cliente.service';
import { DadosAbertosService } from '../../services/dados-abertos.service';
import { ClienteInput } from '../../../../core/api/models/cliente-input';
import { ClienteOutput } from '../../../../core/api/models/cliente-output';
import { UfOutput } from '../../../../core/api/models/uf-output';
import { MunicipioOutput } from '../../../../core/api/models/municipio-output';
import { TenantService } from '../../../../core/services/tenant.service';

interface MunicipioView {
  codigo: number;
  nome: string;
  ufSigla: string;
  display: string;
}

interface TipoDocumentoOption {
  label: string;
  value: 'CPF' | 'CNPJ';
}

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule,
    CardModule,
    DividerModule,
    ToastModule,
    InputMaskModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="card">
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <p class="text-sm text-surface-500 mb-1">Cadastros</p>
          <h2 class="text-2xl font-bold m-0">
            {{ isEditMode() ? 'Editar Cliente' : 'Novo Cliente' }}
          </h2>
        </div>
        <div class="flex gap-2">
          <p-button label="Voltar" severity="secondary" icon="pi pi-arrow-left" (onClick)="goBack()" [text]="true" />
          <p-button label="Salvar" icon="pi pi-check" (onClick)="submit()" [loading]="saving()" />
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <!-- Dados do Cliente -->
        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="pi pi-user text-primary"></i>
            Dados do Cliente
          </h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2 lg:col-span-2">
              <label class="font-semibold">Nome *</label>
              <input
                pInputText
                formControlName="nome"
                placeholder="Nome completo do cliente"
                [ngClass]="{'w-full': true, 'ng-invalid ng-dirty': invalid('nome')}"
              />
              <small class="text-red-500" *ngIf="invalid('nome')">Informe o nome (max. 200 caracteres)</small>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Tipo de Documento</label>
              <p-select
                [(ngModel)]="tipoDocumento"
                [ngModelOptions]="{standalone: true}"
                [options]="tiposDocumento"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                (onChange)="onTipoDocumentoChange()"
                styleClass="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">{{ tipoDocumento === 'CNPJ' ? 'CNPJ' : 'CPF' }}</label>
              @if (tipoDocumento === 'CNPJ') {
                <p-inputMask
                  formControlName="documento"
                  mask="99.999.999/9999-99"
                  placeholder="00.000.000/0000-00"
                  slotChar=" "
                  styleClass="w-full"
                />
              } @else {
                <p-inputMask
                  formControlName="documento"
                  mask="999.999.999-99"
                  placeholder="000.000.000-00"
                  slotChar=" "
                  styleClass="w-full"
                />
              }
              <small class="text-surface-500">Deixe em branco se nao possuir</small>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Telefone 1</label>
              <p-inputMask
                formControlName="tel1"
                mask="(99) 99999-9999"
                placeholder="(00) 00000-0000"
                slotChar=" "
                styleClass="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Telefone 2</label>
              <p-inputMask
                formControlName="tel2"
                mask="(99) 99999-9999"
                placeholder="(00) 00000-0000"
                slotChar=" "
                styleClass="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Telefone 3</label>
              <p-inputMask
                formControlName="tel3"
                mask="(99) 99999-9999"
                placeholder="(00) 00000-0000"
                slotChar=" "
                styleClass="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Enderecos -->
        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold flex items-center gap-2 m-0">
              <i class="pi pi-map-marker text-primary"></i>
              Enderecos *
            </h3>
            <p-button
              label="Adicionar Endereco"
              icon="pi pi-plus"
              [outlined]="true"
              (onClick)="addEndereco()"
            />
          </div>

          @if (enderecosInvalidos() && enderecos.length === 0) {
            <div class="p-4 rounded-lg border border-solid border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 mb-4">
              <div class="flex items-center gap-3 text-red-700 dark:text-red-400">
                <i class="pi pi-exclamation-triangle text-xl"></i>
                <span class="font-medium">Adicione ao menos um endereco</span>
              </div>
            </div>
          }

          <div class="space-y-4" formArrayName="enderecos">
            @for (endereco of enderecos.controls; track $index; let i = $index) {
              <div class="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900" [formGroupName]="i">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-semibold text-surface-600 dark:text-surface-300">Endereco {{ i + 1 }}</span>
                  <p-button
                    icon="pi pi-trash"
                    [text]="true"
                    severity="danger"
                    [rounded]="true"
                    pTooltip="Remover endereco"
                    tooltipPosition="top"
                    (onClick)="removeEndereco(i)"
                    [disabled]="enderecos.length === 1"
                  />
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div class="flex flex-col gap-2 lg:col-span-2">
                    <label class="font-semibold">Municipio *</label>
                    <p-autoComplete
                      [ngModel]="getEnderecoMunicipio(i)"
                      [ngModelOptions]="{standalone: true}"
                      [suggestions]="municipioSuggestions()"
                      (completeMethod)="searchMunicipio($event)"
                      (onSelect)="onMunicipioSelect($event, i)"
                      (onClear)="onMunicipioClear(i)"
                      optionLabel="display"
                      [dropdown]="true"
                      [forceSelection]="true"
                      placeholder="Digite o nome do municipio..."
                      styleClass="w-full"
                      inputStyleClass="w-full"
                      [invalid]="invalidEndereco(i, 'municipio')"
                    >
                      <ng-template let-mun #item>
                        <div class="flex items-center gap-2">
                          <span>{{ mun.nome }}</span>
                          <span class="text-surface-500">- {{ mun.ufSigla }}</span>
                        </div>
                      </ng-template>
                    </p-autoComplete>
                    <small class="text-red-500" *ngIf="invalidEndereco(i, 'municipio')">Selecione um municipio</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">CEP</label>
                    <p-inputMask
                      formControlName="cep"
                      mask="99999-999"
                      placeholder="00000-000"
                      slotChar=" "
                      styleClass="w-full"
                    />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Bairro</label>
                    <input pInputText formControlName="bairro" placeholder="Bairro" class="w-full" />
                  </div>

                  <div class="flex flex-col gap-2 lg:col-span-2">
                    <label class="font-semibold">Rua/Logradouro</label>
                    <input pInputText formControlName="rua" placeholder="Rua, Avenida, etc." class="w-full" />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Numero</label>
                    <input pInputText formControlName="num" placeholder="123" class="w-full" />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Complemento</label>
                    <input pInputText formControlName="complemento" placeholder="Ap, Bloco, etc." class="w-full" />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Ponto de Referencia</label>
                    <input pInputText formControlName="pontoReferencia" placeholder="Proximo ao..." class="w-full" />
                  </div>
                </div>
              </div>
            }
          </div>
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
            label="Salvar Cliente"
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
export class ClienteFormComponent implements OnInit {
  private tenantService = inject(TenantService);

  form: FormGroup;

  saving = signal(false);
  isEditMode = signal(false);
  currentId: number | null = null;
  enderecosInvalidos = signal(false);

  tipoDocumento: 'CPF' | 'CNPJ' = 'CPF';
  tiposDocumento: TipoDocumentoOption[] = [
    { label: 'CPF', value: 'CPF' },
    { label: 'CNPJ', value: 'CNPJ' }
  ];

  ufs = signal<UfOutput[]>([]);
  allMunicipios = signal<MunicipioView[]>([]);
  municipioSuggestions = signal<MunicipioView[]>([]);

  // Armazena o municipio selecionado para cada endereco
  enderecoMunicipios: (MunicipioView | null)[] = [];

  private currentOrgId: number | null = null;

  constructor(
    private clienteService: ClienteService,
    private dadosAbertosService: DadosAbertosService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = new FormGroup({
      nome: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)]
      }),
      documento: new FormControl<string>('', { nonNullable: true }),
      tel1: new FormControl<string>('', { nonNullable: true }),
      tel2: new FormControl<string>('', { nonNullable: true }),
      tel3: new FormControl<string>('', { nonNullable: true }),
      enderecos: new FormArray([])
    });

    effect(() => {
      const orgId = this.tenantService.currentOrganizationId();
      if (orgId) {
        if (this.isEditMode() && this.currentOrgId && orgId !== this.currentOrgId) {
          this.messageService.add({
            severity: 'info',
            summary: 'Organizacao alterada',
            detail: 'Voce foi redirecionado para a listagem de clientes'
          });
          this.router.navigate(['/app/clientes']);
        }
        this.currentOrgId = orgId;
      }
    });
  }

  get enderecos(): FormArray {
    return this.form.get('enderecos') as FormArray;
  }

  getEnderecoMunicipio(index: number): MunicipioView | null {
    return this.enderecoMunicipios[index] || null;
  }

  onMunicipioSelect(event: AutoCompleteSelectEvent, index: number): void {
    const mun = event.value as MunicipioView;
    this.enderecoMunicipios[index] = mun;
    this.enderecos.at(index).get('municipio')?.setValue(mun);
  }

  onMunicipioClear(index: number): void {
    this.enderecoMunicipios[index] = null;
    this.enderecos.at(index).get('municipio')?.setValue(null);
  }

  onTipoDocumentoChange(): void {
    // Limpa o documento quando muda o tipo
    this.form.get('documento')?.setValue('');
  }

  ngOnInit(): void {
    this.loadUfsAndMunicipios().then(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.currentId = Number(id);
        this.loadCliente(this.currentId);
      } else {
        this.addEndereco();
      }
    });
  }

  async loadUfsAndMunicipios(): Promise<void> {
    return new Promise((resolve) => {
      this.dadosAbertosService.listarUfs().subscribe({
        next: (ufs) => {
          this.ufs.set(ufs);
          const allMunicipiosPromises = ufs.map(uf =>
            this.dadosAbertosService.listarMunicipios(uf.sigla).toPromise()
          );

          Promise.all(allMunicipiosPromises).then((results) => {
            const municipios: MunicipioView[] = [];
            results.forEach((muns, idx) => {
              const uf = ufs[idx];
              muns?.forEach(m => {
                municipios.push({
                  codigo: m.codigo,
                  nome: m.nome,
                  ufSigla: uf.sigla,
                  display: `${m.nome} - ${uf.sigla}`
                });
              });
            });
            this.allMunicipios.set(municipios);
            resolve();
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Atencao',
            detail: 'Nao foi possivel carregar os municipios'
          });
          resolve();
        }
      });
    });
  }

  /**
   * Normaliza string removendo acentos e convertendo para minúsculas
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  searchMunicipio(event: AutoCompleteCompleteEvent): void {
    const query = this.normalizeString(event.query.trim());
    if (!query) {
      this.municipioSuggestions.set(this.allMunicipios().slice(0, 50));
      return;
    }

    const filtered = this.allMunicipios().filter(m =>
      this.normalizeString(m.nome).includes(query) ||
      this.normalizeString(m.ufSigla).includes(query) ||
      this.normalizeString(m.display).includes(query)
    ).slice(0, 50);

    this.municipioSuggestions.set(filtered);
  }

  loadCliente(id: number): void {
    this.clienteService.buscar(id).subscribe({
      next: (cliente) => {
        // Detecta tipo de documento pelo numero de digitos
        const docNumeros = cliente.documento?.replace(/\D/g, '') || '';
        if (docNumeros.length === 14) {
          this.tipoDocumento = 'CNPJ';
        } else {
          this.tipoDocumento = 'CPF';
        }

        this.form.patchValue({
          nome: cliente.nome,
          documento: cliente.documento || '',
          tel1: cliente.tel_1 || '',
          tel2: cliente.tel_2 || '',
          tel3: cliente.tel_3 || ''
        });

        this.enderecos.clear();
        this.enderecoMunicipios = [];

        cliente.enderecos?.forEach(end => {
          const mun = this.allMunicipios().find(m => m.codigo === end.municipio);
          this.addEndereco({
            id: end.id,
            municipio: mun || null,
            cep: end.cep || '',
            bairro: end.bairro || '',
            rua: end.rua || '',
            num: end.num || '',
            complemento: end.complemento || '',
            pontoReferencia: end.ponto_referencia || ''
          });
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Cliente nao encontrado'
        });
        this.goBack();
      }
    });
  }

  addEndereco(data?: any): void {
    const enderecoGroup = new FormGroup({
      id: new FormControl<number | null>(data?.id || null),
      municipio: new FormControl<MunicipioView | null>(data?.municipio || null, { validators: Validators.required }),
      cep: new FormControl<string>(data?.cep || '', { nonNullable: true }),
      bairro: new FormControl<string>(data?.bairro || '', { nonNullable: true }),
      rua: new FormControl<string>(data?.rua || '', { nonNullable: true }),
      num: new FormControl<string>(data?.num || '', { nonNullable: true }),
      complemento: new FormControl<string>(data?.complemento || '', { nonNullable: true }),
      pontoReferencia: new FormControl<string>(data?.pontoReferencia || '', { nonNullable: true })
    });

    this.enderecos.push(enderecoGroup);
    this.enderecoMunicipios.push(data?.municipio || null);
    this.enderecosInvalidos.set(false);
  }

  removeEndereco(index: number): void {
    if (this.enderecos.length > 1) {
      this.enderecos.removeAt(index);
      this.enderecoMunicipios.splice(index, 1);
    }
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

    if (this.enderecos.length === 0) {
      this.enderecosInvalidos.set(true);
      this.messageService.add({
        severity: 'warn',
        summary: 'Adicione ao menos um endereco',
        detail: 'O cliente deve ter pelo menos um endereco cadastrado'
      });
      return;
    }

    this.enderecosInvalidos.set(false);

    const cleanNumber = (value: string) => value?.replace(/\D/g, '') || undefined;

    const payload: ClienteInput = {
      nome: this.form.get('nome')?.value.trim(),
      documento: cleanNumber(this.form.get('documento')?.value),
      tel_1: cleanNumber(this.form.get('tel1')?.value),
      tel_2: cleanNumber(this.form.get('tel2')?.value),
      tel_3: cleanNumber(this.form.get('tel3')?.value),
      enderecos: this.enderecos.controls.map((ctrl: any) => ({
        id: ctrl.get('id')?.value || undefined,
        municipio: ctrl.get('municipio')?.value?.codigo,
        cep: cleanNumber(ctrl.get('cep')?.value),
        bairro: ctrl.get('bairro')?.value?.trim() || undefined,
        rua: ctrl.get('rua')?.value?.trim() || undefined,
        num: ctrl.get('num')?.value?.trim() || undefined,
        complemento: ctrl.get('complemento')?.value?.trim() || undefined,
        ponto_referencia: ctrl.get('pontoReferencia')?.value?.trim() || undefined
      }))
    };

    this.saving.set(true);
    const request$ = this.isEditMode()
      ? this.clienteService.atualizar(this.currentId!, payload)
      : this.clienteService.criar(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode() ? 'Cliente atualizado' : 'Cliente criado'
        });
        this.router.navigate(['/app/clientes']);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.detail || 'Nao foi possivel salvar o cliente'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/clientes']);
  }

  invalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  invalidEndereco(index: number, controlName: string): boolean {
    const control = this.enderecos.at(index)?.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}

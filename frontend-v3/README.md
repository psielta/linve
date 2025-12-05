# Linve Frontend v3

Frontend Angular 19 com componentes GovBR DS para o sistema Linve - Gestão de Delivery.

## Tecnologias

- **Angular 19** - Framework frontend
- **GovBR DS Web Components** - Design System do Governo Brasileiro
- **SCSS** - Estilização com variáveis CSS
- **TypeScript** - Tipagem estática

## Instalação

```bash
cd frontend-v3
npm install
```

## Execução

```bash
# Desenvolvimento
npm start

# Build de produção
npm run build
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── core/               # Serviços singleton e guards
│   │   ├── guards/         # AuthGuard, etc.
│   │   └── services/       # AuthService, etc.
│   ├── pages/              # Páginas/rotas da aplicação
│   │   ├── auth/           # Login, Register
│   │   ├── dashboard/      # Dashboard principal
│   │   └── landing/        # Landing page pública
│   └── shared/             # Componentes e layouts reutilizáveis
│       ├── components/     # Header, Footer, Menu
│       └── layouts/        # GovbrLayoutComponent
├── assets/                 # Imagens e recursos estáticos
└── styles.scss            # Estilos globais
```

## Web Components GovBR DS

Por serem Web Components nativos (Custom Elements) e não componentes Angular, existem algumas particularidades no uso:

### 1. CUSTOM_ELEMENTS_SCHEMA

Todo componente Angular que usa tags do GovBR DS (como `<br-avatar>`, `<br-button>`, etc.) precisa declarar o schema:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
```

Sem isso, o Angular lança erros como `Can't bind to 'bg-color' since it isn't a known property`.

### 2. Interpolação vs Attribute Binding

Existem três formas de passar valores para atributos de Web Components:

| Sintaxe | Exemplo | Comportamento |
|---------|---------|---------------|
| Estático | `bg-color="#1351B4"` | Valor fixo, sempre presente |
| Interpolação | `bg-color="{{ valor }}"` | String interpolada, atributo sempre presente (mesmo vazio) |
| Attribute Binding | `[attr.bg-color]="valor"` | Binding explícito, `null` remove o atributo |

**Problema com interpolação:**

```html
<!-- ❌ Se valor for '', o atributo fica bg-color="" -->
<br-avatar bg-color="{{ temLogo ? '' : cor }}"></br-avatar>
```

Alguns Web Components não tratam bem atributos vazios e podem ignorar ou aplicar comportamento incorreto.

**Solução com attribute binding:**

```html
<!-- ✅ Se valor for null, o atributo é removido do DOM -->
<br-avatar [attr.bg-color]="temLogo ? null : cor"></br-avatar>
```

### 3. Atributos Obrigatórios do br-avatar

O componente `<br-avatar>` tem comportamentos específicos:

- **`alt`** (obrigatório): Sem este atributo, a imagem não é renderizada mesmo com `src` válido
- **`text`**: Se preenchido, **sobrescreve** a imagem. Use `text=""` quando houver imagem
- **`bg-color`**: Cor de fundo para avatares sem imagem (formato: `#RRGGBB`)

```html
<!-- Exemplo correto -->
<br-avatar
  density="medium"
  alt="Avatar do usuário"
  src="{{ imagemUrl }}"
  text="{{ imagemUrl ? '' : iniciais }}"
  [attr.bg-color]="imagemUrl ? null : '#1351B4'">
</br-avatar>
```

### 4. Slots em Web Components (br-table, br-card, etc.)

Alguns Web Components usam **slots nomeados** para projetar conteúdo em áreas específicas. Quando combinados com `*ngFor` do Angular, é necessário usar `[attr.slot]` em vez de `slot` estático.

**Problema com slot estático + *ngFor:**

```html
<!-- ❌ Angular pode não passar o atributo slot corretamente para elementos dinâmicos -->
<br-table>
  <br-table-header-row slot="header">...</br-table-header-row>
  <br-table-row slot="row" *ngFor="let item of items">...</br-table-row>
</br-table>
```

**Solução com attribute binding:**

```html
<!-- ✅ Usar [attr.slot] garante que o Angular passe o atributo corretamente -->
<br-table>
  <br-table-header-row [attr.slot]="'header'">
    <br-table-header-cell>ID</br-table-header-cell>
    <br-table-header-cell>Nome</br-table-header-cell>
  </br-table-header-row>

  <br-table-row [attr.slot]="'row'" *ngFor="let item of items; trackBy: trackByFn">
    <br-table-cell>{{ item.id }}</br-table-cell>
    <br-table-cell>{{ item.nome }}</br-table-cell>
  </br-table-row>
</br-table>
```

**Slots comuns nos componentes GovBR DS:**

| Componente | Slots disponíveis |
|------------|-------------------|
| `br-table` | `tool-bar`, `header`, `row`, `footer` |
| `br-card` | `header`, `content`, `footer` |
| `br-modal` | `header`, `footer` |

### 5. Boas Práticas

1. **Sempre adicione `CUSTOM_ELEMENTS_SCHEMA`** em componentes que usam GovBR DS
2. **Use `[attr.propriedade]`** para valores dinâmicos que podem ser `null`
3. **Use `[attr.slot]`** para slots em elementos gerados com `*ngFor`
4. **Consulte a documentação** em https://www.gov.br/ds/components para atributos obrigatórios
5. **Teste no Dark Mode** - alguns componentes usam variáveis CSS que precisam de override

### 6. Formulários com br-select e br-checkbox

Os componentes `br-select` e `br-checkbox` **NÃO funcionam corretamente** com `formControlName` do Angular Reactive Forms, mesmo utilizando os Value Accessors fornecidos (`SelectValueAccessor`, `BooleanValueAccessor`). É necessário usar uma abordagem manual com signals.

#### Problema

```html
<!-- ❌ NÃO FUNCIONA - formControlName não sincroniza valor -->
<br-select
  formControlName="meuCampo"
  [options]="opcoes">
</br-select>
```

O Web Component não reage corretamente às mudanças de valor do FormControl e não dispara os eventos esperados pelo Angular.

#### Solução: Abordagem Manual com Signals

**1. Declarar signals para controlar os valores:**

```typescript
// No componente
selectedValue = signal<string>('');

opcoes = [
  { label: 'Opção 1', value: '1' },
  { label: 'Opção 2', value: '2' },
];
```

**2. Usar `[value]` + `(valueChange)` no template:**

```html
<!-- ✅ FUNCIONA - controle manual com signal -->
<br-select
  label="Meu Campo"
  [options]="opcoes"
  [value]="selectedValue()"
  (valueChange)="onSelectChange($event)">
</br-select>
```

**3. Handler para atualizar signal e form:**

```typescript
onSelectChange(event: CustomEvent): void {
  const value = event.detail ?? '';
  this.form.get('meuCampo')?.setValue(value);
  this.selectedValue.set(value);
}
```

#### Problema com Valor Inicial em Edição

Quando o componente é renderizado com um valor inicial (ex: edição de registro), o `br-select` não exibe o valor selecionado mesmo que o signal tenha o valor correto. Isso ocorre porque o Web Component inicializa antes do Angular atualizar a propriedade.

**Solução: setTimeout para setar valor após renderização:**

```typescript
loadDados(): void {
  this.api.buscar(id).subscribe({
    next: (dados) => {
      this.form.patchValue({ meuCampo: dados.valor });
      this.loading.set(false);

      // Delay para o br-select reagir após renderização
      setTimeout(() => {
        this.selectedValue.set(dados.valor);
      }, 50);
    }
  });
}
```

#### br-checkbox

O `br-checkbox` também precisa de abordagem manual, usando o evento `(checkedChange)`:

```html
<!-- ✅ FUNCIONA -->
<br-checkbox
  [label]="'Ativo'"
  [checked]="form.get('ativo')?.value"
  (checkedChange)="onCheckChange($event)">
</br-checkbox>
```

```typescript
onCheckChange(event: CustomEvent<boolean>): void {
  this.form.get('ativo')?.setValue(event.detail);
}
```

#### br-input

O `br-input` **funciona** com `formControlName`, mas requer `ngDefaultControl`:

```html
<!-- ✅ FUNCIONA -->
<br-input
  formControlName="nome"
  ngDefaultControl
  label="Nome"
  placeholder="Digite o nome">
</br-input>
```

#### Resumo de Compatibilidade

| Componente | formControlName | Abordagem Manual |
|------------|-----------------|------------------|
| `br-input` | ✅ Funciona (com `ngDefaultControl`) | - |
| `br-select` | ❌ Não funciona | `[value]` + `(valueChange)` + signal |
| `br-checkbox` | ❌ Não funciona | `[checked]` + `(checkedChange)` |

#### Exemplo Completo

```typescript
@Component({
  // ...
})
export class MeuFormComponent {
  form: FormGroup;

  // Signals para controle manual dos selects
  selectedCategoria = signal<string>('');
  selectedStatus = signal<string>('');

  categoriaOptions = [
    { label: 'Categoria A', value: 'A' },
    { label: 'Categoria B', value: 'B' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      categoria: ['', Validators.required],
      ativo: [true],
    });
  }

  loadParaEdicao(id: number): void {
    this.api.buscar(id).subscribe({
      next: (dados) => {
        this.form.patchValue(dados);
        this.loading.set(false);

        // Delay para br-select
        setTimeout(() => {
          this.selectedCategoria.set(dados.categoria);
        }, 50);
      }
    });
  }

  onCategoriaChange(event: CustomEvent): void {
    const value = event.detail ?? '';
    this.form.get('categoria')?.setValue(value);
    this.selectedCategoria.set(value);
  }

  onAtivoChange(event: CustomEvent<boolean>): void {
    this.form.get('ativo')?.setValue(event.detail);
  }
}
```

```html
<form [formGroup]="form">
  <!-- br-input funciona com formControlName -->
  <br-input
    formControlName="nome"
    ngDefaultControl
    label="Nome">
  </br-input>

  <!-- br-select precisa de abordagem manual -->
  <br-select
    label="Categoria"
    [options]="categoriaOptions"
    [value]="selectedCategoria()"
    (valueChange)="onCategoriaChange($event)">
  </br-select>

  <!-- br-checkbox precisa de abordagem manual -->
  <br-checkbox
    label="Ativo"
    [checked]="form.get('ativo')?.value"
    (checkedChange)="onAtivoChange($event)">
  </br-checkbox>
</form>
```

## Responsividade

O sistema suporta múltiplos tamanhos de tela:

| Breakpoint | Largura       | Dispositivos              |
|------------|---------------|---------------------------|
| xs         | 0-575px       | Mobile pequeno            |
| sm         | 576-767px     | Mobile grande             |
| md         | 768-991px     | Tablet                    |
| lg         | 992-1199px    | Laptop pequeno            |
| xl         | 1200-1399px   | Laptop/Desktop HD         |
| xxl        | 1400-1919px   | Desktop Full HD           |
| 3xl        | 1920-2559px   | Desktop Full HD+          |
| 4xl        | 2560-3839px   | Monitor 2K/QHD            |
| 5xl        | 3840px+       | Monitor 4K/8K             |

## Licença

Projeto interno - Todos os direitos reservados.

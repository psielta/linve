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
│   │   └── services/       # AuthService, ThemeService, etc.
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

## Dark Mode

O sistema suporta alternância entre tema claro e escuro, utilizando as variáveis CSS nativas do GovBR DS.

### Funcionalidades

1. **Persistência**: Preferência de tema salva no localStorage
2. **Preferência do Sistema**: Detecta automaticamente `prefers-color-scheme` do SO
3. **Toggle Manual**: Botão de alternância no header (ícone sol/lua)
4. **Transição Suave**: Animação CSS de 300ms entre temas
5. **Componentes GovBR**: Utiliza sistema de temas nativo do Design System

### Uso

O tema é gerenciado pelo `ThemeService`:

```typescript
import { ThemeService } from './core/services/theme.service';

// Injetar o serviço
private themeService = inject(ThemeService);

// Acessar estado reativo (Signal)
isDarkMode = this.themeService.isDarkMode;

// Alternar tema
this.themeService.toggleTheme();

// Definir tema específico
this.themeService.setTheme(true);  // dark mode
this.themeService.setTheme(false); // light mode

// Resetar para preferência do sistema
this.themeService.resetToSystemPreference();
```

### Variáveis CSS

O dark mode sobrescreve as variáveis principais do GovBR DS:

```scss
body.dark-mode {
  --background: var(--background-dark, #071D41);
  --color: var(--color-dark, #FFFFFF);
  --interactive: var(--interactive-dark, #C5D4EB);
  // ...
}
```

### Estilização de Componentes

Para estilos específicos de dark mode em componentes, use `:host-context`:

```scss
:host-context(body.dark-mode) {
  .my-component {
    background: var(--gray-5);
    color: var(--pure-0);
  }
}
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

### 4. Boas Práticas

1. **Sempre adicione `CUSTOM_ELEMENTS_SCHEMA`** em componentes que usam GovBR DS
2. **Use `[attr.propriedade]`** para valores dinâmicos que podem ser `null`
3. **Consulte a documentação** em https://www.gov.br/ds/components para atributos obrigatórios
4. **Teste no Dark Mode** - alguns componentes usam variáveis CSS que precisam de override

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

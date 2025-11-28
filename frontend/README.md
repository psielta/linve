# Linve - Frontend

Frontend Angular para o sistema Linve de gestão de delivery, com Admin Dashboard inspirado no Metronic, autenticação JWT e multi-tenancy.

## Tecnologias

- **Angular 20** com standalone components
- **TypeScript** com strict mode
- **SCSS** para estilos
- **RxJS** para programação reativa
- **Signals** para gerenciamento de estado reativo

## Bibliotecas UI

O projeto utiliza um conjunto de bibliotecas inspirado no **Metronic Theme**:

### Core UI
| Biblioteca | Descrição |
|------------|-----------|
| Bootstrap 5 | Framework CSS responsivo |
| ngx-bootstrap | Componentes Bootstrap para Angular |
| PrimeNG | Componentes UI avançados (DataTable, etc) |

### Utilitários
| Biblioteca | Descrição |
|------------|-----------|
| LocalForage | Armazenamento offline assíncrono |
| Luxon | Manipulação de datas (alternativa ao Moment.js) |
| Lodash-es | Utilitários JavaScript (ES modules) |

### Ícones e Visual
| Biblioteca | Descrição |
|------------|-----------|
| Font Awesome | Ícones vetoriais |
| Simple Line Icons | Ícones minimalistas |
| PrimeIcons | Ícones do PrimeNG |
| Famfamfam Flags | Bandeiras de países |
| Animate.css | Animações CSS |

### Componentes Especializados
| Biblioteca | Descrição |
|------------|-----------|
| SweetAlert2 | Modais e alertas elegantes |
| ngx-charts | Gráficos (Swimlane) |
| angular-oauth2-oidc | Autenticação OAuth2/OIDC |
| angular2-counto | Animações de contagem |
| angular2-text-mask | Máscaras de input |
| ng-recaptcha | Integração reCAPTCHA |
| ng2-file-upload | Upload de arquivos |
| ngx-image-cropper | Crop de imagens |
| ngx-perfect-scrollbar | Scrollbar customizada |
| push.js | Notificações push |
| rtl-detect | Detecção RTL |
| spin.js | Spinners de carregamento |

## Sistema de Temas

O projeto implementa um sistema de temas com três opções:
- **Light** - Tema claro
- **Dark** - Tema escuro
- **System** - Segue preferência do sistema operacional

### ThemeService

```typescript
import { ThemeService } from './core/services/theme.service';

// Injetar o serviço
constructor(public themeService: ThemeService) {}

// Alternar entre temas (light -> dark -> system)
themeService.cycle();

// Definir tema específico
themeService.setTheme('dark');

// Verificar tema atual
if (themeService.isDark()) { ... }

// Obter ícone do tema atual
themeService.getIcon(); // 'fa-sun', 'fa-moon', ou 'fa-desktop'
```

### CSS Custom Properties

O tema utiliza variáveis CSS para fácil customização:

```scss
:root {
  --primary: #3699ff;
  --bg-body: #f5f8fa;
  --bg-card: #ffffff;
  --text-primary: #181c32;
  --text-secondary: #7e8299;
  --border-color: #e4e6ef;
}

[data-theme="dark"] {
  --bg-body: #1e1e2d;
  --bg-card: #2b2b40;
  --text-primary: #ffffff;
  // ...
}
```

## Geração de Cliente API (ng-openapi-gen)

O projeto utiliza **ng-openapi-gen** para gerar automaticamente os clientes TypeScript a partir do OpenAPI/Swagger do backend Java.

### Configuração

O arquivo de configuração está em `ng-openapi-gen.json`:

```json
{
  "input": "http://localhost:8080/api-docs",
  "output": "src/app/core/api",
  "serviceSuffix": "Client"
}
```

### Gerar Clientes

1. Certifique-se que o backend está rodando
2. Execute:

```bash
npm run generate-api
```

Isso gerará em `src/app/core/api/`:
- **Modelos** (`models/`) - Interfaces tipadas (TodoOutput, AuthResponse, etc.)
- **Funções** (`fn/`) - Funções para cada endpoint da API
- **Api** (`api.ts`) - Serviço helper para invocar as funções

### Uso nos Serviços

```typescript
import { Api, listar, criar, TodoOutput, TodoInput } from '../api';

@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private api: Api) {}

  listar(concluido?: boolean): Observable<TodoOutput[]> {
    return from(this.api.invoke(listar, { concluido }));
  }

  criar(input: TodoInput): Observable<TodoOutput> {
    return from(this.api.invoke(criar, { body: input }));
  }
}
```

### Benefícios

1. **Type Safety** - Tipos 100% sincronizados com o backend
2. **Menos código manual** - Não precisa escrever DTOs manualmente
3. **Documentação atualizada** - Sempre reflete a API atual
4. **Refatoração segura** - Mudanças no backend quebram build se incompatíveis
5. **IntelliSense completo** - Autocompletar de métodos e parâmetros

## Arquitetura

```
src/app/
├── app.ts                    # Componente raiz
├── app.config.ts             # Configuração da aplicação
├── app.routes.ts             # Rotas com lazy loading
├── core/                     # Serviços e utilitários singleton
│   ├── api/                  # Clientes gerados (ng-openapi-gen)
│   ├── guards/               # Guards de rota (auth, guest)
│   ├── interceptors/         # Interceptors HTTP (JWT)
│   ├── models/               # Interfaces compartilhadas
│   │   ├── menu-item.model.ts    # MenuItem, Breadcrumb
│   │   └── notification.model.ts # Notification, QuickAction
│   └── services/             # Serviços (auth, todo, theme)
├── layouts/                  # Layouts da aplicação
│   └── admin-layout/         # Layout do Admin Dashboard
│       ├── config/
│       │   └── menu.config.ts    # Configuração do menu
│       ├── services/
│       │   ├── sidebar.service.ts    # Estado do sidebar
│       │   ├── menu.service.ts       # Filtro por role
│       │   └── breadcrumb.service.ts # Breadcrumbs automáticos
│       ├── components/
│       │   ├── sidebar/          # Sidebar colapsável
│       │   │   └── menu-item/    # Item recursivo com animações
│       │   ├── header/           # Header completo
│       │   │   ├── header-search/
│       │   │   ├── header-notifications/
│       │   │   ├── header-quick-actions/
│       │   │   ├── header-org-switcher/
│       │   │   └── header-user-menu/
│       │   └── breadcrumb/       # Breadcrumbs automáticos
│       └── admin-layout.component.ts
├── features/                 # Módulos de funcionalidades
│   ├── auth/                 # Login e registro
│   │   └── components/
│   │       ├── login/
│   │       └── register/
│   ├── dashboard/            # Dashboard principal
│   │   └── components/
│   │       └── stats-card/   # Cards de estatísticas
│   ├── todos/                # CRUD de tarefas
│   │   └── components/
│   │       ├── todo-list/
│   │       └── todo-form/
│   ├── deliveries/           # Entregas (placeholder)
│   ├── clients/              # Clientes (placeholder)
│   ├── reports/              # Relatórios (placeholder)
│   ├── settings/             # Configurações (placeholder)
│   ├── profile/              # Perfil (placeholder)
│   └── notifications/        # Notificações (placeholder)
└── environments/             # Configurações por ambiente
```

## Padrões Utilizados

### Standalone Components
Todos os componentes são standalone, sem necessidade de NgModules:

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `...`,
  styles: [`...`]
})
```

### Signals
Estado reativo usando Signals do Angular:

```typescript
loading = signal(false);
error = signal<string | null>(null);
todos = signal<Todo[]>([]);
```

### Functional Guards e Interceptors
Abordagem funcional moderna:

```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated
    ? true
    : inject(Router).createUrlTree(['/auth/login']);
};
```

### Control Flow
Novo syntax de controle de fluxo:

```html
@if (loading()) {
  <div class="spinner"></div>
} @else {
  <div class="content">...</div>
}

@for (todo of todos(); track todo.id) {
  <div class="todo-item">{{ todo.titulo }}</div>
}
```

## Configuração

### Desenvolvimento

```bash
npm install
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

O proxy está configurado para redirecionar chamadas `/api` para o backend em `http://localhost:8080`.

### Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/frontend/`.

## Variáveis de Ambiente

| Arquivo | Uso |
|---------|-----|
| `environment.ts` | Desenvolvimento (apiUrl: `http://localhost:8080`) |
| `environment.prod.ts` | Produção (apiUrl: vazio - usa URL relativa) |

## Funcionalidades

### Autenticação
- Login com email/senha
- Registro com criação automática de organização
- Refresh token automático em caso de 401/403
- Logout com invalidação de token

### Tarefas
- Listagem com filtros (todas, pendentes, concluídas)
- Criação e edição via modal
- Marcar como concluída/reabrir
- Exclusão com confirmação (SweetAlert2)
- Notificações toast de sucesso

### Tema
- Toggle light/dark/system
- Persistência em localStorage
- Detecção automática de preferência do sistema
- Transições suaves entre temas

## Admin Dashboard (Metronic-Style)

O projeto implementa um Admin Dashboard completo inspirado no Metronic Theme, com sidebar colapsável, header rico em funcionalidades e sistema de breadcrumbs automáticos.

### Sidebar Service

Gerencia o estado do sidebar usando Angular Signals com persistência em localStorage:

```typescript
import { SidebarService } from './layouts/admin-layout/services/sidebar.service';

// Injetar o serviço
sidebarService = inject(SidebarService);

// Verificar estado
sidebarService.isCollapsed();      // Signal<boolean>
sidebarService.isMobileOpen();     // Signal<boolean>

// Controlar sidebar
sidebarService.toggle();           // Alterna collapsed
sidebarService.toggleMobile();     // Alterna drawer mobile
sidebarService.closeMobile();      // Fecha drawer mobile

// Controlar submenus
sidebarService.toggleMenuItem('dashboard');      // Expande/colapsa
sidebarService.isMenuItemExpanded('dashboard');  // Verifica estado
```

### Menu Configuration

O menu é configurado via TypeScript com suporte a hierarquia, roles e badges:

```typescript
// layouts/admin-layout/config/menu.config.ts
import { MenuItem } from '../../../core/models/menu-item.model';

export const ADMIN_MENU: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-solid fa-gauge-high',
    route: '/dashboard'
  },
  {
    id: 'cadastros',
    label: 'Cadastros',
    icon: 'fa-solid fa-folder',
    children: [
      {
        id: 'clientes',
        label: 'Clientes',
        icon: 'fa-solid fa-users',
        route: '/clients'
      },
      {
        id: 'produtos',
        label: 'Produtos',
        icon: 'fa-solid fa-box',
        route: '/products',
        badge: { text: 'Novo', color: 'success' }
      }
    ]
  },
  {
    id: 'admin-separator',
    label: 'Administração',
    separator: true
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: 'fa-solid fa-cog',
    route: '/settings',
    roles: ['OWNER', 'ADMIN']  // Visível apenas para OWNER e ADMIN
  }
];

// Filtrar menu por role
import { filterMenuByRole } from './config/menu.config';
const menuFiltrado = filterMenuByRole(ADMIN_MENU, 'MEMBER');
```

### Menu Service

Integra o menu config com o AuthService para filtrar automaticamente por role:

```typescript
import { MenuService } from './layouts/admin-layout/services/menu.service';

menuService = inject(MenuService);

// Itens filtrados pela role do usuário atual (computed signal)
menuService.filteredItems();  // Signal<MenuItem[]>
```

### Breadcrumb Service

Gera breadcrumbs automaticamente baseado nas rotas:

```typescript
// Configurar nas rotas
{
  path: 'clients',
  data: { breadcrumb: 'Clientes' },
  children: [
    {
      path: 'new',
      loadComponent: () => import('./client-form.component'),
      data: {
        breadcrumb: 'Novo Cliente',
        title: 'Cadastrar Cliente'  // Título da página
      }
    }
  ]
}

// Usar no componente
import { BreadcrumbService } from './layouts/admin-layout/services/breadcrumb.service';

breadcrumbService = inject(BreadcrumbService);
breadcrumbService.breadcrumbs();  // Signal<Breadcrumb[]>
breadcrumbService.pageTitle();    // Signal<string | null>
```

### Header Components

O header é modular com componentes independentes:

| Componente | Descrição |
|------------|-----------|
| `HeaderSearchComponent` | Busca global com atalho Ctrl+K |
| `HeaderNotificationsComponent` | Dropdown de notificações com badge |
| `HeaderQuickActionsComponent` | Grid de ações rápidas |
| `HeaderOrgSwitcherComponent` | Troca de organização (multi-tenant) |
| `HeaderUserMenuComponent` | Menu do usuário com logout |

### Stats Card Component

Componente reutilizável para exibir métricas:

```typescript
import { StatsCardComponent, StatsCardData } from './features/dashboard/components/stats-card';

// No template
<app-stats-card [data]="cardData" />

// Dados
cardData: StatsCardData = {
  title: 'Total Entregas',
  value: '1,234',
  change: 12.5,           // Percentual de mudança
  changeLabel: 'vs mês anterior',
  icon: 'fa-solid fa-truck',
  color: 'primary',       // primary | success | warning | danger | info
  loading: false
};
```

### CSS Variables do Admin Layout

O layout usa variáveis CSS para fácil customização:

```scss
// Dimensões
--sidebar-width: 280px;
--sidebar-collapsed-width: 80px;
--header-height: 65px;

// Cores do Sidebar (Light)
--sidebar-bg: #1e1e2d;
--sidebar-text: #9899ac;
--sidebar-text-hover: #ffffff;
--sidebar-menu-active-bg: rgba(255, 255, 255, 0.05);

// Cores do Sidebar (Dark)
[data-theme="dark"] {
  --sidebar-bg: #151521;
  --sidebar-text: #6d6e82;
}
```

---

## Sistema de Temas - Guia Detalhado

Esta seção explica em detalhes como o sistema de temas funciona, para que você possa entender e modificar conforme necessário.

### Conceito: CSS Custom Properties (Variáveis CSS)

CSS Custom Properties são variáveis que você define uma vez e reutiliza em todo o CSS. A grande vantagem é que você pode mudar o valor em um lugar e ele se propaga para todos os lugares que usam essa variável.

```scss
// Definir uma variável
:root {
  --minha-cor: #3699ff;
}

// Usar a variável
.botao {
  background-color: var(--minha-cor);  // Usa #3699ff
}
```

### Como o Tema Light/Dark Funciona

O truque é definir as mesmas variáveis com valores diferentes para cada tema:

```scss
// Tema Light (padrão) - definido em :root
:root {
  --bg-body: #ffffff;        // Fundo branco
  --text-primary: #0f172a;   // Texto escuro
}

// Tema Dark - ativado quando o atributo data-theme="dark" está no HTML
[data-theme="dark"] {
  --bg-body: #0f172a;        // Fundo escuro
  --text-primary: #f1f5f9;   // Texto claro
}
```

Quando o `ThemeService` muda o tema, ele adiciona/remove o atributo `data-theme="dark"` no elemento `<html>`. Automaticamente, todas as variáveis mudam de valor!

### Paleta de Cores Slate (Tailwind-Inspired)

O projeto usa uma paleta de cores "Slate" inspirada no Tailwind CSS. São tons de cinza-azulado que ficam elegantes e profissionais:

| Cor | Hex | Uso |
|-----|-----|-----|
| slate-50 | `#f8fafc` | Fundos secundários (light) |
| slate-100 | `#f1f5f9` | Backgrounds sutis |
| slate-200 | `#e2e8f0` | Bordas (light) |
| slate-300 | `#cbd5e1` | Bordas hover |
| slate-400 | `#94a3b8` | Texto muted |
| slate-500 | `#64748b` | Texto secundário |
| slate-600 | `#475569` | Texto secundário (light) |
| slate-700 | `#334155` | Cards (dark) |
| slate-800 | `#1e293b` | Background cards (dark) |
| slate-900 | `#0f172a` | Background body (dark) |
| slate-950 | `#020617` | Backgrounds mais escuros |

### Organização das Variáveis CSS

As variáveis estão organizadas em grupos no arquivo `styles.scss`:

```scss
:root {
  // ====== CORES PRIMÁRIAS ======
  // Azul principal usado em botões, links, elementos de destaque
  --primary: #3699ff;
  --primary-hover: #187de4;      // Hover é mais escuro
  --primary-light: rgba(54, 153, 255, 0.1);  // Versão transparente para backgrounds
  --primary-rgb: 54, 153, 255;   // RGB para usar com rgba()

  // ====== CORES SEMÂNTICAS ======
  // Feedback visual (sucesso, erro, aviso, info)
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #8b5cf6;

  // ====== FUNDOS ======
  --bg-body: #ffffff;      // Fundo principal da página
  --bg-card: #ffffff;      // Fundo dos cards
  --bg-secondary: #f8fafc; // Fundo de áreas secundárias
  --bg-hover: rgba(15, 23, 42, 0.04); // Cor ao passar o mouse

  // ====== TEXTOS ======
  --text-primary: #0f172a;   // Texto principal (títulos)
  --text-secondary: #475569; // Texto secundário
  --text-muted: #94a3b8;     // Texto de menor importância

  // ====== INPUTS/FORMULÁRIOS ======
  --input-bg: #ffffff;
  --input-border: #e2e8f0;
  --input-border-focus: #3699ff;  // Borda quando focado
  --input-text: #0f172a;
  --input-placeholder: #94a3b8;
}
```

### Como Adicionar uma Nova Variável

Se você precisa de uma nova cor/variável:

1. **Defina no :root (light theme)**:
```scss
:root {
  --minha-nova-cor: #valor-light;
}
```

2. **Defina no [data-theme="dark"]**:
```scss
[data-theme="dark"] {
  --minha-nova-cor: #valor-dark;
}
```

3. **Use onde precisar**:
```scss
.meu-componente {
  color: var(--minha-nova-cor);
}
```

### Variáveis RGB - Por que usar?

Algumas variáveis têm versão RGB (ex: `--primary-rgb: 54, 153, 255`). Isso permite usar a cor com transparência:

```scss
// Não funciona - não pode misturar hex com rgba
background: rgba(#3699ff, 0.1);  // ERRO!

// Funciona - usando a variável RGB
background: rgba(var(--primary-rgb), 0.1);  // OK!
```

---

## Páginas de Autenticação - Guia de Estilização

As páginas de login e registro têm um design especial que vale entender.

### Estrutura HTML

```html
<div class="auth-wrapper">
  <!-- Botão de tema no canto -->
  <button class="theme-toggle">...</button>

  <!-- Card central -->
  <div class="auth-card">
    <h1>Login</h1>
    <form>...</form>
  </div>
</div>
```

### O Wrapper (auth-wrapper)

O wrapper ocupa a tela inteira e centraliza o card:

```scss
.auth-wrapper {
  min-height: 100vh;          // Altura mínima = tela inteira
  display: flex;              // Flexbox para centralizar
  align-items: center;        // Centraliza verticalmente
  justify-content: center;    // Centraliza horizontalmente

  // Gradiente de fundo (tons slate escuros)
  background: linear-gradient(
    135deg,                           // Direção diagonal
    var(--auth-gradient-start) 0%,    // Cor inicial
    var(--auth-gradient-end) 100%     // Cor final
  );

  // Efeito de pattern (pontos sutis)
  &::before {
    content: '';
    position: absolute;
    inset: 0;  // Cobre tudo (top, right, bottom, left = 0)
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.03) 1px,  // Pontinhos brancos sutis
      transparent 1px
    );
    background-size: 24px 24px;  // Espaçamento entre pontos
  }
}
```

### O Card (auth-card)

O card tem visual de glassmorphism (vidro fosco):

```scss
.auth-card {
  background: rgba(255, 255, 255, 0.95);  // Branco quase opaco
  border-radius: 16px;                     // Bordas bem arredondadas
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);  // Sombra suave
  border: 1px solid rgba(255, 255, 255, 0.1);  // Borda sutil

  // Dark mode - card escuro com blur
  [data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.95);  // Slate-800 translúcido
    backdrop-filter: blur(10px);          // Efeito de blur
  }
}
```

### O Botão de Tema nas Páginas Auth

Como o fundo é escuro, o botão precisa de estilo especial:

```scss
.auth-wrapper .theme-toggle {
  background: rgba(255, 255, 255, 0.1);     // Fundo translúcido claro
  border-color: rgba(255, 255, 255, 0.15);  // Borda sutil
  backdrop-filter: blur(10px);               // Efeito de vidro

  i {
    color: rgba(255, 255, 255, 0.8);  // Ícone branco
  }
}
```

---

## Sidebar Colapsável - Guia Técnico

### Como Funciona o Popover no Modo Colapsado

Quando a sidebar está colapsada (minimizada), os submenus aparecem como popovers ao lado:

```
┌──────┐
│ Icon │ ← Hover aqui
└──────┘
         ┌─────────────────┐
         │ Menu Popover    │ ← Aparece aqui
         │ • Submenu 1     │
         │ • Submenu 2     │
         └─────────────────┘
```

#### O Problema do Overflow

Por padrão, o CSS esconde elementos que "vazam" do container pai. Para o popover aparecer fora da sidebar, precisamos de `overflow: visible`:

```scss
.admin-sidebar.collapsed {
  overflow: visible;  // Permite elementos vazarem

  .sidebar-menu {
    overflow: visible;  // Menu também precisa
  }
}
```

#### Posicionamento Absoluto

O popover usa `position: absolute` para aparecer fora do fluxo normal:

```scss
.menu-popover {
  position: absolute;
  left: 100%;           // Começa onde o pai termina
  transform: translateX(8px);  // 8px de espaço
  top: 0;               // Alinhado ao topo do item
  z-index: 1000;        // Acima de tudo
}
```

### DestroyRef e takeUntilDestroyed

Quando você faz uma subscription (inscrição) em um Observable, ela continua ativa mesmo se o componente for destruído. Isso causa memory leaks!

#### O Problema

```typescript
// ERRADO - subscription nunca é cancelada
ngOnInit() {
  this.router.events.subscribe(() => {
    // Isso continua rodando mesmo após o componente morrer!
  });
}
```

#### A Solução: takeUntilDestroyed

```typescript
// CERTO - subscription é cancelada automaticamente
export class MeuComponent {
  private destroyRef = inject(DestroyRef);  // Injetar referência

  ngOnInit() {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef)  // Cancela quando destruído
      )
      .subscribe(() => {
        // Seguro! Para de rodar quando componente morre
      });
  }
}
```

#### Por que precisa do DestroyRef?

O `takeUntilDestroyed()` só funciona em "contexto de injeção" (constructor, field initializer). No `ngOnInit()`, precisamos passar o `DestroyRef` explicitamente.

```typescript
// No constructor - não precisa do parâmetro
constructor() {
  this.router.events.pipe(takeUntilDestroyed()).subscribe();  // OK!
}

// No ngOnInit - PRECISA do parâmetro
ngOnInit() {
  this.router.events.pipe(takeUntilDestroyed()).subscribe();  // ERRO!
  this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();  // OK!
}
```

---

## Dropdown do Usuário - Estrutura

O dropdown no header mostra informações do usuário e ações:

```
┌─────────────────────────┐
│ [Avatar] Nome Usuário   │  ← Seção de info
│          email@...      │
│          [Badge Role]   │
├─────────────────────────┤  ← Divisor
│ 👤 Meu Perfil          │
│ ⚙️ Configurações       │  ← Menu items
│ 💳 Faturamento         │
├─────────────────────────┤  ← Divisor
│ ❓ Central de Ajuda    │
│ ✉️ Contato             │
├─────────────────────────┤  ← Border-top do footer
│ ┌─────────────────────┐ │
│ │   🚪 Sair da conta  │ │  ← Botão estilizado
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Estilo do Botão de Logout

O botão de logout tem um visual diferenciado para chamar atenção:

```scss
.dropdown-footer {
  padding: 10px 12px;
  border-top: 1px solid var(--border-color);  // Separador
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;

  // Visual de "danger" (vermelho)
  background: rgba(var(--danger-rgb), 0.08);  // Vermelho bem claro
  border: 1px solid rgba(var(--danger-rgb), 0.15);
  border-radius: 8px;
  color: var(--danger);

  &:hover {
    background: rgba(var(--danger-rgb), 0.15);  // Mais intenso no hover
  }
}
```

### Estrutura de Rotas com AdminLayout

```typescript
// app.routes.ts
export const routes: Routes = [
  // Rotas públicas (sem layout)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login') },
      { path: 'register', loadComponent: () => import('./features/auth/register') }
    ]
  },

  // Rotas protegidas com AdminLayout
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component'),
        data: { breadcrumb: 'Dashboard', title: 'Dashboard' }
      },
      {
        path: 'todos',
        loadComponent: () => import('./features/todos/todo-list.component'),
        data: { breadcrumb: 'Tarefas', title: 'Gerenciamento de Tarefas' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
```

### Responsividade

O layout é desktop-first com breakpoints:

| Breakpoint | Comportamento |
|------------|---------------|
| `> 991.98px` | Sidebar fixo, colapsável |
| `<= 991.98px` | Sidebar como drawer, toggle no header |

```scss
// Mobile: sidebar como drawer overlay
@media (max-width: 991.98px) {
  .admin-sidebar {
    transform: translateX(-100%);
    position: fixed;
  }

  .sidebar-mobile-open .admin-sidebar {
    transform: translateX(0);
  }
}
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run watch` | Build em modo watch |
| `npm test` | Executa testes unitários |
| `npm run generate-api` | Gera clientes TypeScript a partir do OpenAPI |

## Requisitos

- Node.js 18+
- npm 9+
- Backend rodando em `http://localhost:8080`

## Estrutura de Estilos

Os estilos globais estão em `src/styles.scss` e incluem:

- **Reset e base styles** - Normalização básica
- **CSS Custom Properties** - Variáveis de tema
- **Componentes Bootstrap customizados** - Cards, forms, buttons
- **Customizações PrimeNG** - DataTable, Dropdown, etc
- **Utilitários** - Classes helper (.cursor-pointer, .rounded-lg, etc)
- **Layout classes** - .app-wrapper, .app-header, .auth-wrapper

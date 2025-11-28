# Linve - Sistema de Gestão para Delivery

Sistema de gestão multi-tenant para lanchonetes, pizzarias e estabelecimentos de delivery, desenvolvido com **Spring Boot** (backend) e **Angular** (frontend). O projeto atual implementa um CRUD de tarefas (Todo) como base arquitetural, preparado para evoluir em um sistema completo de gerenciamento de vendas delivery.

## Sobre o Projeto

**Linve** é um sistema SaaS multi-tenant focado em estabelecimentos de alimentação que trabalham com delivery. O projeto demonstra uma arquitetura profissional full-stack com autenticação JWT, multi-tenancy por organização e geração automática de clientes TypeScript.

### Objetivo Final

Fornecer uma plataforma completa para estabelecimentos de delivery que desejam:
- Gerenciar pedidos de múltiplos canais (balcão, iFood, UaiRango, WhatsApp)
- Controlar cardápio digital com variações e complementos
- Acompanhar vendas em tempo real com dashboard executivo
- Gerenciar múltiplas lojas/franquias (multi-tenant)
- Integrar com marketplaces de delivery

## Tecnologias Utilizadas

### Backend (Spring Boot)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Java | 21 | Linguagem de programação |
| Spring Boot | 3.4.7 | Framework web |
| Spring Security | 6.4.x | Autenticação e autorização |
| Spring Data JPA | 3.4.7 | Abstração para acesso a dados |
| SQLite | - | Banco de dados local (arquivo) |
| JJWT | 0.12.6 | Geração e validação de tokens JWT |
| SpringDoc OpenAPI | 2.8.9 | Documentação da API (Swagger) |
| Lombok | - | Redução de código boilerplate |
| ModelMapper | 3.2.5 | Mapeamento entre objetos |
| BCrypt | - | Hash seguro de senhas |

### Frontend (Angular)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Angular | 20 | Framework frontend |
| TypeScript | 5.9 | Linguagem de programação |
| Bootstrap | 5.3 | Framework CSS responsivo |
| PrimeNG | 20 | Componentes UI avançados |
| ngx-bootstrap | 20 | Componentes Bootstrap para Angular |
| SweetAlert2 | 11 | Modais e alertas elegantes |
| ng-openapi-gen | 1.0.5 | Geração de clientes TypeScript |
| RxJS | 7.8 | Programação reativa |

## Estrutura do Projeto

```
linve/
├── backend/                         # API REST Spring Boot
│   ├── src/main/java/br/com/exemplo/todo/
│   │   ├── api/                     # Camada de apresentação
│   │   │   ├── controller/          # Controllers REST
│   │   │   ├── dto/                 # DTOs de autenticação
│   │   │   ├── model/               # Input/Output models
│   │   │   ├── openapi/             # Interfaces OpenAPI
│   │   │   └── exceptionhandler/    # Tratamento global de erros
│   │   ├── config/                  # Configurações (JWT, Security, OpenAPI)
│   │   ├── security/                # Filtros JWT, Tenant, contexto de segurança
│   │   └── domain/                  # Entidades, repositórios, serviços
│   ├── flyway/sql/                  # Migrations do banco
│   └── pom.xml                      # Dependências Maven
│
├── frontend/                        # SPA Angular
│   ├── src/app/
│   │   ├── core/                    # Serviços singleton, guards, interceptors
│   │   │   ├── api/                 # Clientes gerados (ng-openapi-gen)
│   │   │   ├── guards/              # Guards de rota (auth, guest)
│   │   │   ├── interceptors/        # Interceptors HTTP (JWT)
│   │   │   ├── models/              # Interfaces (MenuItem, Notification)
│   │   │   └── services/            # Serviços (auth, todo, theme)
│   │   ├── layouts/                 # Layouts da aplicação
│   │   │   └── admin-layout/        # Admin Dashboard Metronic-style
│   │   │       ├── config/          # Configuração do menu
│   │   │       ├── services/        # Sidebar, Menu, Breadcrumb
│   │   │       └── components/      # Sidebar, Header, Breadcrumb
│   │   ├── features/                # Módulos de funcionalidades
│   │   │   ├── auth/                # Login e registro
│   │   │   ├── dashboard/           # Dashboard com stats cards
│   │   │   └── todos/               # CRUD de tarefas
│   │   └── environments/            # Configurações por ambiente
│   ├── ng-openapi-gen.json          # Config do gerador de clientes
│   └── package.json                 # Dependências npm
│
└── README.md                        # Este arquivo
```

## Funcionalidades Atuais

### Backend

- **Autenticação JWT completa**
  - Login com email/senha
  - Registro com criação automática de organização
  - Refresh token com rotação
  - Logout com invalidação de tokens
  - Proteção contra brute force (bloqueio de conta)

- **Multi-Tenancy**
  - Isolamento de dados por organização
  - Header `X-Organization-Id` para seleção de tenant
  - Usuários podem pertencer a múltiplas organizações

- **API REST documentada**
  - OpenAPI 3.1 com Swagger UI
  - Anotações otimizadas para geração de clientes

### Frontend

- **Standalone Components** (Angular 20)
- **Signals** para gerenciamento de estado
- **Sistema de Temas** (Light/Dark/System)
- **Geração automática de clientes** via ng-openapi-gen
- **Interceptors** para JWT e refresh automático
- **Admin Dashboard** completo estilo Metronic:
  - Sidebar colapsável com menus hierárquicos
  - Header modular (busca, notificações, org switcher, user menu)
  - Breadcrumbs automáticos
  - Dashboard com stats cards
  - Filtro de menu por roles

## Configuração do Ambiente

### Pré-requisitos

- Java 21+
- Node.js 18+
- npm 9+
- Maven 3.8+
- Git

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/psielta/linve.git
cd linve
```

### Passo 2: Executar o Backend

```bash
cd backend
mvn spring-boot:run
```

O backend estará disponível em:
- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

### Passo 3: Executar o Frontend

```bash
cd frontend
npm install
npm start
```

O frontend estará disponível em http://localhost:4200

### Passo 4: Gerar Clientes TypeScript (opcional)

Com o backend rodando:

```bash
cd frontend
npm run generate-api
```

## Testando o Sistema

### Usuário de Teste

Após o primeiro registro, você terá acesso ao sistema. Alternativamente:

1. Acesse http://localhost:4200
2. Clique em "Registrar"
3. Preencha os dados e crie uma conta
4. Faça login com as credenciais criadas

### Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/register | Registrar novo usuário |
| POST | /api/auth/login | Fazer login |
| POST | /api/auth/refresh | Renovar tokens |
| POST | /api/auth/logout | Fazer logout |
| GET | /api/todos | Listar tarefas |
| POST | /api/todos | Criar tarefa |
| GET | /api/todos/{id} | Buscar tarefa |
| PUT | /api/todos/{id} | Atualizar tarefa |
| DELETE | /api/todos/{id} | Excluir tarefa |
| PATCH | /api/todos/{id}/concluir | Marcar como concluída |
| PATCH | /api/todos/{id}/reabrir | Reabrir tarefa |

## Roadmap

### Fase 1: Base Arquitetural (Concluído)

> **Nota:** O CRUD de Tarefas (Todo) foi implementado como **ponto de partida** para validar a arquitetura completa (autenticação, multi-tenancy, geração de clientes). Este módulo será substituído pelos módulos de negócio nas próximas fases.

- [x] **Backend Spring Boot**
  - [x] Autenticação JWT com refresh token
  - [x] Multi-tenancy por organização
  - [x] CRUD de tarefas (Todo) - módulo de exemplo/validação da arquitetura
  - [x] OpenAPI otimizado para geração de clientes TypeScript
  - [x] Tratamento global de exceções (ProblemDetail RFC 7807)

- [x] **Frontend Angular**
  - [x] Standalone components
  - [x] Sistema de temas (Light/Dark/System)
  - [x] Geração automática de clientes TypeScript via ng-openapi-gen
  - [x] Guards e interceptors (auth, JWT refresh)
  - [x] Formulários reativos com validação
  - [x] CRUD de tarefas (Todo) - tela de exemplo/validação

### Fase 2: Admin Dashboard (Concluído)

- [x] **Layout Metronic-Style**
  - [x] Sidebar colapsável com menu hierárquico e animações
  - [x] Header completo (busca, notificações, ações rápidas, org switcher, user menu)
  - [x] Breadcrumbs automáticos baseados nas rotas
  - [x] Cards de estatísticas no dashboard com variações de cor
  - [x] Sistema de temas light/dark integrado
  - [x] Responsividade desktop-first com drawer mobile

- [x] **Menu e Navegação**
  - [x] Configuração de menu via TypeScript com tipagem
  - [x] Suporte a submenus hierárquicos infinitos
  - [x] Filtro automático por role (OWNER, ADMIN, MEMBER)
  - [x] Badges dinâmicos nos itens de menu
  - [x] Persistência de estado no localStorage

- [x] **Sistema de Temas Harmonizado**
  - [x] Paleta de cores Slate consistente (Tailwind-inspired)
  - [x] Páginas de autenticação com visual moderno
  - [x] Variáveis CSS organizadas para fácil customização
  - [x] Transições suaves entre temas

- [ ] **Gestão de Usuários** (próxima fase)
  - [ ] CRUD de usuários por organização
  - [ ] Definição de roles (Owner, Admin, Member)
  - [ ] Convites por email

- [ ] **Gestão de Organizações** (próxima fase)
  - [ ] Configurações da organização
  - [ ] Logo e branding customizado
  - [ ] Planos e assinaturas

### Fase 3: Sistema de Delivery

- [ ] **Cardápio Digital**
  - [ ] Categorias de produtos (Lanches, Pizzas, Bebidas)
  - [ ] Produtos com variações (Tamanho, Sabor)
  - [ ] Complementos e adicionais
  - [ ] Preços por variação
  - [ ] Fotos dos produtos

- [ ] **Gestão de Pedidos**
  - [ ] Recebimento de pedidos multi-canal
  - [ ] Status do pedido (Recebido, Em preparo, Saiu para entrega, Entregue)
  - [ ] Impressão de comanda
  - [ ] Histórico de pedidos por cliente

- [ ] **Clientes**
  - [ ] Cadastro de clientes
  - [ ] Endereços de entrega
  - [ ] Histórico de compras
  - [ ] Programa de fidelidade

### Fase 4: Integrações

- [ ] **iFood**
  - [ ] Recebimento automático de pedidos
  - [ ] Sincronização de cardápio
  - [ ] Atualização de status

- [ ] **UaiRango**
  - [ ] Integração via API
  - [ ] Importação de pedidos
  - [ ] Catálogo sincronizado

- [ ] **WhatsApp Business**
  - [ ] Bot de atendimento
  - [ ] Envio de cardápio
  - [ ] Notificações de status

### Fase 5: Relatórios e Analytics

- [ ] **Dashboard Executivo**
  - [ ] Vendas do dia/semana/mês
  - [ ] Ticket médio
  - [ ] Produtos mais vendidos
  - [ ] Horários de pico

- [ ] **Relatórios**
  - [ ] Vendas por período
  - [ ] Vendas por canal (iFood, balcão, WhatsApp)
  - [ ] Relatório de produtos
  - [ ] Exportação PDF/Excel

### Futuro

- [ ] App mobile (Ionic/React Native)
- [ ] Sistema de cozinha (KDS - Kitchen Display System)
- [ ] Controle de estoque
- [ ] Gestão financeira (contas a pagar/receber)
- [ ] Emissão de NFC-e
- [ ] API pública para integrações

## Características Técnicas

### Backend

- **Arquitetura em camadas**: Controller → Service → Repository
- **DTOs tipados**: Input para entrada, Output para saída
- **Validação**: Bean Validation com mensagens customizadas
- **Segurança**: Spring Security 6 com filtros customizados
- **OpenAPI**: Anotações otimizadas para geração de clientes

### Frontend

- **Standalone Components**: Sem NgModules
- **Signals**: Estado reativo sem RxJS onde possível
- **Functional Guards**: Abordagem moderna do Angular
- **Control Flow**: Novo syntax `@if`, `@for`, `@switch`
- **Type Safety**: Tipos gerados automaticamente do OpenAPI

### Multi-Tenancy

- Isolamento por `organization_id` em todas as entidades
- `TenantContext` com ThreadLocal para contexto do tenant
- `TenantFilter` resolve organização do header ou default do usuário
- `@PreAuthorize` com expressões SpEL customizadas

## Contribuindo

Projeto de portfolio pessoal, mas feedbacks são bem-vindos! Abra uma issue ou envie um PR.

## Licença

Projeto sob licença MIT.

## Autor

Mateus Salgueiro
- GitHub: [@psielta](https://github.com/psielta)
- LinkedIn: [Mateus Salgueiro](https://www.linkedin.com/in/mateus-salgueiro-525717205/)

---

Desenvolvido como parte do meu portfolio de desenvolvimento full-stack Java + Angular.

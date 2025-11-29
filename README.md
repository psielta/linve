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

### Frontend (Angular + Sakai PrimeNG Template)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Angular | 20 | Framework frontend |
| TypeScript | 5.8 | Linguagem de programação |
| PrimeNG | 19 | Componentes UI avançados |
| PrimeFlex | 4 | Utility-first CSS |
| Sakai Template | - | Template admin PrimeNG oficial |
| Tailwind CSS | 4 | Framework CSS utility-first |
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
├── frontend-v2/                     # SPA Angular (Sakai PrimeNG Template)
│   ├── src/app/
│   │   ├── core/                    # Serviços singleton, guards, interceptors
│   │   │   ├── guards/              # Guards de rota (auth, guest, admin)
│   │   │   ├── interceptors/        # Interceptors HTTP (JWT, tenant)
│   │   │   ├── models/              # Interfaces TypeScript
│   │   │   └── services/            # Serviços (auth, tenant, organization)
│   │   ├── layout/                  # Layout Sakai (sidebar, topbar, footer)
│   │   │   ├── component/           # AppTopbar, AppSidebar, AppMenu
│   │   │   └── service/             # LayoutService (tema, sidebar state)
│   │   ├── pages/                   # Páginas principais
│   │   │   ├── auth/                # Login e registro
│   │   │   ├── account/             # Página "Minha Conta"
│   │   │   └── notfound/            # Página 404
│   │   ├── features/                # Módulos de funcionalidades
│   │   │   ├── dashboard/           # Dashboard com stats cards
│   │   │   └── todos/               # CRUD de tarefas
│   │   └── environments/            # Configurações por ambiente
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

- **Sakai PrimeNG Template** - Template admin oficial da PrimeTek
- **Standalone Components** (Angular 20)
- **Signals** para gerenciamento de estado reativo
- **Sistema de Temas** (Light/Dark com color presets)
- **Interceptors** para JWT e refresh automático
- **Multi-Tenancy** no frontend:
  - Seletor de organização no header
  - Troca de contexto reativa (signals/effects)
  - Dados recarregados automaticamente ao trocar org
- **Admin Dashboard** baseado no Sakai:
  - Sidebar colapsável com menus hierárquicos
  - Header com theme toggle, color picker e user menu
  - Página "Minha Conta" com gestão de organizações
  - Dashboard com stats cards
  - CRUD completo com tabelas PrimeNG

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
cd frontend-v2
npm install
npm start
```

O frontend estará disponível em http://localhost:4200

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
| GET | /api/admin/users | Listar usuários da organização |
| POST | /api/admin/users | Criar novo usuário |
| GET | /api/admin/users/{id} | Buscar usuário por ID |
| PUT | /api/admin/users/{id} | Atualizar usuário |
| PATCH | /api/admin/users/{id}/ativar | Ativar usuário |
| PATCH | /api/admin/users/{id}/desativar | Desativar usuário |
| PATCH | /api/admin/users/{id}/role | Alterar papel do usuário |
| POST | /api/admin/users/{id}/reset-password | Resetar senha |
| POST | /api/admin/users/{id}/unlock | Desbloquear conta |
| GET | /api/admin/users/{id}/login-history | Histórico de login |

## Roadmap

### Fase 1: Base Arquitetural (Concluído)

> **Nota:** O CRUD de Tarefas (Todo) foi implementado como **ponto de partida** para validar a arquitetura completa (autenticação, multi-tenancy, geração de clientes). Este módulo será substituído pelos módulos de negócio nas próximas fases.

- [x] **Backend Spring Boot**
  - [x] Autenticação JWT com refresh token
  - [x] Multi-tenancy por organização
  - [x] CRUD de tarefas (Todo) - módulo de exemplo/validação da arquitetura
  - [x] OpenAPI otimizado para geração de clientes TypeScript
  - [x] Tratamento global de exceções (ProblemDetail RFC 7807)

- [x] **Frontend Angular** (Sakai PrimeNG Template)
  - [x] Standalone components com Angular 20
  - [x] Guards e interceptors (auth, JWT refresh, tenant)
  - [x] Tela de Login / Registro
  - [x] Variação de organização (Header X-Organization-Id + seletor)
  - [x] Página "Minha Conta" com gestão de organizações
  - [x] CRUD de tarefas (Todo) - tela de exemplo/validação
  - [x] Sistema de temas (Light/Dark/Color presets)

### Fase 2: Admin Dashboard

- [ ] **Gestão de Usuários** (Concluído)
  - [ ] CRUD de usuários por organização
  - [ ] Definição de roles (Owner, Admin, Member)
  - [ ] Reset de senha com senha temporária
  - [ ] Histórico de tentativas de login
  - [ ] Bloqueio/desbloqueio de contas
  - [ ] Filtros avançados (status, role, busca)
  - [ ] Soft delete (ativar/desativar)

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

- **Sakai Template**: Template admin oficial da PrimeTek para Angular
- **Standalone Components**: Sem NgModules, imports declarativos
- **Signals + Effects**: Estado reativo com Angular Signals
- **Functional Guards**: Abordagem moderna do Angular
- **Control Flow**: Novo syntax `@if`, `@for`, `@switch`
- **Layout Responsivo**: Sidebar colapsável, adaptável para mobile
- **Temas Dinâmicos**: Light/Dark mode com color presets persistidos

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

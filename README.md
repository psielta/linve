# Todo API - Spring Boot + SQLite + JWT + Multi-Tenancy

API REST de CRUD de tarefas (Todo) com **autenticação JWT** e **multi-tenancy por organização**, desenvolvida como exemplo para aprendizado de Spring Boot com SQLite.

Este projeto segue a **mesma arquitetura** do projeto `Reforma\codigo-fonte-backend`, usando as mesmas versões e padrões.

---

## Sumário

1. [Tecnologias](#tecnologias)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Autenticação JWT](#autenticação-jwt)
4. [Multi-Tenancy](#multi-tenancy)
5. [Entendendo as Camadas](#entendendo-as-camadas)
6. [Fluxo de uma Requisição](#fluxo-de-uma-requisição)
7. [Conceitos Importantes](#conceitos-importantes)
8. [Como Executar](#como-executar)
9. [Endpoints da API](#endpoints-da-api)
10. [Exemplos de Requisições](#exemplos-de-requisições)
11. [Banco de Dados](#banco-de-dados)
12. [Testes](#testes)
13. [Comparação com o Projeto Base](#comparação-com-o-projeto-base)

---

## Tecnologias

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Java | 21 | Linguagem de programação |
| Spring Boot | 3.4.7 | Framework web |
| Spring Security | 6.4.x | Autenticação e autorização |
| Spring Data JPA | 3.4.7 | Abstração para acesso a dados |
| SQLite | - | Banco de dados local (arquivo) |
| Hibernate Community Dialects | 3.4.7 | Suporte SQLite no Hibernate |
| JJWT | 0.12.6 | Geração e validação de tokens JWT |
| SpringDoc OpenAPI | 2.8.9 | Documentação da API (Swagger) |
| Lombok | - | Redução de código boilerplate |
| ModelMapper | 3.2.5 | Mapeamento entre objetos |
| BCrypt | - | Hash seguro de senhas |
| JUnit 5 | - | Framework de testes |
| AssertJ | - | Assertions fluentes |
| Mockito | - | Mocks para testes |

---

## Arquitetura do Projeto

```
todo-api/
├── pom.xml                                    # Configuração Maven (dependências)
├── flyway/sql/
│   ├── V0001__criar_tabela_todo.sql           # Migration inicial (tabela TODO)
│   ├── V0002__criar_tabelas_autenticacao.sql  # Tabelas de auth (USUARIO, ORGANIZATION, etc)
│   └── V0003__adicionar_organizacao_todo.sql  # Adiciona org_id à tabela TODO
├── todo/db/                                   # Banco SQLite (criado automaticamente)
└── src/
    ├── main/
    │   ├── java/br/com/exemplo/todo/
    │   │   ├── TodoApplication.java           # Classe main (@SpringBootApplication)
    │   │   │
    │   │   ├── api/                           # CAMADA DE APRESENTAÇÃO (REST)
    │   │   │   ├── controller/
    │   │   │   │   ├── AuthController.java    # Endpoints de autenticação
    │   │   │   │   └── TodoController.java    # Endpoints de tarefas
    │   │   │   ├── dto/auth/                  # DTOs de autenticação
    │   │   │   │   ├── LoginInput.java
    │   │   │   │   ├── RegisterInput.java
    │   │   │   │   ├── RefreshTokenInput.java
    │   │   │   │   ├── AuthResponse.java
    │   │   │   │   ├── UserOutput.java
    │   │   │   │   ├── OrganizationOutput.java
    │   │   │   │   └── MembershipOutput.java
    │   │   │   ├── exceptionhandler/
    │   │   │   │   ├── ApiExceptionHandler.java  # Tratamento global de erros
    │   │   │   │   └── ProblemType.java          # Tipos de erro (enum)
    │   │   │   ├── model/
    │   │   │   │   ├── input/TodoInput.java
    │   │   │   │   └── output/TodoOutput.java
    │   │   │   └── openapi/
    │   │   │       └── TodoControllerOpenApi.java
    │   │   │
    │   │   ├── config/                        # CONFIGURAÇÕES
    │   │   │   ├── JwtConfig.java             # Propriedades JWT
    │   │   │   ├── ModelMapperConfig.java
    │   │   │   ├── OpenApiSecurityConfig.java # Swagger com auth
    │   │   │   └── SecurityConfig.java        # Spring Security 6
    │   │   │
    │   │   ├── security/                      # INFRAESTRUTURA DE SEGURANÇA
    │   │   │   ├── AuthenticatedUser.java     # Principal do usuário autenticado
    │   │   │   ├── JwtAuthenticationFilter.java  # Filtro que valida JWT
    │   │   │   ├── JwtService.java            # Geração/validação de tokens
    │   │   │   ├── TenantContext.java         # ThreadLocal com contexto do tenant
    │   │   │   ├── TenantFilter.java          # Filtro que resolve organização
    │   │   │   ├── TenantInfo.java            # Record com dados do tenant
    │   │   │   └── TenantSecurityExpressions.java  # SpEL para @PreAuthorize
    │   │   │
    │   │   └── domain/                        # CAMADA DE DOMÍNIO
    │   │       ├── model/
    │   │       │   ├── entity/
    │   │       │   │   ├── Account.java       # Credenciais do usuário
    │   │       │   │   ├── Membership.java    # Vínculo usuário-organização
    │   │       │   │   ├── Organization.java  # Organização (tenant)
    │   │       │   │   ├── RefreshToken.java  # Token de refresh
    │   │       │   │   ├── Todo.java          # Tarefa (com org_id)
    │   │       │   │   └── User.java          # Usuário
    │   │       │   └── enums/
    │   │       │       └── MembershipRole.java  # OWNER, ADMIN, MEMBER
    │   │       ├── repository/
    │   │       │   ├── AccountRepository.java
    │   │       │   ├── MembershipRepository.java
    │   │       │   ├── OrganizationRepository.java
    │   │       │   ├── RefreshTokenRepository.java
    │   │       │   ├── TodoRepository.java
    │   │       │   └── UserRepository.java
    │   │       ├── service/
    │   │       │   ├── AuthService.java       # Lógica de autenticação
    │   │       │   └── TodoService.java       # Lógica de tarefas (com tenant)
    │   │       └── exception/
    │   │           ├── AccountLockedException.java
    │   │           ├── AuthenticationException.java
    │   │           ├── EmailAlreadyExistsException.java
    │   │           ├── InvalidCredentialsException.java
    │   │           ├── InvalidRefreshTokenException.java
    │   │           ├── OrganizationAccessDeniedException.java
    │   │           └── TodoNaoEncontradoException.java
    │   │
    │   └── resources/
    │       ├── application.yml                # Configuração principal + JWT
    │       └── application-testes.yml
    │
    └── test/java/br/com/exemplo/todo/
        ├── testesunitarios/
        │   └── TodoServiceTest.java
        └── testesintegracao/
            └── TodoControllerIntegracaoTest.java
```

---

## Autenticação JWT

### Visão Geral

O sistema usa **JWT (JSON Web Token)** para autenticação stateless:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUXO DE AUTENTICAÇÃO                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LOGIN                                                                   │
│     POST /auth/login { email, senha }                                       │
│          │                                                                  │
│          ▼                                                                  │
│     ┌─────────────────────────────────────────────────────────┐            │
│     │ AuthService                                              │            │
│     │  - Valida credenciais                                    │            │
│     │  - Gera Access Token (15 min)                            │            │
│     │  - Gera Refresh Token (30 dias)                          │            │
│     │  - Persiste hash do refresh token                        │            │
│     └─────────────────────────────────────────────────────────┘            │
│          │                                                                  │
│          ▼                                                                  │
│     { accessToken, refreshToken, user, organizations }                      │
│                                                                             │
│  2. REQUISIÇÕES AUTENTICADAS                                                │
│     GET /todos                                                              │
│     Headers:                                                                │
│       - Authorization: Bearer {accessToken}                                 │
│       - X-Organization-Id: 1                                                │
│          │                                                                  │
│          ▼                                                                  │
│     ┌─────────────────────────────────────────────────────────┐            │
│     │ JwtAuthenticationFilter                                  │            │
│     │  - Extrai token do header                                │            │
│     │  - Valida assinatura e expiração                         │            │
│     │  - Popula SecurityContext com AuthenticatedUser          │            │
│     └─────────────────────────────────────────────────────────┘            │
│          │                                                                  │
│          ▼                                                                  │
│     ┌─────────────────────────────────────────────────────────┐            │
│     │ TenantFilter                                             │            │
│     │  - Lê X-Organization-Id do header                        │            │
│     │  - Valida membership do usuário na org                   │            │
│     │  - Popula TenantContext (ThreadLocal)                    │            │
│     └─────────────────────────────────────────────────────────┘            │
│          │                                                                  │
│          ▼                                                                  │
│     Controller → Service → Repository (com isolamento por org)              │
│                                                                             │
│  3. REFRESH TOKEN                                                           │
│     POST /auth/refresh { refreshToken }                                     │
│          │                                                                  │
│          ▼                                                                  │
│     ┌─────────────────────────────────────────────────────────┐            │
│     │ AuthService                                              │            │
│     │  - Valida refresh token (hash no banco)                  │            │
│     │  - Revoga token antigo (rotação)                         │            │
│     │  - Gera novos tokens                                     │            │
│     │  - Detecta roubo (token já revogado = revoga família)    │            │
│     └─────────────────────────────────────────────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estrutura do JWT

**Access Token (Header.Payload.Signature):**
```json
{
  "sub": "1",              // User ID
  "iss": "todo-api",       // Issuer
  "iat": 1700000000,       // Issued At
  "exp": 1700000900,       // Expiration (15 min)
  "email": "user@email.com",
  "nome": "João Silva"
}
```

### Configuração (application.yml)

```yaml
security:
  jwt:
    secret: ${JWT_SECRET:chave-secreta-minimo-32-caracteres}
    access-token:
      expiration-ms: 900000      # 15 minutos
    refresh-token:
      expiration-days: 30        # 30 dias
  bcrypt:
    strength: 12                 # Força do hash BCrypt
```

### Endpoints de Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | /auth/register | Registrar novo usuário | Pública |
| POST | /auth/login | Login com email/senha | Pública |
| POST | /auth/refresh | Renovar tokens | Pública |
| POST | /auth/logout | Revogar refresh token | Pública |

### Segurança do Refresh Token

1. **Armazenamento seguro**: Apenas o hash SHA-256 é persistido
2. **Rotação automática**: Cada uso gera um novo token
3. **Detecção de roubo**: Token já usado = revoga toda família
4. **Family tracking**: Tokens relacionados compartilham `familiaId`
5. **Metadados**: IP e User-Agent são registrados

### Classes Importantes

```java
// JwtService.java - Geração e validação de tokens
public String generateAccessToken(User user) {
    return Jwts.builder()
        .subject(String.valueOf(user.getId()))
        .claim("email", user.getEmail())
        .claim("nome", user.getNome())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expirationMs))
        .signWith(secretKey)
        .compact();
}

// JwtAuthenticationFilter.java - Filtro de validação
@Override
protected void doFilterInternal(HttpServletRequest request, ...) {
    String token = extractToken(request);
    if (token != null) {
        Claims claims = jwtService.validateAccessToken(token);
        AuthenticatedUser principal = new AuthenticatedUser(
            claims.get("sub", Long.class),
            claims.get("email", String.class),
            claims.get("nome", String.class)
        );
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, List.of())
        );
    }
    filterChain.doFilter(request, response);
}
```

---

## Multi-Tenancy

### Conceito

Multi-tenancy permite que múltiplas organizações usem a mesma aplicação com dados isolados.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MODELO DE MULTI-TENANCY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                      ┌─────────────┐                       │
│  │   User A    │                      │   User B    │                       │
│  │  (João)     │                      │  (Maria)    │                       │
│  └──────┬──────┘                      └──────┬──────┘                       │
│         │                                    │                              │
│         │  Membership                        │  Membership                  │
│         │  (OWNER)                           │  (MEMBER)                    │
│         │                                    │                              │
│         ▼                                    ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    Organization 1                            │           │
│  │                    "Empresa ABC"                             │           │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │           │
│  │  │  Todo 1  │  │  Todo 2  │  │  Todo 3  │  (org_id = 1)     │           │
│  │  └──────────┘  └──────────┘  └──────────┘                   │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│         │  Membership                                                       │
│         │  (ADMIN)                                                          │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    Organization 2                            │           │
│  │                    "Startup XYZ"                             │           │
│  │  ┌──────────┐  ┌──────────┐  (org_id = 2)                   │           │
│  │  │  Todo 4  │  │  Todo 5  │  ← João também acessa aqui      │           │
│  │  └──────────┘  └──────────┘                                 │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Entidades do Multi-Tenancy

| Entidade | Descrição |
|----------|-----------|
| **User** | Usuário do sistema (pode pertencer a várias orgs) |
| **Organization** | Organização/tenant (agrupa tarefas) |
| **Membership** | Vínculo usuário ↔ organização com papel |
| **Account** | Credenciais (email/senha, OAuth, etc) |
| **RefreshToken** | Tokens de refresh persistidos |

### Papéis (MembershipRole)

```java
public enum MembershipRole {
    OWNER,   // Dono da organização (pode tudo)
    ADMIN,   // Administrador (gerencia membros)
    MEMBER   // Membro comum (apenas CRUD de tarefas)
}
```

### TenantContext (ThreadLocal)

O `TenantContext` armazena informações da organização ativa para cada requisição:

```java
// Definir contexto (feito pelo TenantFilter)
TenantContext.set(organizationId, userId, role);

// Usar no Service
Long orgId = TenantContext.getOrganizationId();
Long userId = TenantContext.getUserId();
MembershipRole role = TenantContext.getRole();

// Verificações de permissão
TenantContext.isOwner();  // É dono?
TenantContext.isAdmin();  // É admin ou dono?

// IMPORTANTE: Limpar ao final (feito automaticamente pelo TenantFilter)
TenantContext.clear();
```

### Header X-Organization-Id

O cliente deve enviar o header `X-Organization-Id` para especificar qual organização acessar:

```bash
curl -H "Authorization: Bearer {token}" \
     -H "X-Organization-Id: 1" \
     http://localhost:8080/api/todos
```

**Comportamento:**
- Se não enviar: usa a primeira organização do usuário
- Se enviar ID inválido: retorna 400 Bad Request
- Se não tiver membership: retorna 403 Forbidden

### Isolamento de Dados

Os repositórios filtram por `organizationId`:

```java
// TodoRepository.java
List<Todo> findByOrganizationIdOrderByDataCriacaoDesc(Long organizationId);
Optional<Todo> findByIdAndOrganizationId(Long id, Long organizationId);

// TodoService.java
public List<Todo> listarTodos() {
    Long orgId = TenantContext.getOrganizationId();
    return repository.findByOrganizationIdOrderByDataCriacaoDesc(orgId);
}
```

### @PreAuthorize para Controle de Acesso

```java
// Verificar membership no controller
@RestController
@PreAuthorize("@tenantSecurity.isMember()")
public class TodoController { ... }

// Verificar papel específico
@PreAuthorize("@tenantSecurity.isAdmin()")
public void deletarMembro(Long membroId) { ... }

// Verificar se é o próprio usuário
@PreAuthorize("@tenantSecurity.isCurrentUser(#userId)")
public void alterarPerfil(Long userId) { ... }
```

---

## Entendendo as Camadas

### 1. Camada API (Apresentação)

Responsável por receber requisições HTTP e retornar respostas.

#### Controller (`TodoController.java`)
```java
@RestController          // Define que é um controller REST
@RequestMapping("todos") // Base path: /api/todos
public class TodoController {

    @GetMapping          // GET /api/todos
    public List<TodoOutput> listar() { ... }

    @PostMapping         // POST /api/todos
    @ResponseStatus(HttpStatus.CREATED)  // Retorna 201
    public TodoOutput criar(@RequestBody @Valid TodoInput input) { ... }
}
```

**Anotações importantes:**
- `@RestController` = `@Controller` + `@ResponseBody` (retorna JSON automaticamente)
- `@RequestMapping` = Define o path base do controller
- `@GetMapping`, `@PostMapping`, etc = Mapeia métodos HTTP
- `@PathVariable` = Captura variável da URL (`/todos/{id}`)
- `@RequestParam` = Captura query parameter (`?concluido=true`)
- `@RequestBody` = Converte JSON do body para objeto Java
- `@Valid` = Ativa validação do Bean Validation

#### DTOs (Data Transfer Objects)
Objetos para transferir dados entre camadas. Separam a API da entidade do banco.

**Input DTO** - O que a API recebe:
```java
public class TodoInput {
    @NotBlank(message = "Título é obrigatório")  // Validação
    @Size(min = 1, max = 200)
    private String titulo;

    private String descricao;
}
```

**Output DTO** - O que a API retorna:
```java
public class TodoOutput {
    private Long id;
    private String titulo;
    private String descricao;
    private Boolean concluido;
    private LocalDateTime dataCriacao;
}
```

**Por que usar DTOs?**
- Controla exatamente o que entra/sai da API
- Entidade pode ter campos que não devem ser expostos
- Validações ficam no Input, não na Entity
- Permite evoluir API e banco independentemente

#### Exception Handler (`ApiExceptionHandler.java`)
Captura exceções e converte para respostas HTTP padronizadas.

```java
@RestControllerAdvice  // Intercepta exceções de TODOS os controllers automaticamente
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(TodoNaoEncontradoException.class)  // Captura esta exceção específica
    public ResponseEntity<Object> handleTodoNaoEncontrado(...) {
        // Retorna HTTP 404 com ProblemDetail (RFC 7807)
    }
}
```

**Como funciona a conexão Controller ↔ Exception Handler:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  O SPRING FAZ TUDO AUTOMATICAMENTE - NÃO PRECISA "LIGAR" NADA!              │
│                                                                             │
│  1. @RestControllerAdvice é um interceptador GLOBAL                         │
│     → Spring detecta automaticamente na inicialização                       │
│     → Aplica-se a TODOS os @RestController da aplicação                     │
│                                                                             │
│  2. @ExceptionHandler define QUAL exceção esse método trata                 │
│     → Quando qualquer Controller lançar essa exceção                        │
│     → O Spring redireciona automaticamente para este método                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Fluxo de uma exceção:**

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│  TodoController  │     │   TodoService    │     │   ApiExceptionHandler    │
│                  │     │                  │     │                          │
│  GET /todos/999  │────▶│  buscarPorId(999)│     │                          │
│                  │     │        │         │     │                          │
│                  │     │        ▼         │     │                          │
│                  │     │  repository      │     │                          │
│                  │     │  .findById(999)  │     │                          │
│                  │     │        │         │     │                          │
│                  │     │        ▼         │     │                          │
│                  │     │  Optional.empty()│     │                          │
│                  │     │        │         │     │                          │
│                  │     │        ▼         │     │                          │
│                  │◀─ ─ │  throw new       │     │                          │
│                  │  ─ ─│  TodoNaoEncon-   │─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ┐         │
│                  │     │  tradoException()│     │                ▼         │
│                  │     │                  │     │  @ExceptionHandler(      │
│                  │     │                  │     │    TodoNaoEncontrado-    │
│                  │     │                  │     │    Exception.class)      │
│                  │     │                  │     │         │                │
│                  │     │                  │     │         ▼                │
│                  │     │                  │     │  Cria ProblemDetail      │
│                  │     │                  │     │  com status 404          │
│                  │     │                  │     │         │                │
└──────────────────┘     └──────────────────┘     └─────────│────────────────┘
                                                            ▼
                                               ┌──────────────────────────┐
                                               │     HTTP Response        │
                                               │     Status: 404          │
                                               │     Body: ProblemDetail  │
                                               └──────────────────────────┘
```

**Exemplo prático - Controller NÃO trata exceção, apenas lança:**

```java
// TodoController.java - NÃO precisa try/catch!
@GetMapping("/{id}")
public TodoOutput buscar(@PathVariable Long id) {
    // Se não encontrar, o Service lança TodoNaoEncontradoException
    // O Spring intercepta e redireciona para o ApiExceptionHandler
    Todo todo = todoService.buscarPorId(id);  // Pode lançar exceção!
    return toOutput(todo);
}

// TodoService.java - Lança a exceção
public Todo buscarPorId(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new TodoNaoEncontradoException(id));  // LANÇA!
}

// ApiExceptionHandler.java - CAPTURA automaticamente
@ExceptionHandler(TodoNaoEncontradoException.class)  // Escuta esta exceção
public ResponseEntity<Object> handleTodoNaoEncontradoException(
        TodoNaoEncontradoException ex, WebRequest request) {

    HttpStatus status = HttpStatus.NOT_FOUND;  // Define o status HTTP
    ProblemDetail problemDetail = createProblem(ex, status);

    return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
}
```

**Hierarquia de captura de exceções:**

```java
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    // 1. ESPECÍFICA: Captura apenas TodoNaoEncontradoException
    @ExceptionHandler(TodoNaoEncontradoException.class)
    public ResponseEntity<Object> handleTodoNaoEncontrado(...) {
        return ... // 404 Not Found
    }

    // 2. ESPECÍFICA: Captura apenas CategoriaNaoEncontradaException
    @ExceptionHandler(CategoriaNaoEncontradaException.class)
    public ResponseEntity<Object> handleCategoriaNaoEncontrada(...) {
        return ... // 404 Not Found
    }

    // 3. GENÉRICA: Captura qualquer Exception não tratada acima
    //    (funciona como "catch all" - fallback de segurança)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(...) {
        return ... // 500 Internal Server Error
    }
}
```

**Ordem de prioridade:** O Spring escolhe o handler mais específico.
Se lançar `TodoNaoEncontradoException`, vai para o handler específico (404).
Se lançar `NullPointerException`, vai para o handler genérico (500).

**Anotações importantes:**

| Anotação | O que faz |
|----------|-----------|
| `@RestControllerAdvice` | Marca a classe como interceptador global de exceções para todos os `@RestController` |
| `@ExceptionHandler(Tipo.class)` | Define qual tipo de exceção este método trata |
| `ResponseEntityExceptionHandler` | Classe base do Spring que já trata exceções comuns (validação, parsing, etc.) |

**Por que estender `ResponseEntityExceptionHandler`?**

Essa classe base já trata automaticamente várias exceções do Spring:
- `MethodArgumentNotValidException` → Erros de validação (`@Valid`)
- `HttpMessageNotReadableException` → JSON malformado
- `HttpRequestMethodNotSupportedException` → Método HTTP errado (POST em endpoint GET)
- `MissingServletRequestParameterException` → Parâmetro obrigatório ausente
- E muitas outras...

Você pode sobrescrever esses métodos para customizar a resposta.

**Padrão ProblemDetail (RFC 7807):**
```json
{
    "type": "/api/errors/todo-nao-encontrado",
    "title": "Tarefa não encontrada",
    "status": 404,
    "detail": "Tarefa com ID 999 não encontrada",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Camada Domain (Negócio)

Contém a lógica de negócio, independente de frameworks.

#### Entity (`Todo.java`)
Representa uma tabela no banco de dados.

```java
@Entity                      // Marca como entidade JPA
@Table(name = "TODO")        // Nome da tabela
public class Todo {

    @Id                      // Chave primária
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    @Column(name = "TODO_ID")
    private Long id;

    @NotNull                 // Validação JPA
    @Column(name = "TODO_TITULO", nullable = false)
    private String titulo;

    @Column(name = "TODO_DESCRICAO")
    private String descricao;
}
```

**Anotações Lombok usadas:**
- `@Data` = Gera getters, setters, equals, hashCode, toString
- `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` = Usa apenas campos marcados

#### Repository (`TodoRepository.java`)
Interface para acesso ao banco. Spring Data JPA implementa automaticamente.

```java
@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // Spring Data JPA cria a query automaticamente pelo nome do método!
    List<Todo> findByConcluidoOrderByDataCriacaoDesc(Boolean concluido);

    // Equivalente a:
    // SELECT * FROM TODO WHERE TODO_CONCLUIDO = ? ORDER BY TODO_DATA_CRIACAO DESC
}
```

**Métodos herdados de JpaRepository:**
- `save(entity)` - Salva ou atualiza
- `findById(id)` - Busca por ID (retorna Optional)
- `findAll()` - Busca todos
- `delete(entity)` - Exclui
- `deleteById(id)` - Exclui por ID

#### Service (`TodoService.java`)
Contém a lógica de negócio. Orquestra operações.

```java
@Service                     // Marca como bean de serviço
@RequiredArgsConstructor     // Lombok: cria construtor com campos final
public class TodoService {

    private final TodoRepository repository;  // Injeção de dependência
    private final ModelMapper modelMapper;

    @Transactional           // Operação em transação (commit/rollback automático)
    public Todo criar(TodoInput input) {
        Todo todo = modelMapper.map(input, Todo.class);  // Converte DTO → Entity
        todo.setDataCriacao(LocalDateTime.now());
        todo.setConcluido(false);
        return repository.save(todo);  // Persiste no banco
    }

    public Todo buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new TodoNaoEncontradoException(id));  // Lança exceção se não encontrar
    }
}
```

---

### 3. Camada Config

Configurações do Spring (beans, interceptors, etc).

```java
@Configuration  // Marca como classe de configuração
public class ModelMapperConfig {

    @Bean  // Registra como bean do Spring (disponível para injeção)
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
```

---

## Fluxo de uma Requisição

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           POST /api/todos                                   │
│                    {"titulo": "Comprar pão", "descricao": "..."}            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. CONTROLLER (TodoController)                                             │
│     - Recebe a requisição HTTP                                              │
│     - @Valid valida o TodoInput (Bean Validation)                           │
│     - Se inválido → ApiExceptionHandler retorna 400                         │
│     - Se válido → chama todoService.criar(input)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. SERVICE (TodoService)                                                   │
│     - Aplica lógica de negócio                                              │
│     - Converte TodoInput → Todo (ModelMapper)                               │
│     - Define dataCriacao = agora                                            │
│     - Define concluido = false                                              │
│     - Chama repository.save(todo)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. REPOSITORY (TodoRepository)                                             │
│     - Spring Data JPA gera o SQL automaticamente                            │
│     - INSERT INTO TODO (TODO_TITULO, ...) VALUES (?, ...)                   │
│     - Retorna entidade com ID preenchido                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. CONTROLLER (volta)                                                      │
│     - Recebe Todo do Service                                                │
│     - Converte Todo → TodoOutput (ModelMapper)                              │
│     - Retorna ResponseEntity com status 201 (CREATED)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HTTP 201 Created                                    │
│  {"id": 1, "titulo": "Comprar pão", "concluido": false, ...}               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Conceitos Importantes

### Injeção de Dependência

O Spring cria e gerencia os objetos (beans). Você declara as dependências e o Spring injeta.

```java
@Service
@RequiredArgsConstructor  // Lombok gera: public TodoService(TodoRepository r, ModelMapper m)
public class TodoService {
    private final TodoRepository repository;  // Spring injeta automaticamente
    private final ModelMapper modelMapper;
}
```

**Equivalente sem Lombok:**
```java
@Service
public class TodoService {
    private final TodoRepository repository;

    @Autowired  // Ou pode ser no construtor (recomendado)
    public TodoService(TodoRepository repository) {
        this.repository = repository;
    }
}
```

### Bean Validation (Jakarta Validation)

Validações declarativas via anotações.

```java
public class TodoInput {
    @NotBlank(message = "Título é obrigatório")
    @Size(min = 1, max = 200, message = "Título deve ter entre 1 e 200 caracteres")
    private String titulo;
}
```

**Anotações comuns:**
| Anotação | Descrição |
|----------|-----------|
| `@NotNull` | Não pode ser null |
| `@NotBlank` | Não pode ser null, vazio ou só espaços |
| `@NotEmpty` | Não pode ser null ou vazio |
| `@Size(min, max)` | Tamanho da string ou coleção |
| `@Min`, `@Max` | Valor mínimo/máximo para números |
| `@Email` | Formato de email válido |
| `@Pattern(regexp)` | Deve casar com regex |

### Transações (@Transactional)

Garante que operações no banco sejam atômicas.

```java
@Transactional  // Se der erro, faz rollback de tudo
public Todo criar(TodoInput input) {
    // Operação 1: salva todo
    // Operação 2: salva log (exemplo)
    // Se operação 2 falhar, operação 1 também é desfeita
}
```

### Optional

Evita NullPointerException. Força tratamento de ausência de valor.

```java
// Ruim (pode dar NullPointerException):
Todo todo = repository.findById(id);  // Pode ser null!
todo.getTitulo();  // BOOM!

// Bom (com Optional):
Optional<Todo> optional = repository.findById(id);
Todo todo = optional.orElseThrow(() -> new TodoNaoEncontradoException(id));
```

---

## Como Executar

### Pré-requisitos
- Java 21+
- Maven 3.9+

### IDEs Recomendadas

| IDE | Descrição | Plugins Recomendados |
|-----|-----------|---------------------|
| **IntelliJ IDEA** | IDE mais popular para Java. Versão Community (gratuita) ou Ultimate | Lombok (geralmente já vem instalado) |
| **VS Code** | Editor leve com suporte a Java | Extension Pack for Java, Spring Boot Extension Pack, Lombok Annotations Support |
| **Eclipse** | IDE tradicional para Java | Spring Tools Suite (STS), Lombok |
| **NetBeans** | IDE gratuita da Apache | Suporte a Maven já integrado |

**Nota:** Todas as IDEs precisam do plugin **Lombok** para que o código compile corretamente (getters, setters, construtores são gerados automaticamente).

### Estrutura do Projeto e Ponto de Entrada

```
src/main/java/br/com/exemplo/todo/
└── TodoApplication.java    ← PONTO DE ENTRADA (classe main)
```

O arquivo `TodoApplication.java` contém o método `main()` que inicia a aplicação Spring Boot:

```java
@SpringBootApplication
public class TodoApplication {
    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);  // Inicia o servidor
    }
}
```

**Para rodar o projeto na IDE:**
1. Abra o projeto como projeto Maven
2. Localize a classe `TodoApplication.java` em `src/main/java/br/com/exemplo/todo/`
3. Clique com botão direito → Run (ou use o atalho da IDE)

### Executar via Terminal

```bash
cd todo-api
mvn spring-boot:run
```

A aplicação estará disponível em: http://localhost:8080/api

### Executar via IDE

| IDE | Como Executar |
|-----|---------------|
| **IntelliJ IDEA** | Abra `TodoApplication.java` → Clique no ícone ▶️ verde ao lado do método `main` → Run |
| **VS Code** | Abra `TodoApplication.java` → Clique em "Run" acima do método `main` (ou F5) |
| **Eclipse/STS** | Clique direito em `TodoApplication.java` → Run As → Spring Boot App (ou Java Application) |
| **NetBeans** | Clique direito no projeto → Run (ou F6) |

### Swagger UI

Acesse a documentação interativa da API:
- **Swagger UI:** http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/api/api-docs

### Build do projeto

```bash
# Compilar
mvn compile

# Empacotar (gera JAR)
mvn package

# Executar o JAR
java -jar target/todo-api.jar
```

---

## Endpoints da API

### Autenticação (públicos)

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| POST | /auth/register | Registrar novo usuário | 201 / 400 / 409 |
| POST | /auth/login | Login com email/senha | 200 / 401 / 423 |
| POST | /auth/refresh | Renovar tokens | 200 / 401 |
| POST | /auth/logout | Revogar refresh token | 204 |

### Tarefas (autenticados - requer Bearer token)

| Método | Endpoint | Descrição | Headers | Status |
|--------|----------|-----------|---------|--------|
| GET | /todos | Listar tarefas da org | Authorization, X-Organization-Id | 200 / 403 |
| GET | /todos?concluido=true | Filtrar por status | Authorization, X-Organization-Id | 200 |
| GET | /todos/{id} | Buscar tarefa por ID | Authorization, X-Organization-Id | 200 / 404 |
| POST | /todos | Criar nova tarefa | Authorization, X-Organization-Id | 201 / 400 |
| PUT | /todos/{id} | Atualizar tarefa | Authorization, X-Organization-Id | 200 / 400 / 404 |
| DELETE | /todos/{id} | Excluir tarefa | Authorization, X-Organization-Id | 204 / 404 |
| PATCH | /todos/{id}/concluir | Marcar como concluída | Authorization, X-Organization-Id | 200 / 404 |
| PATCH | /todos/{id}/reabrir | Reabrir tarefa | Authorization, X-Organization-Id | 200 / 404 |

---

## Exemplos de Requisições

> **Nota:** Todos os exemplos usam variáveis de ambiente para facilitar os testes.
> Configure `TOKEN` após login/registro e `ORG_ID` com sua organização.

### 1. Autenticação

#### Registrar novo usuário
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "senha": "minhasenha123",
    "nomeOrganizacao": "Empresa do João"
  }'
```

**Resposta (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@exemplo.com"
  },
  "memberships": [
    {
      "organizationId": 1,
      "organizationName": "Empresa do João",
      "organizationSlug": "empresa-do-joao",
      "role": "OWNER"
    }
  ]
}
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "senha": "minhasenha123"
  }'
```

**Salvar token para usar nos próximos comandos:**
```bash
# No Linux/Mac:
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export ORG_ID=1

# No Windows (CMD):
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
set ORG_ID=1

# No Windows (PowerShell):
$env:TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$env:ORG_ID=1
```

#### Renovar tokens (refresh)
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6..."
  }'
```

#### Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6..."
  }'
```

---

### 2. Operações de Tarefas (Requerem Autenticação)

#### Criar tarefa
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -d '{"titulo": "Comprar pão", "descricao": "Ir à padaria do João"}'
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "titulo": "Comprar pão",
  "descricao": "Ir à padaria do João",
  "concluido": false,
  "dataCriacao": "2024-01-15T10:30:00"
}
```

#### Listar todas as tarefas
```bash
curl http://localhost:8080/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

#### Listar tarefas pendentes
```bash
curl "http://localhost:8080/api/todos?concluido=false" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

#### Listar tarefas concluídas
```bash
curl "http://localhost:8080/api/todos?concluido=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

#### Buscar por ID
```bash
curl http://localhost:8080/api/todos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

#### Atualizar tarefa
```bash
curl -X PUT http://localhost:8080/api/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -d '{"titulo": "Comprar pão integral", "descricao": "Na padaria do centro"}'
```

#### Marcar como concluída
```bash
curl -X PATCH http://localhost:8080/api/todos/1/concluir \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

#### Reabrir tarefa
```bash
curl -X PATCH http://localhost:8080/api/todos/1/reabrir \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

#### Excluir tarefa
```bash
curl -X DELETE http://localhost:8080/api/todos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

---

### 3. Exemplos de Erros

#### Acesso sem token (403 Forbidden)
```bash
curl http://localhost:8080/api/todos
```

**Resposta:**
```json
{
  "type": "about:blank",
  "title": "Forbidden",
  "status": 403,
  "detail": "Access Denied"
}
```

#### Credenciais inválidas (401 Unauthorized)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@exemplo.com", "senha": "senhaerrada"}'
```

**Resposta:**
```json
{
  "type": "/api/errors/credenciais-invalidas",
  "title": "Credenciais inválidas.",
  "status": 401,
  "detail": "Email ou senha incorretos"
}
```

#### Email já cadastrado (409 Conflict)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome": "João", "email": "joao@exemplo.com", "senha": "123456"}'
```

**Resposta:**
```json
{
  "type": "/api/errors/email-ja-existe",
  "title": "Email já cadastrado.",
  "status": 409,
  "detail": "O email joao@exemplo.com já está cadastrado no sistema"
}
```

#### Conta bloqueada (423 Locked)
```json
{
  "type": "/api/errors/conta-bloqueada",
  "title": "Conta bloqueada.",
  "status": 423,
  "detail": "Conta bloqueada por excesso de tentativas de login"
}
```

#### Validação de campos (400 Bad Request)
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -d '{"titulo": "", "descricao": "Sem título"}'
```

**Resposta:**
```json
{
  "type": "/api/errors/campo-invalido",
  "title": "Campos inválidos.",
  "status": 400,
  "detail": "Um ou mais campos são inválidos - [titulo: Título é obrigatório]"
}
```

---

### 4. Script Completo de Teste

```bash
#!/bin/bash
# Script para testar a API completa

BASE_URL="http://localhost:8080/api"

echo "=== 1. Registrando usuário ==="
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste User",
    "email": "teste@exemplo.com",
    "senha": "senha123"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')
ORG_ID=$(echo $REGISTER_RESPONSE | jq -r '.memberships[0].organizationId')

echo "Token: ${TOKEN:0:50}..."
echo "Org ID: $ORG_ID"

echo -e "\n=== 2. Criando tarefa ==="
curl -s -X POST "$BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -d '{"titulo": "Minha primeira tarefa", "descricao": "Testando a API"}' | jq

echo -e "\n=== 3. Listando tarefas ==="
curl -s "$BASE_URL/todos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" | jq

echo -e "\n=== 4. Marcando como concluída ==="
curl -s -X PATCH "$BASE_URL/todos/1/concluir" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" | jq

echo -e "\n=== Teste completo! ==="
```

---

## Banco de Dados

### SQLite

O SQLite é um banco de dados em arquivo. Não precisa de servidor separado.

- **Arquivo:** `todo/db/todo.db` (criado automaticamente)
- **Driver:** `org.sqlite.JDBC`
- **Dialect:** `org.hibernate.community.dialect.SQLiteDialect`

### Modelo de Dados (ER)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MODELO DE DADOS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────┐           ┌──────────────────┐           ┌──────────────┐   │
│   │   USUARIO    │           │    MEMBERSHIP    │           │ ORGANIZATION │   │
│   ├──────────────┤           ├──────────────────┤           ├──────────────┤   │
│   │ USR_ID (PK)  │──────────<│ MBS_USR_ID (FK)  │>──────────│ ORG_ID (PK)  │   │
│   │ USR_NOME     │           │ MBS_ORG_ID (FK)  │           │ ORG_NOME     │   │
│   │ USR_EMAIL    │           │ MBS_PAPEL        │           │ ORG_SLUG     │   │
│   │ USR_ATIVO    │           │ MBS_ATIVO        │           │ ORG_ATIVA    │   │
│   └──────┬───────┘           └──────────────────┘           └──────┬───────┘   │
│          │                                                          │           │
│          │ 1:N                                                      │ 1:N       │
│          ▼                                                          ▼           │
│   ┌──────────────┐                                           ┌──────────────┐   │
│   │   ACCOUNT    │                                           │     TODO     │   │
│   ├──────────────┤                                           ├──────────────┤   │
│   │ ACC_ID (PK)  │                                           │ TODO_ID (PK) │   │
│   │ ACC_USR_ID   │                                           │ TODO_ORG_ID  │   │
│   │ ACC_PROVIDER │                                           │ TODO_TITULO  │   │
│   │ ACC_SENHA    │                                           │ TODO_DESCR   │   │
│   │ ACC_BLOQUEADO│                                           │ TODO_CONCL   │   │
│   │ ACC_TENTATIVAS│                                          └──────────────┘   │
│   └──────────────┘                                                              │
│          │                                                                       │
│          │ 1:N                                                                   │
│          ▼                                                                       │
│   ┌──────────────────┐                                                          │
│   │  REFRESH_TOKEN   │                                                          │
│   ├──────────────────┤                                                          │
│   │ RTK_ID (PK)      │                                                          │
│   │ RTK_USR_ID (FK)  │                                                          │
│   │ RTK_TOKEN_HASH   │                                                          │
│   │ RTK_FAMILIA_ID   │   ◄── Agrupa tokens para rotação                         │
│   │ RTK_REVOGADO     │                                                          │
│   │ RTK_DATA_EXPIRACAO│                                                         │
│   └──────────────────┘                                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Estrutura das Tabelas (Migrations Flyway)

**V0001 - Tabela TODO (inicial):**
```sql
CREATE TABLE TODO (
    TODO_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    TODO_TITULO TEXT NOT NULL,
    TODO_DESCRICAO TEXT,
    TODO_CONCLUIDO INTEGER DEFAULT 0,
    TODO_DATA_CRIACAO TEXT NOT NULL,
    TODO_DATA_CONCLUSAO TEXT
);
```

**V0002 - Tabelas de Autenticação:**
```sql
-- Organização (tenant)
CREATE TABLE ORGANIZATION (
    ORG_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    ORG_NOME TEXT NOT NULL,
    ORG_SLUG TEXT NOT NULL UNIQUE,
    ORG_ATIVA INTEGER DEFAULT 1,
    ORG_DATA_CRIACAO TEXT NOT NULL,
    ORG_DATA_ATUALIZACAO TEXT NOT NULL
);

-- Usuário
CREATE TABLE USUARIO (
    USR_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    USR_NOME TEXT NOT NULL,
    USR_EMAIL TEXT NOT NULL UNIQUE,
    USR_AVATAR_URL TEXT,
    USR_ATIVO INTEGER DEFAULT 1,
    USR_ULTIMO_ACESSO TEXT,
    USR_DATA_CRIACAO TEXT NOT NULL,
    USR_DATA_ATUALIZACAO TEXT NOT NULL
);

-- Credenciais (permite múltiplos providers: local, google, github)
CREATE TABLE ACCOUNT (
    ACC_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    ACC_USR_ID INTEGER NOT NULL REFERENCES USUARIO(USR_ID),
    ACC_PROVIDER TEXT NOT NULL,                    -- 'local', 'google', 'github'
    ACC_PROVIDER_ACCOUNT_ID TEXT,
    ACC_SENHA_HASH TEXT,                           -- Apenas para provider 'local'
    ACC_BLOQUEADO INTEGER DEFAULT 0,
    ACC_TENTATIVAS_FALHA INTEGER DEFAULT 0,
    ACC_DATA_BLOQUEIO TEXT,
    ACC_DATA_CRIACAO TEXT NOT NULL,
    UNIQUE(ACC_USR_ID, ACC_PROVIDER)
);

-- Vínculo usuário-organização
CREATE TABLE MEMBERSHIP (
    MBS_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    MBS_USR_ID INTEGER NOT NULL REFERENCES USUARIO(USR_ID),
    MBS_ORG_ID INTEGER NOT NULL REFERENCES ORGANIZATION(ORG_ID),
    MBS_PAPEL TEXT NOT NULL,                       -- 'OWNER', 'ADMIN', 'MEMBER'
    MBS_ATIVO INTEGER DEFAULT 1,
    MBS_DATA_INGRESSO TEXT NOT NULL,
    UNIQUE(MBS_USR_ID, MBS_ORG_ID)
);

-- Refresh tokens (com suporte a rotação)
CREATE TABLE REFRESH_TOKEN (
    RTK_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    RTK_USR_ID INTEGER NOT NULL REFERENCES USUARIO(USR_ID),
    RTK_TOKEN_HASH TEXT NOT NULL UNIQUE,
    RTK_DATA_EXPIRACAO TEXT NOT NULL,
    RTK_REVOGADO INTEGER DEFAULT 0,
    RTK_FAMILIA_ID TEXT NOT NULL,                  -- Para rotação de tokens
    RTK_DEVICE_INFO TEXT,
    RTK_IP_ADDRESS TEXT,
    RTK_DATA_CRIACAO TEXT NOT NULL
);
```

**V0003 - Adiciona organização ao TODO:**
```sql
ALTER TABLE TODO ADD COLUMN TODO_ORG_ID INTEGER REFERENCES ORGANIZATION(ORG_ID);
```

### Configuração (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:sqlite:file:./todo/db/todo.db?date_class=TEXT
    driverClassName: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: none  # Flyway gerencia o schema
  flyway:
    enabled: true
    locations: filesystem:./flyway/sql
    baseline-on-migrate: true

# Configuração JWT
app:
  jwt:
    secret: ${JWT_SECRET:chave-secreta-muito-segura-com-pelo-menos-64-caracteres}
    access-token:
      expiration-ms: 900000           # 15 minutos
    refresh-token:
      expiration-days: 30
  security:
    bcrypt:
      strength: 12                    # Custo do BCrypt
    max-login-attempts: 5             # Bloqueia após 5 tentativas
```

---

## Testes

### Estrutura de Testes

```
src/test/java/br/com/exemplo/todo/
├── testesunitarios/           # Testes isolados (com mocks)
│   └── TodoServiceTest.java
└── testesintegracao/          # Testes end-to-end (com banco real + auth)
    └── TodoControllerIntegracaoTest.java
```

### Executar Testes

```bash
# Todos os testes
mvn test

# Apenas testes unitários
mvn test -Dtest="**/testesunitarios/**"

# Apenas testes de integração
mvn test -Dtest="**/testesintegracao/**"
```

### Testes Unitários (com TenantContext)

Testam uma classe isolada, usando mocks para dependências.
**Importante:** É necessário configurar o `TenantContext` nos testes para simular o multi-tenancy.

```java
@ExtendWith(MockitoExtension.class)  // Ativa Mockito
class TodoServiceTest {

    @Mock  // Cria mock do repositório
    private TodoRepository repository;

    @InjectMocks  // Injeta mocks no service
    private TodoService service;

    @BeforeEach
    void setUp() {
        // Configura o TenantContext para simular um usuário autenticado
        TenantInfo tenantInfo = new TenantInfo(
            1L,                    // userId
            "Teste",               // userName
            1L,                    // organizationId
            "Org Teste",           // organizationName
            MembershipRole.OWNER   // role
        );
        TenantContext.set(tenantInfo);
    }

    @AfterEach
    void tearDown() {
        // IMPORTANTE: Limpar o ThreadLocal após cada teste
        TenantContext.clear();
    }

    @Test
    void deveCriarTodoComSucesso() {
        // Configura comportamento do mock
        when(repository.save(any())).thenReturn(todo);

        // Executa
        Todo resultado = service.criar(input);

        // Verifica
        assertThat(resultado.getTitulo()).isEqualTo("Comprar pão");
        assertThat(resultado.getOrganization().getId()).isEqualTo(1L);  // Valida org
        verify(repository).save(any());
    }
}
```

### Testes de Integração (com JWT)

Testam o fluxo completo, com banco de dados real e autenticação JWT.

```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
@ActiveProfiles("testes")
@Sql(scripts = "/limpar-banco.sql", executionPhase = BEFORE_TEST_METHOD)
class TodoControllerIntegracaoTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    private String accessToken;
    private Long organizationId;

    @BeforeEach
    void setUp() {
        // Cria usuário de teste
        User user = new User();
        user.setNome("Teste");
        user.setEmail("teste@teste.com");
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
        user.setDataAtualizacao(LocalDateTime.now());
        user = userRepository.save(user);

        // Cria organização de teste
        Organization org = new Organization();
        org.setNome("Org Teste");
        org.setSlug("org-teste");
        org.setAtiva(true);
        org.setDataCriacao(LocalDateTime.now());
        org.setDataAtualizacao(LocalDateTime.now());
        org = organizationRepository.save(org);
        organizationId = org.getId();

        // Cria membership
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setOrganization(org);
        membership.setPapel(MembershipRole.OWNER);
        membership.setAtivo(true);
        membership.setDataIngresso(LocalDateTime.now());
        membershipRepository.save(membership);

        // Gera token JWT real
        accessToken = jwtService.generateAccessToken(user);
    }

    @Test
    void deveCriarTodo() {
        TodoInput input = new TodoInput();
        input.setTitulo("Nova Tarefa");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);                    // Authorization: Bearer {token}
        headers.set("X-Organization-Id", organizationId.toString());

        HttpEntity<TodoInput> request = new HttpEntity<>(input, headers);

        ResponseEntity<TodoOutput> response = restTemplate.postForEntity(
            "/api/todos", request, TodoOutput.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getId()).isNotNull();
    }

    @Test
    void deveRetornar403SemToken() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/todos", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
```

### Pontos Importantes nos Testes

| Aspecto | Teste Unitário | Teste de Integração |
|---------|---------------|---------------------|
| TenantContext | Manual via `TenantContext.set()` | Automático via filtros |
| Autenticação | Não passa pelos filtros | Requer token JWT real |
| Banco de dados | Mockado | Real (em memória) |
| Limpeza | `TenantContext.clear()` | Script SQL `@Sql` |

---

## Comparação com o Projeto Base

| Aspecto | Todo API | Reforma Tributária |
|---------|----------|-------------------|
| Controllers | 2 (Auth + Todo) | Múltiplos |
| Entities | 6 (User, Org, Todo...) | 50+ tabelas |
| Autenticação | JWT + Refresh Token | JWT + OAuth2 |
| Multi-tenancy | Por header X-Organization-Id | Complexo, múltiplas camadas |
| Complexidade | CRUD + Auth | Cálculos tributários complexos |
| Endpoints | 12 | 20+ |
| Cache | Não implementado | 60+ caches Caffeine |
| Validações | Bean Validation básico | Regras de negócio complexas |
| Exceções | 7 customizadas | 40+ exceções de negócio |
| Serviços externos | Nenhum | WebClient, retry patterns |

### O que este projeto ensina:

**Básico (estrutura):**
- **Estrutura de pastas** - Organização `api/`, `domain/`, `security/`, `config/`
- **Padrão de camadas** - Controller → Service → Repository
- **DTOs separados** - Input/Output para controle da API
- **Exception Handler** - Tratamento centralizado com ProblemDetail (RFC 7807)
- **OpenAPI/Swagger** - Documentação automática com autenticação
- **Testes organizados** - Unitários vs Integração

**Intermediário (autenticação):**
- **JWT stateless** - Access token + Refresh token
- **Spring Security 6** - SecurityFilterChain (sem WebSecurityConfigurerAdapter)
- **Filtros customizados** - JwtAuthenticationFilter, TenantFilter
- **BCrypt** - Hash seguro de senhas
- **Rotação de tokens** - Família de tokens para detecção de roubo

**Avançado (multi-tenancy):**
- **ThreadLocal** - TenantContext para isolamento por thread
- **SpEL expressions** - @PreAuthorize com expressões customizadas
- **Isolamento de dados** - Cada organização vê apenas seus dados

### Próximos passos para aprender:

1. Estudar os Services do projeto Reforma (lógica de negócio complexa)
2. Ver como o cache Caffeine é configurado
3. Analisar as validações de negócio customizadas
4. Entender o uso de WebClient para chamadas externas
5. Explorar os testes de integração mais elaborados
6. Implementar OAuth2 (Google, GitHub) usando o padrão Account

---

## Guia Prático: Passo a Passo

Esta seção ensina como criar novos recursos do zero. Vamos usar como exemplo a criação de um CRUD de **Categoria** para organizar as tarefas.

### Índice do Guia Prático

1. [Criar Migration (Tabela no Banco)](#1-criar-migration-tabela-no-banco)
2. [Criar Entity (Entidade JPA)](#2-criar-entity-entidade-jpa)
3. [Criar Repository](#3-criar-repository)
4. [Criar Exception Customizada](#4-criar-exception-customizada)
5. [Criar DTOs (Input e Output)](#5-criar-dtos-input-e-output)
6. [Criar Service](#6-criar-service)
7. [Criar Interface OpenAPI](#7-criar-interface-openapi)
8. [Criar Controller](#8-criar-controller)
9. [Registrar Exception no Handler](#9-registrar-exception-no-handler)
10. [Criar Testes](#10-criar-testes)
11. [Relacionamento entre Entidades](#11-relacionamento-entre-entidades)

---

### 1. Criar Migration (Tabela no Banco)

Migrations são scripts SQL versionados que criam/alteram o banco de dados.

**Localização:** `flyway/sql/`

**Nomenclatura:** `V{número}__{descricao}.sql`
- `V` = Versioned migration
- `{número}` = Número sequencial (0002, 0003...)
- `__` = Dois underscores (obrigatório)
- `{descricao}` = Descrição sem espaços

**Criar arquivo:** `flyway/sql/V0002__criar_tabela_categoria.sql`

```sql
-- Criação da tabela CATEGORIA
CREATE TABLE CATEGORIA (
    CATE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    CATE_NOME TEXT NOT NULL,
    CATE_DESCRICAO TEXT,
    CATE_COR TEXT DEFAULT '#808080',
    CATE_ATIVO INTEGER DEFAULT 1,
    CATE_DATA_CRIACAO TEXT NOT NULL
);

-- Índice para busca por nome
CREATE INDEX IDX_CATEGORIA_NOME ON CATEGORIA(CATE_NOME);

-- Índice para filtrar ativos
CREATE INDEX IDX_CATEGORIA_ATIVO ON CATEGORIA(CATE_ATIVO);
```

**Convenção de nomes de colunas:**
- Prefixo com abreviação da tabela (CATE_ para CATEGORIA)
- Sufixo _ID para chaves primárias
- Sufixo _DATA para datas
- Booleanos como INTEGER (0/1) no SQLite

**Para adicionar coluna em tabela existente:**

```sql
-- V0003__adicionar_categoria_em_todo.sql
ALTER TABLE TODO ADD COLUMN TODO_CATE_ID INTEGER REFERENCES CATEGORIA(CATE_ID);

CREATE INDEX IDX_TODO_CATEGORIA ON TODO(TODO_CATE_ID);
```

---

### 2. Criar Entity (Entidade JPA)

**Localização:** `src/main/java/br/com/exemplo/todo/domain/model/entity/`

**Criar arquivo:** `Categoria.java`

```java
package br.com.exemplo.todo.domain.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "CATEGORIA")
public class Categoria {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CATE_ID")
    private Long id;

    @NotNull
    @Column(name = "CATE_NOME", nullable = false)
    private String nome;

    @Column(name = "CATE_DESCRICAO")
    private String descricao;

    @Column(name = "CATE_COR")
    private String cor = "#808080";

    @Column(name = "CATE_ATIVO")
    private Boolean ativo = true;

    @NotNull
    @Column(name = "CATE_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

}
```

**Checklist da Entity:**
- [ ] `@Entity` na classe
- [ ] `@Table(name = "NOME_TABELA")`
- [ ] `@Data` do Lombok (getters/setters)
- [ ] `@EqualsAndHashCode(onlyExplicitlyIncluded = true)`
- [ ] `@Id` no campo de chave primária
- [ ] `@EqualsAndHashCode.Include` no ID
- [ ] `@GeneratedValue(strategy = GenerationType.IDENTITY)` para auto-increment
- [ ] `@Column(name = "NOME_COLUNA")` em cada campo
- [ ] `@NotNull` em campos obrigatórios
- [ ] Valores default definidos na declaração do campo

**Tipos de dados comuns:**

| Java | SQLite | Anotações |
|------|--------|-----------|
| `Long` | INTEGER | `@Id @GeneratedValue` |
| `String` | TEXT | `@Column` |
| `Boolean` | INTEGER (0/1) | `@Column` |
| `LocalDateTime` | TEXT | `@Column` |
| `LocalDate` | TEXT | `@Column` |
| `BigDecimal` | REAL | `@Column` |
| `Integer` | INTEGER | `@Column` |

---

### 3. Criar Repository

**Localização:** `src/main/java/br/com/exemplo/todo/domain/repository/`

**Criar arquivo:** `CategoriaRepository.java`

```java
package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Query method automática pelo nome
    List<Categoria> findByAtivoOrderByNomeAsc(Boolean ativo);

    // Query method com ordenação
    List<Categoria> findAllByOrderByNomeAsc();

    // Busca por nome (case insensitive)
    Optional<Categoria> findByNomeIgnoreCase(String nome);

    // Verifica se existe por nome
    boolean existsByNomeIgnoreCase(String nome);

    // Query customizada com JPQL
    @Query("SELECT c FROM Categoria c WHERE c.ativo = true ORDER BY c.nome")
    List<Categoria> buscarAtivas();

    // Query customizada com parâmetro
    @Query("SELECT c FROM Categoria c WHERE LOWER(c.nome) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Categoria> buscarPorTermo(@Param("termo") String termo);

    // Query nativa SQL (quando JPQL não resolve)
    @Query(value = "SELECT * FROM CATEGORIA WHERE CATE_ATIVO = 1 LIMIT :limite", nativeQuery = true)
    List<Categoria> buscarAtivasComLimite(@Param("limite") int limite);

}
```

**Padrões de Query Methods (Spring Data JPA cria automaticamente):**

| Método | SQL Gerado |
|--------|-----------|
| `findByNome(String)` | `WHERE nome = ?` |
| `findByNomeAndAtivo(String, Boolean)` | `WHERE nome = ? AND ativo = ?` |
| `findByNomeOrDescricao(String, String)` | `WHERE nome = ? OR descricao = ?` |
| `findByNomeIgnoreCase(String)` | `WHERE LOWER(nome) = LOWER(?)` |
| `findByNomeContaining(String)` | `WHERE nome LIKE %?%` |
| `findByNomeStartingWith(String)` | `WHERE nome LIKE ?%` |
| `findByIdIn(List<Long>)` | `WHERE id IN (?, ?, ?)` |
| `findByAtivoTrue()` | `WHERE ativo = true` |
| `findByAtivoFalse()` | `WHERE ativo = false` |
| `findByDataCriacaoAfter(LocalDateTime)` | `WHERE dataCriacao > ?` |
| `findByDataCriacaoBetween(LocalDateTime, LocalDateTime)` | `WHERE dataCriacao BETWEEN ? AND ?` |
| `countByAtivo(Boolean)` | `SELECT COUNT(*) WHERE ativo = ?` |
| `existsByNome(String)` | `SELECT EXISTS(... WHERE nome = ?)` |
| `deleteByAtivo(Boolean)` | `DELETE WHERE ativo = ?` |

**Ordenação:**
- `findByAtivoOrderByNomeAsc` → `ORDER BY nome ASC`
- `findByAtivoOrderByNomeDesc` → `ORDER BY nome DESC`
- `findAllByOrderByDataCriacaoDesc` → `ORDER BY dataCriacao DESC`

---

### 4. Criar Exception Customizada

**Localização:** `src/main/java/br/com/exemplo/todo/domain/service/exception/`

**Criar arquivo:** `CategoriaNaoEncontradaException.java`

```java
package br.com.exemplo.todo.domain.service.exception;

public class CategoriaNaoEncontradaException extends RuntimeException {

    public CategoriaNaoEncontradaException(String message) {
        super(message);
    }

    public CategoriaNaoEncontradaException(Long id) {
        this(String.format("Categoria com ID %d não encontrada", id));
    }

}
```

**Outras exceções comuns:**

```java
// Para regras de negócio
public class CategoriaEmUsoException extends RuntimeException {
    public CategoriaEmUsoException(Long id) {
        super(String.format("Categoria %d não pode ser excluída pois está em uso", id));
    }
}

// Para duplicidade
public class CategoriaDuplicadaException extends RuntimeException {
    public CategoriaDuplicadaException(String nome) {
        super(String.format("Já existe uma categoria com o nome '%s'", nome));
    }
}
```

---

### 5. Criar DTOs (Input e Output)

#### 5.1 Input DTO (dados que a API recebe)

**Localização:** `src/main/java/br/com/exemplo/todo/api/model/input/`

**Criar arquivo:** `CategoriaInput.java`

```java
package br.com.exemplo.todo.api.model.input;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoriaInput {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    @Schema(description = "Nome da categoria", example = "Trabalho")
    private String nome;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    @Schema(description = "Descrição da categoria", example = "Tarefas relacionadas ao trabalho")
    private String descricao;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor deve estar no formato hexadecimal (#RRGGBB)")
    @Schema(description = "Cor em hexadecimal", example = "#FF5733")
    private String cor;

}
```

**Anotações de validação mais usadas:**

```java
// Strings
@NotNull                    // Não pode ser null
@NotBlank                   // Não pode ser null, vazio ou só espaços
@NotEmpty                   // Não pode ser null ou vazio (funciona em listas também)
@Size(min = 1, max = 100)   // Tamanho mínimo e máximo
@Pattern(regexp = "...")    // Deve casar com regex
@Email                      // Formato de email válido

// Números
@Min(0)                     // Valor mínimo
@Max(100)                   // Valor máximo
@Positive                   // Deve ser positivo (> 0)
@PositiveOrZero             // Deve ser >= 0
@Negative                   // Deve ser negativo
@DecimalMin("0.01")         // Para BigDecimal
@DecimalMax("999.99")       // Para BigDecimal
@Digits(integer = 10, fraction = 2)  // Precisão decimal

// Datas
@Past                       // Deve ser no passado
@PastOrPresent              // Passado ou presente
@Future                     // Deve ser no futuro
@FutureOrPresent            // Futuro ou presente

// Objetos aninhados
@Valid                      // Valida objeto interno recursivamente
@NotNull @Valid             // Objeto obrigatório e validado
```

#### 5.2 Output DTO (dados que a API retorna)

**Localização:** `src/main/java/br/com/exemplo/todo/api/model/output/`

**Criar arquivo:** `CategoriaOutput.java`

```java
package br.com.exemplo.todo.api.model.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CategoriaOutput {

    @Schema(description = "ID único da categoria", example = "1")
    private Long id;

    @Schema(description = "Nome da categoria", example = "Trabalho")
    private String nome;

    @Schema(description = "Descrição da categoria", example = "Tarefas relacionadas ao trabalho")
    private String descricao;

    @Schema(description = "Cor em hexadecimal", example = "#FF5733")
    private String cor;

    @Schema(description = "Se a categoria está ativa", example = "true")
    private Boolean ativo;

    @Schema(description = "Data de criação", example = "2024-01-15T10:30:00")
    private LocalDateTime dataCriacao;

}
```

#### 5.3 DTO Resumido (para listas ou relacionamentos)

```java
package br.com.exemplo.todo.api.model.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoriaResumoOutput {

    @Schema(description = "ID da categoria", example = "1")
    private Long id;

    @Schema(description = "Nome da categoria", example = "Trabalho")
    private String nome;

    @Schema(description = "Cor da categoria", example = "#FF5733")
    private String cor;

}
```

---

### 6. Criar Service

**Localização:** `src/main/java/br/com/exemplo/todo/domain/service/`

**Criar arquivo:** `CategoriaService.java`

```java
package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.model.input.CategoriaInput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.service.exception.CategoriaNaoEncontradaException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class CategoriaService {

    private final CategoriaRepository repository;
    private final ModelMapper modelMapper;

    // ==================== CONSULTAS ====================

    /**
     * Lista todas as categorias ordenadas por nome.
     */
    public List<Categoria> listarTodas() {
        log.debug("Listando todas as categorias");
        return repository.findAllByOrderByNomeAsc();
    }

    /**
     * Lista categorias filtrando por status ativo.
     */
    public List<Categoria> listarPorStatus(Boolean ativo) {
        log.debug("Listando categorias com ativo={}", ativo);
        return repository.findByAtivoOrderByNomeAsc(ativo);
    }

    /**
     * Busca categoria por ID.
     * @throws CategoriaNaoEncontradaException se não encontrar
     */
    public Categoria buscarPorId(Long id) {
        log.debug("Buscando categoria com ID {}", id);
        return repository.findById(id)
                .orElseThrow(() -> new CategoriaNaoEncontradaException(id));
    }

    /**
     * Busca categoria por nome (case insensitive).
     */
    public Categoria buscarPorNome(String nome) {
        log.debug("Buscando categoria com nome '{}'", nome);
        return repository.findByNomeIgnoreCase(nome)
                .orElseThrow(() -> new CategoriaNaoEncontradaException(
                        String.format("Categoria '%s' não encontrada", nome)));
    }

    // ==================== COMANDOS ====================

    /**
     * Cria uma nova categoria.
     */
    @Transactional
    public Categoria criar(CategoriaInput input) {
        log.debug("Criando categoria: {}", input.getNome());

        // Validação de regra de negócio
        validarNomeDuplicado(input.getNome(), null);

        // Conversão e defaults
        Categoria categoria = modelMapper.map(input, Categoria.class);
        categoria.setDataCriacao(LocalDateTime.now());
        categoria.setAtivo(true);

        // Se cor não informada, usa default
        if (categoria.getCor() == null) {
            categoria.setCor("#808080");
        }

        Categoria salva = repository.save(categoria);
        log.info("Categoria criada com ID {}", salva.getId());

        return salva;
    }

    /**
     * Atualiza uma categoria existente.
     */
    @Transactional
    public Categoria atualizar(Long id, CategoriaInput input) {
        log.debug("Atualizando categoria ID {}", id);

        Categoria categoriaExistente = buscarPorId(id);

        // Validação de regra de negócio (ignora a própria categoria)
        validarNomeDuplicado(input.getNome(), id);

        // Atualiza apenas os campos editáveis
        categoriaExistente.setNome(input.getNome());
        categoriaExistente.setDescricao(input.getDescricao());
        if (input.getCor() != null) {
            categoriaExistente.setCor(input.getCor());
        }

        Categoria atualizada = repository.save(categoriaExistente);
        log.info("Categoria ID {} atualizada", id);

        return atualizada;
    }

    /**
     * Exclui uma categoria.
     */
    @Transactional
    public void excluir(Long id) {
        log.debug("Excluindo categoria ID {}", id);

        Categoria categoria = buscarPorId(id);

        // Aqui você pode adicionar validação se a categoria está em uso
        // Ex: if (todoRepository.existsByCategoriaId(id)) throw new CategoriaEmUsoException(id);

        repository.delete(categoria);
        log.info("Categoria ID {} excluída", id);
    }

    /**
     * Ativa uma categoria.
     */
    @Transactional
    public Categoria ativar(Long id) {
        log.debug("Ativando categoria ID {}", id);

        Categoria categoria = buscarPorId(id);
        categoria.setAtivo(true);

        Categoria ativada = repository.save(categoria);
        log.info("Categoria ID {} ativada", id);

        return ativada;
    }

    /**
     * Inativa uma categoria.
     */
    @Transactional
    public Categoria inativar(Long id) {
        log.debug("Inativando categoria ID {}", id);

        Categoria categoria = buscarPorId(id);
        categoria.setAtivo(false);

        Categoria inativada = repository.save(categoria);
        log.info("Categoria ID {} inativada", id);

        return inativada;
    }

    // ==================== VALIDAÇÕES PRIVADAS ====================

    /**
     * Valida se já existe categoria com o mesmo nome.
     * @param nome nome a validar
     * @param idIgnorar ID para ignorar (usado em atualização)
     */
    private void validarNomeDuplicado(String nome, Long idIgnorar) {
        repository.findByNomeIgnoreCase(nome).ifPresent(existente -> {
            // Se está atualizando e encontrou a própria categoria, OK
            if (idIgnorar != null && existente.getId().equals(idIgnorar)) {
                return;
            }
            throw new RuntimeException(
                    String.format("Já existe uma categoria com o nome '%s'", nome));
        });
    }

}
```

**Checklist do Service:**
- [ ] `@Service` na classe
- [ ] `@RequiredArgsConstructor` para injeção
- [ ] `@Slf4j` para logging
- [ ] `@Transactional` em métodos que alteram dados
- [ ] Injetar Repository e ModelMapper
- [ ] Métodos de consulta (listar, buscar)
- [ ] Métodos de comando (criar, atualizar, excluir)
- [ ] Validações de negócio
- [ ] Logging adequado (debug para início, info para conclusão)

---

### 7. Criar Interface OpenAPI

**Localização:** `src/main/java/br/com/exemplo/todo/api/openapi/`

**Criar arquivo:** `CategoriaControllerOpenApi.java`

```java
package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.model.input.CategoriaInput;
import br.com.exemplo.todo.api.model.output.CategoriaOutput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;

import java.util.List;

@Tag(name = "Categorias", description = "Gerenciamento de categorias de tarefas")
public interface CategoriaControllerOpenApi {

    @Operation(
            summary = "Lista categorias",
            description = "Retorna todas as categorias cadastradas, com filtro opcional por status"
    )
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    List<CategoriaOutput> listar(
            @Parameter(description = "Filtrar por status (true = ativas, false = inativas)")
            Boolean ativo
    );

    @Operation(summary = "Busca categoria por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria encontrada"),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput buscar(
            @Parameter(description = "ID da categoria", required = true, example = "1")
            Long id
    );

    @Operation(summary = "Cria nova categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoria criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput criar(
            @Parameter(description = "Dados da categoria", required = true)
            CategoriaInput input
    );

    @Operation(summary = "Atualiza categoria existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria atualizada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput atualizar(
            @Parameter(description = "ID da categoria", required = true) Long id,
            @Parameter(description = "Novos dados", required = true) CategoriaInput input
    );

    @Operation(summary = "Exclui categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Categoria excluída"),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "409", description = "Categoria em uso",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    void excluir(
            @Parameter(description = "ID da categoria", required = true) Long id
    );

    @Operation(summary = "Ativa categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria ativada"),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput ativar(
            @Parameter(description = "ID da categoria", required = true) Long id
    );

    @Operation(summary = "Inativa categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria inativada"),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput inativar(
            @Parameter(description = "ID da categoria", required = true) Long id
    );

}
```

---

### 8. Criar Controller

**Localização:** `src/main/java/br/com/exemplo/todo/api/controller/`

**Criar arquivo:** `CategoriaController.java`

```java
package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.model.input.CategoriaInput;
import br.com.exemplo.todo.api.model.output.CategoriaOutput;
import br.com.exemplo.todo.api.openapi.CategoriaControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("categorias")
public class CategoriaController implements CategoriaControllerOpenApi {

    private final CategoriaService categoriaService;
    private final ModelMapper modelMapper;

    @Override
    @GetMapping
    public List<CategoriaOutput> listar(@RequestParam(required = false) Boolean ativo) {
        log.debug("GET /categorias - ativo={}", ativo);

        List<Categoria> categorias;
        if (ativo != null) {
            categorias = categoriaService.listarPorStatus(ativo);
        } else {
            categorias = categoriaService.listarTodas();
        }

        return categorias.stream()
                .map(this::toOutput)
                .toList();
    }

    @Override
    @GetMapping("/{id}")
    public CategoriaOutput buscar(@PathVariable Long id) {
        log.debug("GET /categorias/{}", id);

        Categoria categoria = categoriaService.buscarPorId(id);
        return toOutput(categoria);
    }

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaOutput criar(@RequestBody @Valid CategoriaInput input) {
        log.debug("POST /categorias - nome={}", input.getNome());

        Categoria categoria = categoriaService.criar(input);
        return toOutput(categoria);
    }

    @Override
    @PutMapping("/{id}")
    public CategoriaOutput atualizar(@PathVariable Long id, @RequestBody @Valid CategoriaInput input) {
        log.debug("PUT /categorias/{} - nome={}", id, input.getNome());

        Categoria categoria = categoriaService.atualizar(id, input);
        return toOutput(categoria);
    }

    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        log.debug("DELETE /categorias/{}", id);

        categoriaService.excluir(id);
    }

    @Override
    @PatchMapping("/{id}/ativar")
    public CategoriaOutput ativar(@PathVariable Long id) {
        log.debug("PATCH /categorias/{}/ativar", id);

        Categoria categoria = categoriaService.ativar(id);
        return toOutput(categoria);
    }

    @Override
    @PatchMapping("/{id}/inativar")
    public CategoriaOutput inativar(@PathVariable Long id) {
        log.debug("PATCH /categorias/{}/inativar", id);

        Categoria categoria = categoriaService.inativar(id);
        return toOutput(categoria);
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private CategoriaOutput toOutput(Categoria categoria) {
        return modelMapper.map(categoria, CategoriaOutput.class);
    }

}
```

**Checklist do Controller:**
- [ ] `@RestController`
- [ ] `@RequestMapping("nome-recurso")` (plural, minúsculo)
- [ ] `@RequiredArgsConstructor`
- [ ] `@Slf4j`
- [ ] Implementa interface OpenAPI
- [ ] Injeta Service e ModelMapper
- [ ] `@GetMapping` para consultas
- [ ] `@PostMapping` + `@ResponseStatus(CREATED)` para criar
- [ ] `@PutMapping` para atualizar
- [ ] `@DeleteMapping` + `@ResponseStatus(NO_CONTENT)` para excluir
- [ ] `@PatchMapping` para ações específicas
- [ ] `@Valid` no `@RequestBody` para validação
- [ ] `@PathVariable` para parâmetros de URL
- [ ] `@RequestParam` para query parameters
- [ ] Método privado `toOutput()` para conversão

---

### 9. Registrar Exception no Handler

**Editar arquivo:** `src/main/java/br/com/exemplo/todo/api/exceptionhandler/ProblemType.java`

```java
// Adicionar novo enum
CATEGORIA_NAO_ENCONTRADA(CategoriaNaoEncontradaException.class,
        "Categoria não encontrada", "categoria-nao-encontrada"),
```

**Editar arquivo:** `src/main/java/br/com/exemplo/todo/api/exceptionhandler/ApiExceptionHandler.java`

```java
// Adicionar import
import br.com.exemplo.todo.domain.service.exception.CategoriaNaoEncontradaException;

// Adicionar handler
@ExceptionHandler(CategoriaNaoEncontradaException.class)
public ResponseEntity<Object> handleCategoriaNaoEncontradaException(
        CategoriaNaoEncontradaException ex, WebRequest request) {

    HttpStatus status = HttpStatus.NOT_FOUND;
    ProblemDetail problemDetail = createProblem(ex, status);

    return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
}
```

---

### 10. Criar Testes

#### 10.1 Teste Unitário do Service

**Criar arquivo:** `src/test/java/br/com/exemplo/todo/testesunitarios/CategoriaServiceTest.java`

```java
package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.model.input.CategoriaInput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.service.CategoriaService;
import br.com.exemplo.todo.domain.service.exception.CategoriaNaoEncontradaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoriaService")
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository repository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private CategoriaService service;

    private Categoria categoria;
    private CategoriaInput input;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNome("Trabalho");
        categoria.setDescricao("Tarefas do trabalho");
        categoria.setCor("#FF5733");
        categoria.setAtivo(true);
        categoria.setDataCriacao(LocalDateTime.now());

        input = new CategoriaInput();
        input.setNome("Trabalho");
        input.setDescricao("Tarefas do trabalho");
        input.setCor("#FF5733");
    }

    @Nested
    @DisplayName("listarTodas")
    class ListarTodas {

        @Test
        @DisplayName("deve retornar lista de categorias")
        void deveRetornarLista() {
            when(repository.findAllByOrderByNomeAsc()).thenReturn(List.of(categoria));

            List<Categoria> resultado = service.listarTodas();

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getNome()).isEqualTo("Trabalho");
        }
    }

    @Nested
    @DisplayName("buscarPorId")
    class BuscarPorId {

        @Test
        @DisplayName("deve retornar categoria quando existe")
        void deveRetornarQuandoExiste() {
            when(repository.findById(1L)).thenReturn(Optional.of(categoria));

            Categoria resultado = service.buscarPorId(1L);

            assertThat(resultado.getNome()).isEqualTo("Trabalho");
        }

        @Test
        @DisplayName("deve lançar exceção quando não existe")
        void deveLancarExcecaoQuandoNaoExiste() {
            when(repository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.buscarPorId(999L))
                    .isInstanceOf(CategoriaNaoEncontradaException.class);
        }
    }

    @Nested
    @DisplayName("criar")
    class Criar {

        @Test
        @DisplayName("deve criar categoria com sucesso")
        void deveCriarComSucesso() {
            Categoria novaCategoria = new Categoria();
            novaCategoria.setNome("Trabalho");

            when(repository.findByNomeIgnoreCase("Trabalho")).thenReturn(Optional.empty());
            when(modelMapper.map(input, Categoria.class)).thenReturn(novaCategoria);
            when(repository.save(any(Categoria.class))).thenAnswer(inv -> {
                Categoria c = inv.getArgument(0);
                c.setId(1L);
                return c;
            });

            Categoria resultado = service.criar(input);

            assertThat(resultado.getId()).isEqualTo(1L);
            assertThat(resultado.getAtivo()).isTrue();
            assertThat(resultado.getDataCriacao()).isNotNull();
        }
    }

    @Nested
    @DisplayName("excluir")
    class Excluir {

        @Test
        @DisplayName("deve excluir categoria existente")
        void deveExcluirComSucesso() {
            when(repository.findById(1L)).thenReturn(Optional.of(categoria));

            service.excluir(1L);

            verify(repository).delete(categoria);
        }
    }

}
```

#### 10.2 Teste de Integração

**Criar arquivo:** `src/test/java/br/com/exemplo/todo/testesintegracao/CategoriaControllerIntegracaoTest.java`

```java
package br.com.exemplo.todo.testesintegracao;

import br.com.exemplo.todo.api.model.input.CategoriaInput;
import br.com.exemplo.todo.api.model.output.CategoriaOutput;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("testes")
@DisplayName("CategoriaController - Integração")
class CategoriaControllerIntegracaoTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CategoriaRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    @DisplayName("deve criar categoria com sucesso")
    void deveCriarComSucesso() {
        CategoriaInput input = new CategoriaInput();
        input.setNome("Trabalho");
        input.setDescricao("Tarefas do trabalho");
        input.setCor("#FF5733");

        ResponseEntity<CategoriaOutput> response = restTemplate.postForEntity(
                "/api/categorias", input, CategoriaOutput.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getNome()).isEqualTo("Trabalho");
        assertThat(response.getBody().getAtivo()).isTrue();
    }

    @Test
    @DisplayName("deve retornar 400 quando nome vazio")
    void deveRetornar400QuandoNomeVazio() {
        CategoriaInput input = new CategoriaInput();
        input.setNome("");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/categorias", input, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

}
```

---

### 11. Relacionamento entre Entidades

Para adicionar categoria às tarefas (relacionamento ManyToOne):

#### 11.1 Migration

```sql
-- V0003__adicionar_categoria_em_todo.sql
ALTER TABLE TODO ADD COLUMN TODO_CATE_ID INTEGER REFERENCES CATEGORIA(CATE_ID);
```

#### 11.2 Atualizar Entity Todo

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "TODO_CATE_ID")
private Categoria categoria;
```

#### 11.3 Atualizar TodoInput

```java
@Schema(description = "ID da categoria (opcional)", example = "1")
private Long categoriaId;
```

#### 11.4 Atualizar TodoOutput

```java
@Schema(description = "Categoria da tarefa")
private CategoriaResumoOutput categoria;
```

#### 11.5 Atualizar TodoService

```java
@Transactional
public Todo criar(TodoInput input) {
    Todo todo = modelMapper.map(input, Todo.class);
    todo.setDataCriacao(LocalDateTime.now());
    todo.setConcluido(false);

    // Associar categoria se informada
    if (input.getCategoriaId() != null) {
        Categoria categoria = categoriaService.buscarPorId(input.getCategoriaId());
        todo.setCategoria(categoria);
    }

    return repository.save(todo);
}
```

---

## Resumo: Checklist para Novo CRUD

```
□ 1. Migration SQL (flyway/sql/V000X__*.sql)
□ 2. Entity (domain/model/entity/*.java)
□ 3. Repository (domain/repository/*Repository.java)
□ 4. Exception (domain/service/exception/*Exception.java)
□ 5. Input DTO (api/model/input/*Input.java)
□ 6. Output DTO (api/model/output/*Output.java)
□ 7. Service (domain/service/*Service.java)
□ 8. OpenAPI Interface (api/openapi/*ControllerOpenApi.java)
□ 9. Controller (api/controller/*Controller.java)
□ 10. Registrar Exception no Handler
□ 11. Testes Unitários (testesunitarios/*ServiceTest.java)
□ 12. Testes de Integração (testesintegracao/*ControllerIntegracaoTest.java)
```

**Ordem recomendada de criação:**
1. Migration → 2. Entity → 3. Repository → 4. Exception → 5. DTOs → 6. Service → 7. OpenAPI → 8. Controller → 9. Handler → 10. Testes

---

## Frontend (Interface Web)

O projeto inclui uma interface web simples para gerenciar as tarefas.

### Localização

```
src/main/resources/static/
└── index.html          # Página principal (Single Page Application)
```

### Tecnologias do Frontend

| Tecnologia | Versão | CDN | Propósito |
|------------|--------|-----|-----------|
| Bootstrap | 5.3.3 | jsdelivr | Framework CSS (layout, componentes) |
| Bootstrap Icons | 1.11.3 | jsdelivr | Ícones |
| Axios | latest | jsdelivr | Requisições HTTP para a API |
| jQuery | 3.7.1 | jsdelivr | Manipulação DOM e eventos |

### Como Funciona

O Spring Boot serve automaticamente arquivos da pasta `src/main/resources/static/` como conteúdo estático. O arquivo `index.html` é reconhecido como "welcome page" e é servido na raiz do context-path.

**Configuração automática:**
- Spring detecta: `Adding welcome page: class path resource [static/index.html]`
- Acessível em: `http://localhost:8080/api/` (redireciona para index.html)
- Também acessível em: `http://localhost:8080/api/index.html`

### Acesso

| URL | Descrição |
|-----|-----------|
| http://localhost:8080/api/ | Frontend (interface web) |
| http://localhost:8080/api/swagger-ui.html | Swagger UI (documentação interativa) |
| http://localhost:8080/api/todos | API REST (JSON) |

### Funcionalidades do Frontend

- Listar todas as tarefas
- Filtrar por status: Todas / Pendentes / Concluídas
- Criar nova tarefa (modal com formulário)
- Editar tarefa existente
- Excluir tarefa (com confirmação)
- Marcar tarefa como concluída
- Reabrir tarefa concluída
- Notificações toast para feedback de ações

### Estrutura do index.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <!-- CDNs do Bootstrap e Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Estilos customizados inline -->
    <style>
        .todo-concluido { text-decoration: line-through; opacity: 0.6; }
        /* ... */
    </style>
</head>
<body>
    <!-- Navbar -->
    <!-- Filtros e Botão Nova Tarefa -->
    <!-- Lista de Tarefas (renderizada via JavaScript) -->
    <!-- Modais (criar/editar, confirmar exclusão) -->
    <!-- Toast de notificações -->

    <!-- CDNs do Bootstrap JS, Axios e jQuery -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>

    <!-- JavaScript da aplicação -->
    <script>
        const API_URL = '/api/todos';
        // Funções: carregarTarefas(), criar(), editar(), excluir(), etc.
    </script>
</body>
</html>
```

### Como Remover o Frontend

Se você quiser remover a interface web e manter apenas a API REST:

```bash
# Excluir o arquivo
rm src/main/resources/static/index.html

# Ou excluir toda a pasta static (se não houver outros arquivos)
rm -rf src/main/resources/static/
```

Após remover, a API REST continua funcionando normalmente em `/api/todos`.

### Como Incrementar o Frontend

#### Adicionar novos arquivos estáticos

Coloque arquivos em `src/main/resources/static/`:

```
src/main/resources/static/
├── index.html
├── css/
│   └── styles.css      # CSS customizado
├── js/
│   └── app.js          # JavaScript separado
└── img/
    └── logo.png        # Imagens
```

Referencie nos arquivos HTML:
```html
<link rel="stylesheet" href="css/styles.css">
<script src="js/app.js"></script>
<img src="img/logo.png">
```

#### Separar JavaScript em arquivo próprio

1. Criar `src/main/resources/static/js/app.js` com o código JavaScript
2. No `index.html`, substituir o `<script>` inline por:
   ```html
   <script src="js/app.js"></script>
   ```

#### Adicionar novas páginas

Criar novos arquivos HTML em `static/`:
- `src/main/resources/static/categorias.html` → `http://localhost:8080/api/categorias.html`
- `src/main/resources/static/sobre.html` → `http://localhost:8080/api/sobre.html`

#### Integrar com novo CRUD (ex: Categorias)

No JavaScript, adicionar:

```javascript
const CATEGORIAS_URL = '/api/categorias';

function carregarCategorias() {
    axios.get(CATEGORIAS_URL)
        .then(response => renderizarCategorias(response.data))
        .catch(error => mostrarToast('Erro', error.message, 'danger'));
}

function criarCategoria(dados) {
    axios.post(CATEGORIAS_URL, dados)
        .then(response => {
            mostrarToast('Sucesso', 'Categoria criada!', 'success');
            carregarCategorias();
        })
        .catch(error => mostrarToast('Erro', error.response?.data?.detail, 'danger'));
}
```

### Dicas de Desenvolvimento

1. **Hot Reload**: Com Spring DevTools (já configurado), alterações em arquivos estáticos são recarregadas automaticamente. Basta atualizar o navegador (F5).

2. **Console do Navegador**: Use F12 → Console para ver erros JavaScript e respostas da API.

3. **Network Tab**: Use F12 → Network para inspecionar requisições HTTP para a API.

4. **CORS**: Não há problemas de CORS pois o frontend e a API estão no mesmo servidor/porta.

### Alternativa: Framework Frontend Separado

Se preferir usar React, Vue, ou Angular:

1. Crie o projeto frontend separado
2. Configure o frontend para apontar para `http://localhost:8080/api`
3. Adicione configuração CORS no Spring se necessário:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000") // URL do frontend
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH");
            }
        };
    }
}
```

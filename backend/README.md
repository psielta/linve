# Linve API - Spring Boot + SQLite + JWT + Multi-Tenancy

Backend do sistema **Linve** - um sistema de gestão multi-tenant para delivery, desenvolvido com **Spring Boot**, **autenticação JWT** e **multi-tenancy por organização**.

Este projeto segue a **mesma arquitetura** do projeto `Reforma\codigo-fonte-backend`, usando as mesmas versões e padrões. O módulo de Todo serve como exemplo arquitetural para validar a estrutura.

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
13. [Módulo de Administração de Usuários](#módulo-de-administração-de-usuários-user-admin)
14. [Comparação com o Projeto Base](#comparação-com-o-projeto-base)
15. [Guia Prático: Passo a Passo](#guia-prático-passo-a-passo)
16. [Resumo: Checklist para Novo CRUD](#resumo-checklist-para-novo-crud)
17. [OpenAPI/Swagger para Geração de Clientes](#openapiswagger-para-geração-de-clientes)
18. [Frontend (Interface Web)](#frontend-interface-web)
19. [Armazenamento de Arquivos com AWS S3](#armazenamento-de-arquivos-com-aws-s3)
20. [Fotos de Organização e Usuário](#fotos-de-organizacao-e-usuario)
21. [Logging e Rotação de Logs](#logging-e-rotação-de-logs)

---

## Tecnologias

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Java | 21 | Linguagem de programação |
| Spring Boot | 3.4.7 | Framework web |
| Spring Security | 6.4.x | Autenticação e autorização |
| Spring Data JPA | 3.4.7 | Abstração para acesso a dados |
| SQLite | - | Banco de dados local (arquivo) |
| Flyway | 10.x | Migrations de banco de dados |
| Hibernate Community Dialects | - | Suporte SQLite no Hibernate |
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
linve-api/
├── pom.xml                                    # Configuração Maven (dependências)
├── flyway/sql/
│   ├── V0001__criar_tabela_todo.sql           # Migration inicial (tabela TODO)
│   ├── V0002__criar_tabelas_autenticacao.sql  # Tabelas de auth (USUARIO, ORGANIZATION, etc)
│   └── V0003__adicionar_organizacao_todo.sql  # Adiciona org_id à tabela TODO
├── data/                                      # Banco SQLite (criado automaticamente)
│   └── todo.db
└── src/
    ├── main/
    │   ├── java/br/com/exemplo/todo/         # Código fonte (controllers, services, repos)
    │   └── resources/
    │       ├── application.yml               # Configuração principal (SQLite + JWT)
    │       └── application-testes.yml        # Config profile testes
    └── test/java/br/com/exemplo/todo/        # Testes unitários/integração
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
  "iss": "linve-api",      // Issuer
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

### Injecao de Dependencia (como o Spring faz)

> Vindo de ASP.NET Core? Pense que o `Program.cs` (onde voce chama `AddScoped`/`AddTransient`) aqui e substituido pelo **component scan** do Spring.

- **Quem registra os beans:** `LinveApplication.java` usa `@SpringBootApplication`, que habilita `@ComponentScan` no pacote base `br.com.exemplo.todo`. Qualquer classe abaixo dele anotada com `@Component`, `@Service`, `@Repository`, `@RestController` ou `@Configuration` vira bean automaticamente.
- **Ciclo de vida:** por padrao os beans sao `singleton` (similar a `AddSingleton`). Para um bean por requisicao existe `@RequestScope` (equivalente a `AddScoped`). Nada aqui usa escopo `prototype`/`transient`.

  **Lembrete - Tipos de Escopo:**

  | Escopo | Spring | ASP.NET Core | Quando usar |
  |--------|--------|--------------|-------------|
  | **Singleton** | `@Scope("singleton")` (padrao) | `AddSingleton` | Uma unica instancia para toda a aplicacao. Ideal para services stateless, configs, caches. |
  | **Scoped** | `@RequestScope` | `AddScoped` | Uma instancia por requisicao HTTP. Util para DbContext, dados de usuario logado. |
  | **Prototype/Transient** | `@Scope("prototype")` | `AddTransient` | Nova instancia toda vez que for injetado (ver exemplo abaixo). |

  *No Spring, 99% dos beans sao singleton (services, repositories, configs). Use `@RequestScope` apenas quando precisar de dados especificos da requisicao.*

  **Entendendo Transient/Prototype:**

  ```
  SINGLETON (padrao):
  ┌─────────────────────────────────────────────────────┐
  │  Aplicacao inteira compartilha A MESMA instancia    │
  │                                                     │
  │  Controller1 ──┐                                    │
  │                ├──▶ TodoService (instancia unica)   │
  │  Controller2 ──┘                                    │
  └─────────────────────────────────────────────────────┘

  PROTOTYPE/TRANSIENT:
  ┌─────────────────────────────────────────────────────┐
  │  Cada injecao recebe uma instancia NOVA             │
  │                                                     │
  │  Controller1 ────▶ RelatorioPDF (instancia #1)      │
  │  Controller2 ────▶ RelatorioPDF (instancia #2)      │
  │  Controller1 ────▶ RelatorioPDF (instancia #3)      │
  │  (mesmo controller pedindo de novo = nova instancia)│
  └─────────────────────────────────────────────────────┘
  ```

  **Quando usar Prototype?** Raramente. Exemplos:
  - Objetos que acumulam estado interno (ex: builder de relatorio que vai agregando dados)
  - Objetos descartaveis que nao podem ser reusados
  - Quando voce precisa de uma "folha em branco" toda vez

  **Por que Singleton e o padrao?** Porque services normalmente sao stateless (nao guardam estado entre chamadas). Um `TodoService` apenas executa operacoes - ele nao "lembra" do ultimo Todo criado.
- **Injecao pelo construtor:** Lombok `@RequiredArgsConstructor` gera o construtor com os campos `final` e o Spring injeta. Ex.: `api/controller/AuthController.java` recebe `AuthService`; `domain/service/TodoService.java` recebe `TodoRepository` e `ModelMapper`.
- **Repositorios:** interfaces em `domain/repository` estendem `JpaRepository`; o Spring Data cria a implementacao e a registra, entao nao ha classe concreta nem registro manual.
- **Filtros e configs:** `security/JwtAuthenticationFilter.java` e `security/TenantFilter.java` sao `@Component` e sao injetados em `config/SecurityConfig.java`, que tambem expoe beans como `SecurityFilterChain`, `PasswordEncoder` e `AuthenticationManager` via metodos `@Bean`. `config/ModelMapperConfig.java` expoe o `ModelMapper`.
- **Propriedades:** `config/JwtConfig.java` usa `@ConfigurationProperties("security.jwt")` para virar bean populado a partir do `application.yml`; campos simples usam `@Value` (ex.: CORS em `SecurityConfig`).

```java
@SpringBootApplication            // ativa component scan em br.com.exemplo.todo
public class LinveApplication {    // nao existe um Program.cs separado
    public static void main(String[] args) {
        SpringApplication.run(LinveApplication.class, args);
    }
}

@Service
@RequiredArgsConstructor
public class TodoService {
    private final TodoRepository repository;
    private final ModelMapper modelMapper; // injetados automaticamente
}

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper(); // bean manual, equivalente a AddSingleton<ModelMapper>()
    }
}
```

#### Beans Condicionais com @ConditionalOnProperty

Um recurso poderoso do Spring e a capacidade de registrar beans **condicionalmente** baseado em configuracoes. Isso permite ter multiplas implementacoes de uma interface e o Spring escolher qual usar em tempo de execucao.

**Exemplo pratico do projeto - FileStorageService:**

Temos uma interface `FileStorageService` que define operacoes de armazenamento de arquivos:

```java
// domain/service/FileStorageService.java
public interface FileStorageService {
    StoredFile store(MultipartFile file, MediaOwnerType ownerType, Long ownerId);
    StoredFile getMetadata(UUID id);
    FileContent getContent(UUID id);
    void delete(UUID id);
}
```

E duas implementacoes dessa interface:

**1. AwsS3FileStorageService** - Implementacao real usando AWS S3:

```java
// domain/service/AwsS3FileStorageService.java
@Service
@ConditionalOnProperty(name = "storage.s3.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class AwsS3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final StorageProperties properties;
    private final StoredFileRepository storedFileRepository;

    @Override
    public StoredFile store(MultipartFile file, MediaOwnerType ownerType, Long ownerId) {
        // Implementacao real que salva no S3
        s3Client.putObject(putRequest, RequestBody.fromInputStream(...));
        return storedFileRepository.save(storedFile);
    }
    // ... outros metodos
}
```

**2. NoOpFileStorageService** - Implementacao "fake" para quando S3 esta desabilitado:

```java
// domain/service/NoOpFileStorageService.java
@Service
@ConditionalOnProperty(name = "storage.s3.enabled", havingValue = "false")
public class NoOpFileStorageService implements FileStorageService {

    @Override
    public StoredFile store(MultipartFile file, MediaOwnerType ownerType, Long ownerId) {
        log.warn("NoOpFileStorageService: store() chamado, mas armazenamento esta desabilitado.");
        throw new UnsupportedOperationException("Armazenamento de arquivos desabilitado.");
    }
    // ... outros metodos lancam excecao tambem
}
```

**Como funciona:**

| Valor de `storage.s3.enabled` | Bean registrado |
|-------------------------------|-----------------|
| `true` | `AwsS3FileStorageService` |
| `false` | `NoOpFileStorageService` |
| nao definido | `AwsS3FileStorageService` (por causa do `matchIfMissing = true`) |

**Configuracao no application.yml:**

```yaml
storage:
  s3:
    enabled: true  # ou false para desabilitar
    region: us-east-1
    bucket: linve-media
```

**Quem consome nao precisa saber qual implementacao:**

```java
@Service
@RequiredArgsConstructor
public class ProdutoService {
    // Spring injeta AwsS3FileStorageService OU NoOpFileStorageService
    // dependendo da configuracao - o codigo aqui nao muda!
    private final FileStorageService fileStorageService;

    public void salvarFotoProduto(MultipartFile foto, Long produtoId) {
        fileStorageService.store(foto, MediaOwnerType.PRODUTO, produtoId);
    }
}
```

**Comparando com ASP.NET Core:**

| Spring Boot | ASP.NET Core |
|-------------|--------------|
| `@ConditionalOnProperty` | `if (config["S3:Enabled"]) services.AddScoped<IStorage, S3Storage>()` |
| Declarativo (anotacao) | Imperativo (codigo no Program.cs) |
| Condicao na propria classe | Condicao no registro central |

No Spring, a logica de "quando usar esta implementacao" fica na propria classe, nao em um arquivo central de configuracao.

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
└── LinveApplication.java    ← PONTO DE ENTRADA (classe main)
```

O arquivo `LinveApplication.java` contém o método `main()` que inicia a aplicação Spring Boot:

```java
@SpringBootApplication
public class LinveApplication {
    public static void main(String[] args) {
        SpringApplication.run(LinveApplication.class, args);  // Inicia o servidor
    }
}
```

**Para rodar o projeto na IDE:**
1. Abra o projeto como projeto Maven
2. Localize a classe `LinveApplication.java` em `src/main/java/br/com/exemplo/todo/`
3. Clique com botão direito → Run (ou use o atalho da IDE)

    ### Banco de dados e migrations (SQLite + Flyway)

- **Sem servidor externo:** o SQLite cria o arquivo `./data/todo.db` automaticamente na primeira execucao.
- **Schema gerenciado pelo Flyway:** o Hibernate esta com `spring.jpa.hibernate.ddl-auto=none`, e o **Flyway** gerencia o schema automaticamente.
- **Migrations Flyway (automatico no startup):**
  - Scripts SQL ficam em `flyway/sql/` (ex: `V0001__criar_tabela_todo.sql`).
  - **Executam automaticamente** ao iniciar a aplicacao Spring Boot.
  - Para recomecar do zero, basta apagar o arquivo `data/todo.db` antes de rodar.
  - O Flyway cria a tabela `flyway_schema_history` para controlar quais migrations ja foram aplicadas.

#### Configuracao do Flyway (application.yml)

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: none  # Flyway gerencia o schema, nao o Hibernate
  flyway:
    enabled: true
    locations: filesystem:./flyway/sql
    baseline-on-migrate: true
    baseline-version: 0
```

#### Lista de Migrations

| Versao | Arquivo | Descricao |
|--------|---------|-----------|
| V0001 | `V0001__criar_tabela_todo.sql` | Tabela TODO |
| V0002 | `V0002__criar_tabelas_autenticacao.sql` | Tabelas de autenticacao (ACCOUNT, ORGANIZATION, MEMBERSHIP, etc) |
| V0003 | `V0003__adicionar_organizacao_todo.sql` | Adiciona ORG_ID a tabela TODO |
| V0004 | `V0004__criar_tabela_login_attempt.sql` | Tabela de tentativas de login |
| V0005 | `V0005__corrigir_account_null_values.sql` | Correcoes em ACCOUNT |
| V0006 | `V0006__criar_tabela_stored_file.sql` | Tabela de arquivos armazenados |
| V0007 | `V0007__adicionar_avatar_usuario.sql` | Campo avatar em usuario |
| V0008 | `V0008__criar_tabela_culinaria.sql` | Tabela de culinarias |
| V0009 | `V0009__criar_tabelas_categoria.sql` | Tabelas de categorias |
| V0010 | `V0010__criar_tabelas_produto_e_preco.sql` | Tabelas de produtos e precos |
| V0011 | `V0011__criar_tabelas_adicional.sql` | Tabelas de adicionais |
| V0012 | `V0012__criar_tabelas_uf_municipio.sql` | Tabelas UF e MUNICIPIO (dados abertos) |

#### Criar Nova Migration

1. Crie um arquivo em `flyway/sql/` seguindo o padrao: `V{numero}__{descricao}.sql`
   - Exemplo: `V0013__criar_tabela_pedido.sql`
2. Escreva os comandos SQL (CREATE TABLE, INSERT, etc)
3. Reinicie a aplicacao - o Flyway aplicara automaticamente

#### Executar Flyway Manualmente (opcional)

```bash
# Aplicar migrations pendentes
mvn flyway:migrate -Dflyway.url=jdbc:sqlite:file:./data/todo.db -Dflyway.locations=filesystem:./flyway/sql

# Ver status das migrations
mvn flyway:info -Dflyway.url=jdbc:sqlite:file:./data/todo.db -Dflyway.locations=filesystem:./flyway/sql
```

### Executar via Terminal

```bash
cd backend
mvn spring-boot:run
```

A aplicacao ficara disponivel em: http://localhost:8080/api

### Executar via IDE

| IDE | Como Executar |
|-----|---------------|
| **IntelliJ IDEA** | Abra `LinveApplication.java` → Clique no ícone ▶️ verde ao lado do método `main` → Run |
| **VS Code** | Abra `LinveApplication.java` → Clique em "Run" acima do método `main` (ou F5) |
| **Eclipse/STS** | Clique direito em `LinveApplication.java` → Run As → Spring Boot App (ou Java Application) |
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
java -jar target/linve-api.jar
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

### Categorias de Produtos (autenticados - requer Bearer token)

| MActodo | Endpoint | DescriA15A2o | Headers | Status |
|--------|----------|-----------|---------|--------|
| GET | /categorias | Listar categorias ativas da org (filtro opcional id_culinaria) | Authorization, X-Organization-Id | 200 |
| GET | /categorias/{id} | Buscar categoria com opcoes ativas | Authorization, X-Organization-Id | 200 / 404 |
| POST | /categorias | Criar categoria e opcoes ativas | Authorization, X-Organization-Id | 201 / 400 |
| PUT | /categorias/{id} | Atualizar categoria e sincronizar opcoes (desativa removidas) | Authorization, X-Organization-Id | 200 / 400 / 404 |
| DELETE | /categorias/{id} | Desativar categoria e opcoes (soft delete) | Authorization, X-Organization-Id | 204 / 404 |
| GET | /categorias/{id}/opcoes | Listar opcoes ativas da categoria | Authorization, X-Organization-Id | 200 / 404 |
| POST | /categorias/{id}/opcoes | Criar nova opcao ativa | Authorization, X-Organization-Id | 201 / 400 / 404 |
| PUT | /categorias/{id}/opcoes/{idOpcao} | Renomear opcao (unicidade na categoria) | Authorization, X-Organization-Id | 200 / 400 / 404 |
| DELETE | /categorias/{id}/opcoes/{idOpcao} | Desativar opcao (soft delete) | Authorization, X-Organization-Id | 204 / 404 |

**Regras de negocio (categoria/opcoes)**
- `id_culinaria` obrigatorio e deve existir em CULINARIA.
- `opcoes` precisa ter ao menos um nome (unicidade case-insensitive dentro da categoria).
- `opcao_meia` apenas `''`, `M` ou `V`.
- Horarios: `inicio` e `fim` juntos, formato `HH:mm`, e `inicio < fim`.
- `ordem` nao pode repetir dentro da mesma organizacao (unico em `CAT_ORG_ID + CAT_ORDEM`).
- Soft delete: campos `ativo` em categoria e opcoes; DELETE apenas desativa.

### Produtos e Precos (autenticados - requer Bearer token)

| Metodo | Endpoint | Descricao | Headers | Status |
|--------|----------|-----------|---------|--------|
| GET | /produtos | Lista produtos ativos (filtro opcional `id_categoria`) com precos ativos embutidos | Authorization, X-Organization-Id | 200 |
| GET | /produtos/{id} | Busca produto com precos ativos | Authorization, X-Organization-Id | 200 / 404 |
| POST | /produtos | Cria produto e precos (array `opcoes`) | Authorization, X-Organization-Id | 201 / 400 |
| PUT | /produtos/{id} | Atualiza produto e sincroniza precos (ativa/atualiza/desativa) | Authorization, X-Organization-Id | 200 / 400 / 404 |
| DELETE | /produtos/{id} | Desativa produto e todos os precos (soft delete) | Authorization, X-Organization-Id | 204 / 404 |

**Contrato (POST/PUT)**
```json
{
  "id_categoria": 90395,
  "nome": "No copo",
  "descricao": "Acai no copo",
  "opcoes": [
    { "id_opcao": 185862, "valor": 20.0 },
    { "id_opcao": 185863, "valor": 30.0 }
  ]
}
```

**Regras de negocio (produto/preco)**
- `id_categoria` obrigatorio e precisa estar ativa na organizacao.
- Cada `opcoes[].id_opcao` deve pertencer a mesma categoria; caso contrario 400 (ProdutoPrecoCategoriaInvalidaException).
- `valor` obrigatorio e > 0.
- Soft delete via campo `ativo` em produto e preco; DELETE apenas desativa.
- Triggers no banco garantem cascata de soft delete:
  - Categoria desativada -> produtos e precos relacionados sao desativados.
  - Opcao de categoria desativada -> precos que a referenciam sao desativados.
  - Valida que `PRP_CATOP_ID` pertence a categoria do produto (bloqueia inconsistencias por SQL).

### Adicionais (autenticados - requer Bearer token)

| Metodo | Endpoint | Descricao | Headers | Status |
|--------|----------|-----------|---------|--------|
| GET | /adicionais | Lista adicionais ativos (filtro opcional `id_categoria`) com itens ativos embutidos | Authorization, X-Organization-Id | 200 |
| GET | /adicionais/{id} | Busca adicional com itens ativos | Authorization, X-Organization-Id | 200 / 404 |
| POST | /adicionais | Cria adicional e itens | Authorization, X-Organization-Id | 201 / 400 |
| PUT | /adicionais/{id} | Atualiza adicional e sincroniza itens (ativa/atualiza/desativa) | Authorization, X-Organization-Id | 200 / 400 / 404 |
| DELETE | /adicionais/{id} | Desativa adicional e itens (soft delete) | Authorization, X-Organization-Id | 204 / 404 |

**Selecao (`selecao`)**
- `U` (Unico): cliente deve escolher exatamente 1 item ativo.
- `M` (Multiplo): cliente pode escolher 0..N itens; `limite` opcional (>=1).
- `Q` (Quantidade multipla): cliente pode escolher itens/quantidades com `minimo` (>=0) e `limite` (>=1 e >= minimo).

**Regras de negocio (adicionais)**
- `id_categoria` obrigatorio e categoria deve estar ativa na organizacao.
- `opcoes` obrigatorio; cada item: `nome` obrigatorio, `valor` > 0, nomes nao podem repetir (case-insensitive).
- `status` controla soft delete; DELETE apenas desativa.
- Triggers no banco:
  - Categoria desativada -> adicionais e itens relacionados sao desativados.
  - Adicional desativado -> itens relacionados sao desativados.


### Administração de Usuários (requer OWNER ou ADMIN)

| Método | Endpoint | Descrição | Headers | Status |
|--------|----------|-----------|---------|--------|
| GET | /admin/users | Listar usuários da org | Authorization, X-Organization-Id | 200 / 403 |
| GET | /admin/users?ativo=true&role=ADMIN | Filtrar usuários | Authorization, X-Organization-Id | 200 |
| POST | /admin/users | Criar novo usuário | Authorization, X-Organization-Id | 201 / 400 / 409 |
| GET | /admin/users/{id} | Buscar usuário por ID | Authorization, X-Organization-Id | 200 / 404 |
| PUT | /admin/users/{id} | Atualizar usuário | Authorization, X-Organization-Id | 200 / 400 / 404 |
| PATCH | /admin/users/{id}/ativar | Ativar usuário | Authorization, X-Organization-Id | 200 / 404 |
| PATCH | /admin/users/{id}/desativar | Desativar usuário | Authorization, X-Organization-Id | 200 / 400 / 403 |
| PATCH | /admin/users/{id}/role | Alterar papel (só OWNER) | Authorization, X-Organization-Id | 200 / 400 / 403 |
| POST | /admin/users/{id}/reset-password | Resetar senha | Authorization, X-Organization-Id | 200 / 404 |
| POST | /admin/users/{id}/unlock | Desbloquear conta | Authorization, X-Organization-Id | 200 / 404 |
| GET | /admin/users/{id}/login-history | Histórico de login | Authorization, X-Organization-Id | 200 / 404 |

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

- **Arquivo:** `data/todo.db` (criado automaticamente)
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

### Configuração (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:sqlite:file:./data/todo.db?date_class=TEXT
    driverClassName: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: update  # Hibernate gerencia o schema automaticamente

# Configuração JWT
security:
  jwt:
    secret: ${JWT_SECRET:chave-secreta-desenvolvimento-minimo-32-caracteres-segura}
    access-token:
      expiration-ms: 900000           # 15 minutos
    refresh-token:
      expiration-days: 30
  bcrypt:
    strength: 12                      # Custo do BCrypt
```

### Migrations Flyway (opcional)

As migrations Flyway estão disponíveis em `flyway/sql/` mas o Hibernate está configurado com `ddl-auto: update`, então as tabelas são criadas/ajustadas automaticamente.

Para aplicar migrations manualmente:
```bash
mvn -Dflyway.configFiles=flyway/flyway.conf flyway:migrate
```

Para recomeçar do zero, basta apagar o arquivo `data/todo.db` antes de rodar.
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

    @Autowired
    private TodoRepository todoRepository;

    private String accessToken;
    private Long organizationId;
    private HttpHeaders authHeaders;

    @BeforeEach
    void setUp() {
        // Limpa dados de testes anteriores (ordem importa por FKs)
        todoRepository.deleteAll();
        membershipRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

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

        // Configura headers de autenticacao reutilizaveis
        authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);
        authHeaders.set("X-Organization-Id", organizationId.toString());
        authHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));
    }

    @Test
    void deveCriarTodo() {
        TodoInput input = new TodoInput();
        input.setTitulo("Nova Tarefa");

        HttpEntity<TodoInput> request = new HttpEntity<>(input, authHeaders);

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
| Banco de dados | Mockado | Real (SQLite) |
| Limpeza | `TenantContext.clear()` | `@BeforeEach` com `deleteAll()` |

---

## Módulo de Administração de Usuários (User Admin)

Sistema completo de CRUD de usuários da organização com controle de acesso por roles.

### Arquitetura

```
domain/
├── exception/
│   ├── UserNotFoundException.java          # Usuário não encontrado
│   ├── CannotModifyOwnerException.java     # Não pode modificar OWNER
│   ├── CannotModifySelfException.java      # Não pode modificar a si mesmo
│   └── PasswordExpiredException.java       # Senha expirada
├── model/entity/
│   └── LoginAttempt.java                   # Registro de tentativas de login
├── repository/
│   └── LoginAttemptRepository.java         # Repository para histórico de login
└── service/
    └── UserAdminService.java               # Lógica de negócio

api/
├── controller/
│   └── UserAdminController.java            # REST endpoints
├── dto/admin/
│   ├── UserAdminOutput.java                # Dados completos do usuário
│   ├── UserAdminInput.java                 # Input para criar usuário
│   ├── UserUpdateInput.java                # Input para atualizar
│   ├── UserRoleUpdateInput.java            # Input para alterar role
│   ├── UserPasswordResetOutput.java        # Resposta com senha temporária
│   └── LoginAttemptOutput.java             # Tentativa de login
└── openapi/
    └── UserAdminControllerOpenApi.java     # Documentação Swagger
```

### Tabela LOGIN_ATTEMPT (Migration V0004)

```sql
CREATE TABLE LOGIN_ATTEMPT (
    LOGA_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    LOGA_USER_ID INTEGER NOT NULL REFERENCES USUARIO(USER_ID),
    LOGA_SUCESSO BOOLEAN NOT NULL DEFAULT FALSE,
    LOGA_IP_ADDRESS VARCHAR(45),
    LOGA_USER_AGENT VARCHAR(500),
    LOGA_MOTIVO_FALHA VARCHAR(50),  -- INVALID_PASSWORD, ACCOUNT_LOCKED, USER_INACTIVE
    LOGA_DATA_TENTATIVA TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por usuário
CREATE INDEX IDX_LOGIN_ATTEMPT_USER ON LOGIN_ATTEMPT(LOGA_USER_ID);

-- Coluna senhaExpirada em ACCOUNT
ALTER TABLE ACCOUNT ADD COLUMN ACCO_SENHA_EXPIRADA BOOLEAN DEFAULT FALSE;
```

### UserAdminService - Métodos Principais

```java
@Service
@RequiredArgsConstructor
public class UserAdminService {

    // Listar usuários com filtros e paginação
    public Page<UserAdminOutput> listarUsuarios(
        Boolean ativo, String role, String search, Pageable pageable);

    // Buscar usuário por ID (valida membership na org)
    public UserAdminOutput buscarUsuario(Long userId);

    // Criar usuário com senha temporária
    public UserPasswordResetOutput criarUsuario(UserAdminInput input);

    // Atualizar nome/email
    public UserAdminOutput atualizarUsuario(Long userId, UserUpdateInput input);

    // Ativar/desativar (soft delete)
    public UserAdminOutput ativarUsuario(Long userId);
    public UserAdminOutput desativarUsuario(Long userId);  // Valida: não pode desativar OWNER ou si mesmo

    // Alterar role (apenas OWNER pode)
    public UserAdminOutput alterarRole(Long userId, UserRoleUpdateInput input);

    // Resetar senha (gera senha temporária, marca senhaExpirada=true)
    public UserPasswordResetOutput resetarSenha(Long userId);

    // Desbloquear conta bloqueada por tentativas
    public UserAdminOutput desbloquearConta(Long userId);

    // Histórico de login (últimas 10 tentativas)
    public List<LoginAttemptOutput> listarHistoricoLogin(Long userId);
}
```

### Regras de Negócio

1. **Criação de usuário**:
   - Email deve ser único
   - Não pode criar com role OWNER
   - Gera senha temporária de 12 caracteres
   - Marca `senhaExpirada = true` (força troca no primeiro login)

2. **Desativação**:
   - Não pode desativar OWNER
   - Não pode desativar a si mesmo

3. **Alteração de role**:
   - Apenas OWNER pode alterar roles
   - Não pode promover alguém a OWNER
   - Não pode alterar próprio role
   - Não pode rebaixar/alterar OWNER

4. **Reset de senha**:
   - Gera nova senha temporária
   - Desbloqueia conta se bloqueada
   - Marca `senhaExpirada = true`

### Exceções e HTTP Status

| Exceção | Status | Quando |
|---------|--------|--------|
| `UserNotFoundException` | 404 | Usuário não existe ou não pertence à org |
| `CannotModifyOwnerException` | 403 | Tentativa de modificar OWNER |
| `CannotModifySelfException` | 400 | Tentativa de desativar/alterar a si mesmo |
| `EmailAlreadyExistsException` | 409 | Email já cadastrado |
| `PasswordExpiredException` | 403 | Login com senha expirada |

### Proteção de Endpoints

```java
@RestController
@RequestMapping("admin/users")
@PreAuthorize("@tenantSecurity.isAdmin()")  // Requer OWNER ou ADMIN
public class UserAdminController {

    @PatchMapping("/{userId}/role")
    @PreAuthorize("@tenantSecurity.isOwner()")  // Apenas OWNER
    public UserAdminOutput alterarRole(...) { }
}
```

### Testes Unitários (UserAdminServiceTest)

20 testes cobrindo:
- Buscar usuário (sucesso e não encontrado)
- Criar usuário (sucesso, email duplicado, criar OWNER)
- Atualizar usuário (sucesso, email duplicado)
- Desativar (sucesso, desativar si mesmo, desativar OWNER)
- Ativar usuário
- Alterar role (sucesso como OWNER, falha como ADMIN, definir como OWNER, alterar próprio)
- Resetar senha (sucesso, sem conta local)
- Desbloquear conta
- Histórico de login (sucesso, usuário não pertence à org)

### Exemplos de Requisições

#### Criar usuário
```bash
curl -X POST http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"nome": "João Silva", "email": "joao@empresa.com", "role": "MEMBER"}'
```

**Resposta:**
```json
{
  "userId": 5,
  "senhaTemporaria": "aB3#xY9!kL2$",
  "mensagem": "Usuário criado. Senha temporária deve ser alterada no primeiro login."
}
```

#### Listar usuários com filtros
```bash
curl "http://localhost:8080/api/admin/users?ativo=true&role=ADMIN&search=joao&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

#### Alterar role (apenas OWNER)
```bash
curl -X PATCH http://localhost:8080/api/admin/users/5/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

#### Ver histórico de login
```bash
curl http://localhost:8080/api/admin/users/5/login-history \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID"
```

**Resposta:**
```json
[
  {
    "id": 10,
    "sucesso": true,
    "ipAddress": "192.168.1.100",
    "motivoFalha": null,
    "dataTentativa": "2024-01-15T14:30:00"
  },
  {
    "id": 9,
    "sucesso": false,
    "ipAddress": "192.168.1.100",
    "motivoFalha": "INVALID_PASSWORD",
    "dataTentativa": "2024-01-15T14:29:00"
  }
]
```

---

## Comparação com o Projeto Base

| Aspecto | Linve API | Reforma Tributária |
|---------|----------|-------------------|
| Controllers | 3 (Auth + Todo + UserAdmin) | Múltiplos |
| Entities | 7 (User, Org, Todo, LoginAttempt...) | 50+ tabelas |
| Autenticação | JWT + Refresh Token | JWT + OAuth2 |
| Multi-tenancy | Por header X-Organization-Id | Complexo, múltiplas camadas |
| Complexidade | CRUD + Auth + User Admin | Cálculos tributários complexos |
| Endpoints | 22 | 50+ |
| Cache | Não implementado | 60+ caches Caffeine |
| Validações | Bean Validation + regras de negócio | Regras de negócio complexas |
| Exceções | 11 customizadas | 40+ exceções de negócio |
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

Migrations sao scripts SQL versionados que criam/alteram o banco de dados.

**Localizacao:** `src/main/resources/db/migration/`

**Nomenclatura:** `V{numero}__{descricao}.sql`
- `V` = Versioned migration
- `{numero}` = Numero sequencial (0002, 0003...)
- `__` = Dois underscores (obrigatorio)
- `{descricao}` = Descricao sem espacos

**Criar arquivo:** `src/main/resources/db/migration/V0002__criar_tabela_categoria.sql`

```sql
-- Criacao da tabela CATEGORIA
CREATE TABLE CATEGORIA (
    CATE_ID BIGSERIAL PRIMARY KEY,
    CATE_NOME VARCHAR(150) NOT NULL,
    CATE_DESCRICAO TEXT,
    CATE_COR VARCHAR(20) DEFAULT '#808080',
    CATE_ATIVO BOOLEAN DEFAULT TRUE,
    CATE_DATA_CRIACAO TIMESTAMP NOT NULL
);

-- Indice para busca por nome
CREATE INDEX IDX_CATEGORIA_NOME ON CATEGORIA(CATE_NOME);

-- Indice para filtrar ativos
CREATE INDEX IDX_CATEGORIA_ATIVO ON CATEGORIA(CATE_ATIVO);
```

**Convencao de nomes de colunas:**
- Prefixo com abreviacao da tabela (CATE_ para CATEGORIA)
- Sufixo _ID para chaves primarias
- Sufixo _DATA para datas
- Booleanos como `INTEGER` no SQLite (0 = false, 1 = true)

**Para adicionar coluna em tabela existente:**

```sql
-- V0003__adicionar_categoria_em_todo.sql
ALTER TABLE TODO ADD COLUMN TODO_CATE_ID BIGINT REFERENCES CATEGORIA(CATE_ID);

CREATE INDEX IDX_TODO_CATEGORIA ON TODO(TODO_CATE_ID);
```
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

| Java | SQLite | Anotacoes |
|------|--------|-----------|
| `Long` | INTEGER | `@Id @GeneratedValue` |
| `String` | TEXT | `@Column` |
| `Boolean` | INTEGER (0/1) | `@Column` |
| `LocalDateTime` | TEXT | `@Column` |
| `LocalDate` | TEXT | `@Column` |
| `BigDecimal` | REAL | `@Column(precision = 19, scale = 2)` |
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
    @Query(value = "SELECT * FROM CATEGORIA WHERE CATE_ATIVO = true LIMIT :limite", nativeQuery = true)
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
☐ 1. Migration SQL (src/main/resources/db/migration/V000X__*.sql)
☐ 2. Entity (domain/model/entity/*.java)
☐ 3. Repository (domain/repository/*Repository.java)
☐ 4. Exception (domain/service/exception/*Exception.java)
☐ 5. Input DTO (api/model/input/*Input.java)
☐ 6. Output DTO (api/model/output/*Output.java)
☐ 7. Service (domain/service/*Service.java)
☐ 8. OpenAPI Interface (api/openapi/*ControllerOpenApi.java)
☐ 9. Controller (api/controller/*Controller.java)
☐ 10. Registrar Exception no Handler
☐ 11. Testes Unitários (testesunitarios/*ServiceTest.java)
☐ 12. Testes de Integração (testesintegracao/*ControllerIntegracaoTest.java)
```

**Ordem recomendada de criação:**
1. Migration → 2. Entity → 3. Repository → 4. Exception → 5. DTOs → 6. Service → 7. OpenAPI → 8. Controller → 9. Handler → 10. Testes

---

## OpenAPI/Swagger para Geração de Clientes

Esta seção documenta as boas práticas para configurar as anotações OpenAPI no backend, garantindo que clientes TypeScript gerados automaticamente (usando ferramentas como `ng-openapi-gen`) tenham tipos corretos.

### Problema: responseType 'blob' em vez de 'json'

Quando o endpoint não especifica `mediaType` no `@Content`, o SpringDoc gera:

```json
"content": { "*/*": {} }
```

Isso faz com que geradores de cliente usem `responseType: 'blob'`, causando problemas na deserialização.

**Solução:** Sempre especifique `mediaType = "application/json"` no `@Content`:

```java
@ApiResponse(responseCode = "200", description = "Sucesso",
        content = @Content(mediaType = "application/json",
                           schema = @Schema(implementation = MinhaClasse.class)))
```

E adicione `produces = "application/json"` no `@PostMapping`/`@GetMapping`:

```java
@PostMapping(value = "/endpoint", produces = "application/json")
```

### Problema: Propriedades com undefined (opcionais) em excesso

Quando o schema não define `required`, o gerador marca todas propriedades como opcionais (`?` em TypeScript).

**Solução:** Use `requiredProperties` na anotação `@Schema` da classe:

```java
@Schema(description = "Dados de saida",
        requiredProperties = {"id", "nome", "email"})
public record MeuOutput(Long id, String nome, String email, String opcional) {}
```

Resultado no TypeScript gerado:

```typescript
export interface MeuOutput {
  id: number;           // obrigatório
  nome: string;         // obrigatório
  email: string;        // obrigatório
  opcional?: string;    // opcional
}
```

### Problema: Schema vazio em arrays

Para endpoints que retornam listas, use `@ArraySchema`:

```java
@ApiResponse(responseCode = "200", description = "Lista retornada",
        content = @Content(mediaType = "application/json",
                           array = @ArraySchema(schema = @Schema(implementation = TodoOutput.class))))
List<TodoOutput> listar();
```

### Exemplo Completo: Interface OpenAPI

```java
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "Entidade", description = "CRUD de entidades")
public interface EntidadeControllerOpenApi {

    @Operation(summary = "Lista todas")
    @ApiResponse(responseCode = "200", description = "Sucesso",
            content = @Content(mediaType = APPLICATION_JSON_VALUE,
                               array = @ArraySchema(schema = @Schema(implementation = EntidadeOutput.class))))
    List<EntidadeOutput> listar();

    @Operation(summary = "Busca por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                                       schema = @Schema(implementation = EntidadeOutput.class))),
            @ApiResponse(responseCode = "404", description = "Nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                                       schema = @Schema(implementation = ProblemDetail.class)))
    })
    EntidadeOutput buscar(Long id);

    @Operation(summary = "Cria nova")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                                       schema = @Schema(implementation = EntidadeOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                                       schema = @Schema(implementation = ProblemDetail.class)))
    })
    EntidadeOutput criar(EntidadeInput input);
}
```

### Exemplo Completo: DTO com requiredProperties

```java
@Schema(description = "Dados de saida da entidade",
        requiredProperties = {"id", "titulo", "dataCriacao"})
public class EntidadeOutput {

    @Schema(description = "ID unico", example = "1")
    private Long id;

    @Schema(description = "Titulo", example = "Minha Entidade")
    private String titulo;

    @Schema(description = "Descricao detalhada")
    private String descricao;  // opcional - nao esta em requiredProperties

    @Schema(description = "Data de criacao")
    private LocalDateTime dataCriacao;
}
```

### URLs de Acesso

| URL | Descricao |
|-----|-----------|
| http://localhost:8080/api-docs | OpenAPI JSON spec |
| http://localhost:8080/swagger-ui.html | Swagger UI interativo |

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

---

## Armazenamento de Arquivos com AWS S3

O backend inclui um sistema completo de armazenamento de arquivos usando **AWS S3**. O backend atua como **proxy** entre o frontend e o S3, nunca expondo URLs diretas do storage.

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITETURA DE STORAGE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐        ┌───────────────────┐        ┌──────────────┐        │
│   │ Frontend │ ─────► │   Backend (API)   │ ─────► │   AWS S3     │        │
│   │          │        │   (Proxy Layer)   │        │   (Storage)  │        │
│   └──────────┘        └───────────────────┘        └──────────────┘        │
│        │                      │                           │                │
│        │                      │                           │                │
│        │                      ▼                           │                │
│        │              ┌───────────────────┐               │                │
│        │              │     Database      │               │                │
│        │              │   (StoredFile)    │               │                │
│        │              └───────────────────┘               │                │
│        │                                                                    │
│   IMPORTANTE:                                                               │
│   - Frontend NUNCA acessa S3 diretamente                                    │
│   - URLs sempre são /api/media/{uuid} (relativas ao backend)                │
│   - Backend faz proxy/stream do conteúdo                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Por que o Backend atua como Proxy?

1. **Segurança**: Credenciais AWS nunca são expostas ao cliente
2. **Controle de Acesso**: Backend pode validar permissões antes de servir arquivos
3. **Multi-Tenancy**: Isolamento por organização no banco de dados
4. **Flexibilidade**: Abstração permite trocar provider sem alterar frontend
5. **URLs Estáveis**: `/api/media/{uuid}` funciona independente do storage

---

### Configuração AWS S3

#### Arquivo `.env` (Desenvolvimento)

Crie um arquivo `.env` na raiz do backend com suas credenciais:

```env
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=nome-do-seu-bucket
JWT_SECRET=sua-chave-jwt-segura
```

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS | `wJalr...` |
| `AWS_REGION` | Região AWS | `us-east-1` |
| `AWS_S3_BUCKET` | Nome do bucket S3 | `meu-app-media` |

> **SEGURANÇA**: O arquivo `.env` está no `.gitignore` e **nunca será commitado**. Ele contém credenciais sensíveis e deve ser criado manualmente em cada ambiente de desenvolvimento.

#### Como funciona o carregamento

O projeto usa a biblioteca `spring-dotenv` para carregar automaticamente o arquivo `.env`:

```
.env (local, NÃO commitado)
    ↓
spring-dotenv carrega como variáveis de ambiente
    ↓
application.yml lê via ${AWS_ACCESS_KEY_ID:}
    ↓
StorageConfig.java usa as credenciais
```

---

### Configuração no Spring

`application.yml`:

```yaml
storage:
  s3:
    enabled: true
    region: ${AWS_REGION:us-east-1}
    bucket: ${AWS_S3_BUCKET:linve-media}
    access-key: ${AWS_ACCESS_KEY_ID:}
    secret-key: ${AWS_SECRET_ACCESS_KEY:}
```

#### Prioridade de Credenciais

O `StorageConfig` usa a seguinte lógica:

1. **Se `access-key` e `secret-key` estiverem configurados**: usa `StaticCredentialsProvider` (recomendado para desenvolvimento)
2. **Caso contrário**: usa `DefaultCredentialsProvider` que busca em:
   - Variáveis de ambiente do sistema
   - Arquivo `~/.aws/credentials`
   - IAM Roles (EC2/ECS/Lambda)

#### Produção

Em produção, **não use arquivo `.env`**. Configure as variáveis de ambiente diretamente:

- **Docker**: variáveis no `docker-compose.yml` ou Secrets
- **Kubernetes**: ConfigMaps e Secrets
- **AWS ECS/EC2**: Task Definition ou Parameter Store
- **CI/CD**: GitHub Secrets, GitLab Variables, etc.

---

### Endpoints de Mídia

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/api/media` | POST | Sim | Upload genérico de arquivo |
| `/api/media/{id}` | GET | **Não** (público) | Download/stream do arquivo |
| `/api/media/{id}` | DELETE | Sim | Remove arquivo e metadados |

**Importante sobre autenticação:**
- **GET /api/media/{id}** é **público** (sem JWT) para que tags `<img src="...">` funcionem no browser
- **POST e DELETE** requerem autenticação + header `X-Organization-Id`

---

### Fluxo de Upload

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FLUXO DE UPLOAD                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Cliente envia POST /api/media com multipart/form-data                   │
│     Headers: Authorization: Bearer {token}, X-Organization-Id: 1            │
│                                                                             │
│  2. TenantFilter valida JWT e extrai organizationId                         │
│                                                                             │
│  3. AwsS3FileStorageService.store():                                        │
│     a) Valida arquivo (não vazio)                                           │
│     b) Gera storageKey: {orgId}/{ownerType}/{ownerId}/{uuid}-{filename}     │
│     c) Faz upload para S3 via s3Client.putObject()                          │
│     d) Salva metadados na tabela stored_file                                │
│                                                                             │
│  4. Retorna StoredFileResponse com URL relativa /api/media/{uuid}           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Fluxo de Download (Proxy Pattern)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLUXO DE DOWNLOAD (PROXY)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Browser/Frontend requisita GET /api/media/{uuid}                        │
│     (sem Authorization header - endpoint público)                           │
│                                                                             │
│  2. MediaController.download():                                             │
│     a) Busca StoredFile por UUID no banco                                   │
│     b) Não valida tenant (acesso público por UUID)                          │
│                                                                             │
│  3. AwsS3FileStorageService.getContent():                                   │
│     a) Recupera metadados (contentType, filename)                           │
│     b) Abre InputStream do S3 via s3Client.getObject()                      │
│                                                                             │
│  4. Controller faz stream para o response:                                  │
│     - Content-Type: {contentType do arquivo}                                │
│     - Content-Disposition: inline; filename="{filename}"                    │
│     - Cache-Control: public, max-age=31536000, immutable (1 ano)            │
│                                                                             │
│  SEGURANÇA:                                                                 │
│  - UUID é praticamente impossível de adivinhar (128 bits)                   │
│  - Sem listagem de arquivos (precisa saber o UUID)                          │
│  - Para arquivos sensíveis, usar endpoints autenticados específicos         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Entidade StoredFile

```java
@Entity
@Table(name = "stored_file")
public class StoredFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;                    // UUID público (usado na URL)

    @Column(nullable = false)
    private Long organizationId;        // Multi-tenancy

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaOwnerType ownerType;   // ORGANIZATION, USER, PRODUCT, OTHER

    private Long ownerId;               // ID do dono (org, user, etc)

    @Column(nullable = false)
    private String filename;            // Nome original do arquivo

    private String contentType;         // MIME type (image/png, etc)

    private Long size;                  // Tamanho em bytes

    @Column(nullable = false)
    private String storageKey;          // Caminho no S3

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Long createdBy;             // userId que fez upload
}
```

**Storage Key Format**: `{orgId}/{ownerType}/{ownerId}/{uuid}-{filename}`

Exemplo: `1/organization/1/a1b2c3d4-logo.png`

---

### Componentes Principais

| Componente | Arquivo | Propósito |
|------------|---------|-----------|
| `AwsS3FileStorageService` | domain/service/ | Implementação do storage com AWS S3 |
| `FileStorageService` | domain/service/ | Interface para abstração do storage |
| `MediaController` | api/controller/ | Endpoints REST de mídia |
| `StoredFile` | domain/model/entity/ | Entidade JPA dos metadados |
| `StoredFileRepository` | domain/repository/ | Acesso ao banco |
| `StorageProperties` | config/ | Configurações do S3 |
| `StorageConfig` | config/ | Bean do S3Client |

---

### Segurança: Público vs Autenticado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MATRIZ DE SEGURANÇA                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ENDPOINTS PÚBLICOS (sem JWT):                                              │
│  ├── GET /api/media/{id}     → Download por UUID (imagens em <img>)         │
│  └── GET /api/auth/**        → Login, registro, refresh token               │
│                                                                             │
│  ENDPOINTS AUTENTICADOS (JWT + X-Organization-Id):                          │
│  ├── POST /api/media         → Upload genérico                              │
│  ├── DELETE /api/media/{id}  → Remover arquivo                              │
│  ├── POST/DELETE /api/account/avatar    → Avatar próprio                    │
│  └── POST/DELETE /api/organizations/{id}/logo → Logo da org (OWNER/ADMIN)   │
│                                                                             │
│  VALIDAÇÃO DE ROLE:                                                         │
│  ├── Logo de organização: requer OWNER ou ADMIN na org alvo                 │
│  ├── Avatar de outro usuário (admin): requer ADMIN na org                   │
│  └── Avatar próprio: qualquer usuário autenticado                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Configuração no SecurityConfig.java:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/media/**").permitAll()  // Download público
    // ...
    .anyRequest().authenticated())
```

---

### Exemplos de Requisições

**Upload genérico:**
```bash
curl -X POST "http://localhost:8080/api/media?ownerType=ORGANIZATION&ownerId=1" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Organization-Id: 1" \
  -F "file=@./documento.pdf"
```

**Download (público, sem auth):**
```bash
curl http://localhost:8080/api/media/550e8400-e29b-41d4-a716-446655440000

# Ou simplesmente no browser/img tag:
# <img src="/api/media/550e8400-e29b-41d4-a716-446655440000" />
```

**Delete:**
```bash
curl -X DELETE http://localhost:8080/api/media/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Organization-Id: 1"
```

**Resposta de Upload:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "documento.pdf",
  "contentType": "application/pdf",
  "size": 12345,
  "ownerType": "ORGANIZATION",
  "ownerId": 1,
  "url": "/api/media/550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-29T12:34:56"
}
```

## Fotos de Organizacao e Usuario

Endpoints especializados que usam o sistema de storage para gerenciar imagens de perfil.

### Endpoints de Logo de Organização

| Endpoint | Método | Auth | Role | Descrição |
|----------|--------|------|------|-----------|
| `/api/organizations/{id}/logo` | POST | Sim | OWNER/ADMIN | Upload/substituição do logo |
| `/api/organizations/{id}/logo` | DELETE | Sim | OWNER/ADMIN | Remove o logo |

**Formatos aceitos**: PNG, JPEG, WEBP

**Comportamento importante**: O usuário pode editar o logo de **qualquer organização** onde seja OWNER ou ADMIN, mesmo que não seja a organização atual (do header `X-Organization-Id`). Isso permite que administradores de múltiplas organizações gerenciem logos sem trocar de contexto.

### Endpoints de Avatar de Usuário

| Endpoint | Método | Auth | Role | Descrição |
|----------|--------|------|------|-----------|
| `/api/account/avatar` | POST | Sim | Qualquer | Usuário atualiza seu próprio avatar |
| `/api/account/avatar` | DELETE | Sim | Qualquer | Usuário remove seu próprio avatar |
| `/api/admin/users/{userId}/avatar` | POST | Sim | ADMIN | Admin atualiza avatar de outro usuário |
| `/api/admin/users/{userId}/avatar` | DELETE | Sim | ADMIN | Admin remove avatar de outro usuário |

**Proteção especial**: ADMIN não pode alterar avatar de um OWNER.

### Exemplos de Requisições

**Upload de logo da organização:**
```bash
curl -X POST http://localhost:8080/api/organizations/1/logo \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Organization-Id: 1" \
  -F "file=@./logo.png"
```

**Upload de avatar próprio:**
```bash
curl -X POST http://localhost:8080/api/account/avatar \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Organization-Id: 1" \
  -F "file=@./meu-avatar.jpg"
```

**Remover logo:**
```bash
curl -X DELETE http://localhost:8080/api/organizations/1/logo \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Organization-Id: 1"
```

### Uso nos DTOs

As URLs de avatar/logo são retornadas automaticamente nos DTOs de resposta:

```json
// GET /api/organizations/1
{
  "id": 1,
  "nome": "Minha Empresa",
  "logo": "/api/media/550e8400-e29b-41d4-a716-446655440000"
}

// GET /api/account (ou resposta de login)
{
  "id": 10,
  "nome": "João Silva",
  "avatar": "/api/media/660e8400-e29b-41d4-a716-446655440001"
}
```

O frontend pode usar essas URLs diretamente em tags `<img>`:
```html
<img [src]="organization.logo" alt="Logo" />
<img [src]="user.avatar" alt="Avatar" />
```

## Envio de E-mails e Magic Link

O backend implementa um sistema de envio de e-mails seguindo **Arquitetura Hexagonal (Ports & Adapters)** para suportar:
- Entrega de e-mails em desenvolvimento via **MailHog** (SMTP local).
- Entrega em producao via **Mailgun** (HTTP API).
- Login via **magic link** (link de acesso enviado por e-mail).

### Porta de E-mail (Domain)

- Interface `EmailService` (`domain/service/EmailService.java`):
  ```java
  public interface EmailService {
      void send(String to, String subject, String html);
  }
  ```

Toda a aplicacao de dominio depende apenas dessa interface, sem conhecer SMTP/Mailgun.

### Adapters

**1) MailHogEmailService (default dev/testes)**

- Classe: `infrastructure/email/MailHogEmailService.java`
- Anotacao: `@Service` + `@Profile("!prod")`
- Usa `JavaMailSender` configurado em `application.yml`:
  ```yaml
  spring:
    mail:
      host: localhost
      port: 1025
      username:
      password:
      properties:
        mail:
          smtp:
            auth: false
            starttls:
              enable: false
  ```
- Remetente padrao (pode ser sobrescrito via `app.mail.from`, com default `no-reply@todo.local`).

**2) MailgunEmailService (producao)**

- Classe: `infrastructure/email/MailgunEmailService.java`
- Anotacao: `@Service` + `@Profile("prod")`
- Usa `WebClient` (bean `WebClient.Builder` em `LinveApplication`) para chamar:
  - `POST https://api.mailgun.net/v3/{domain}/messages`
- Configuracao em `application-prod.yml`:
  ```yaml
  mailgun:
    domain: ${MAILGUN_DOMAIN:seu-dominio.mailgun.org}
    api-key: ${MAILGUN_API_KEY:changeme}
    from: ${MAILGUN_FROM:no-reply@seu-dominio.com}
  ```

### Subindo o MailHog em Docker

Para subir o MailHog em Docker (servidor SMTP para desenvolvimento):

```bash
cd backend
docker compose -f docker/docker-compose.dev.yml up -d
```

Servicos:
- MailHog:
  - SMTP: `localhost:1025`
  - UI Web: `http://localhost:8025`

### Magic Link de Login

O sistema suporta login via **link enviado por e-mail**, alem de login tradicional por senha.

#### Configuracao do Magic Link

Em `application.yml`:

```yaml
auth:
  magic-link:
    base-url: http://localhost:4200/auth/magic-link
```

Essa URL aponta para a rota do frontend que recebera o token JWT do magic link. O backend gera um token JWT de curta duracao com claim `tipo = "MAGIC_LOGIN"` e o envia como query string:

```
http://localhost:4200/auth/magic-link?token=<JWT>
```

#### Endpoints de Magic Link

| Metodo | Endpoint                    | Auth | Descricao                                   |
|--------|-----------------------------|------|---------------------------------------------|
| POST   | `/api/auth/magic-link`      | Nao  | Solicita envio do magic link por e-mail     |
| POST   | `/api/auth/magic-link/confirm` | Nao  | Confirma magic link e retorna tokens JWT    |

**Importante:** Ambos os endpoints sao **publicos** e **nao revelam** se o e-mail existe ou nao no sistema (prevencao de user enumeration).

#### Fluxo Completo

1. **Usuario solicita magic link**
   - Request:
     ```http
     POST /api/auth/magic-link
     Content-Type: application/json

     {
       "email": "usuario@exemplo.com"
     }
     ```
   - Backend:
     - Busca usuario por e-mail (se nao existir, nao faz nada).
     - Gera token JWT de magic link.
     - Monta URL: `auth.magic-link.base-url?token=<JWT>`.
     - Envia e-mail HTML via `EmailService`.
   - Resposta:
     ```http
     204 No Content
     ```

2. **Usuario clica no link recebido** (no frontend)
   - Frontend extrai `token` da query string e envia para o backend:
     ```http
     POST /api/auth/magic-link/confirm
     Content-Type: application/json

     {
       "token": "<JWT_MAGIC_LINK>"
     }
     ```

3. **Backend confirma magic link**
   - Valida token JWT (`tipo = MAGIC_LOGIN`, expiracao, assinatura).
   - Busca usuario (id do `sub`).
   - Verifica se conta esta ativa / nao bloqueada.
   - Registra tentativa de login (`LoginAttempt` com motivo `MAGIC_LINK`.
   - Atualiza `ultimoAcesso`.
   - Gera `AuthResponse` normal (access token + refresh token + organizacoes).

4. **Resposta:**
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "rnd-base64...",
     "tokenType": "Bearer",
     "expiresIn": 900,
     "user": {
       "id": 1,
       "nome": "Usuario Exemplo",
       "email": "usuario@exemplo.com",
       "avatar": "/api/media/..."
     },
     "organizations": [
       {
         "organizationId": 1,
         "organizationName": "Minha Org",
         "role": "OWNER"
       }
     ],
     "senhaExpirada": false
   }
   ```

#### Uso sugerido no Frontend

- Rota `/auth/magic-link` do frontend:
  1. Ler `token` da query string.
  2. Enviar `POST /api/auth/magic-link/confirm` com `{ token }`.
  3. Receber `AuthResponse`, salvar tokens e redirecionar para dashboard.
  4. Tratar erros 401 como "link expirado ou invalido" e exibir opcao para reenviar magic link.

---

## Logging e Rotação de Logs

O sistema utiliza **Logback** (incluso no Spring Boot) para gerenciamento de logs com persistência em arquivo e rotação automática.

### Arquitetura de Logs

```
logs/
├── linve-api.log                    # Log principal (atual)
├── linve-api-error.log              # Apenas erros (atual)
├── linve-api.2024-01-15.0.log.gz    # Arquivo rotacionado (comprimido)
├── linve-api.2024-01-15.1.log.gz    # Segundo arquivo do mesmo dia
└── linve-api-error.2024-01-15.0.log.gz
```

### Configuração Padrão

| Parâmetro | Valor Padrão | Descrição |
|-----------|---------------|-------------|
| `LOG_PATH` | `./logs` | Diretório dos arquivos de log |
| `LOG_FILE` | `linve-api` | Nome base dos arquivos |
| `LOG_MAX_SIZE` | `10MB` | Tamanho máximo por arquivo antes de rotacionar |
| `LOG_MAX_HISTORY` | `30` | Dias de histórico a manter |
| `LOG_TOTAL_SIZE_CAP` | `1GB` | Tamanho total máximo de todos os arquivos |

### Appenders Configurados

1. **CONSOLE**: Logs coloridos no terminal
2. **FILE**: Arquivo principal com todos os logs (INFO+)
3. **ERROR_FILE**: Arquivo separado apenas com erros (ERROR)

### Política de Rotação

- **Por tempo**: Novo arquivo a cada dia
- **Por tamanho**: Novo arquivo quando atingir `LOG_MAX_SIZE`
- **Compressão**: Arquivos antigos são comprimidos (.gz)
- **Limpeza automática**: Remove arquivos após `LOG_MAX_HISTORY` dias ou quando `LOG_TOTAL_SIZE_CAP` for atingido

### Customizar via Variáveis de Ambiente

```bash
# Alterar diretório de logs
export LOG_PATH=/var/log/linve-api

# Aumentar tamanho máximo por arquivo
export LOG_MAX_SIZE=50MB

# Manter mais histórico
export LOG_MAX_HISTORY=90

# Aumentar tamanho total
export LOG_TOTAL_SIZE_CAP=5GB

# Executar aplicação
java -jar linve-api.jar
```

### Perfis de Log

| Perfil | Console | Arquivo | Nível |
|--------|---------|---------|-------|
| `default` | ✓ | ✓ | INFO |
| `prod` | ✓ | ✓ | INFO |
| `testes` | ✓ | ✗ | WARN |

### Níveis por Pacote

```xml
<logger name="org.springframework.web" level="INFO"/>
<logger name="org.springframework.data.jpa" level="INFO"/>
<logger name="org.hibernate.SQL" level="DEBUG"/>
<logger name="br.com.exemplo.todo" level="DEBUG"/>
```

### Usando @Slf4j nos Services

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MeuService {

    public void meuMetodo() {
        log.debug("Iniciando processamento...");
        log.info("Operacao concluida com sucesso");
        log.warn("Atencao: valor proximo do limite");
        log.error("Erro ao processar", exception);
    }
}
```

### Monitorar Logs em Tempo Real

```bash
# Ver logs em tempo real
tail -f logs/linve-api.log

# Ver apenas erros
tail -f logs/linve-api-error.log

# Filtrar por padrao
tail -f logs/linve-api.log | grep "ERROR\|WARN"
```

### Arquivo de Configuração

Localização: `src/main/resources/logback-spring.xml`

O Spring Boot detecta automaticamente este arquivo e aplica as configurações.

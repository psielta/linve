# Todo API - Spring Boot + SQLite + JWT + Multi-Tenancy

API REST de CRUD de tarefas (Todo) com **autenticacao JWT** e **multi-tenancy por organizacao**, desenvolvida como exemplo para aprendizado de Spring Boot com SQLite.

Este projeto segue a **mesma arquitetura** do projeto `Reforma\codigo-fonte-backend`, usando as mesmas versÃµes e padrÃµes.

---

## SumÃ¡rio

1. [Tecnologias](#tecnologias)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [AutenticaÃ§Ã£o JWT](#autenticaÃ§Ã£o-jwt)
4. [Multi-Tenancy](#multi-tenancy)
5. [Entendendo as Camadas](#entendendo-as-camadas)
6. [Fluxo de uma RequisiÃ§Ã£o](#fluxo-de-uma-requisiÃ§Ã£o)
7. [Conceitos Importantes](#conceitos-importantes)
8. [Como Executar](#como-executar)
9. [Endpoints da API](#endpoints-da-api)
10. [Exemplos de RequisiÃ§Ãµes](#exemplos-de-requisiÃ§Ãµes)
11. [Banco de Dados](#banco-de-dados)
12. [Testes](#testes)
13. [MÃ³dulo de AdministraÃ§Ã£o de UsuÃ¡rios](#mÃ³dulo-de-administraÃ§Ã£o-de-usuÃ¡rios-user-admin)
14. [ComparaÃ§Ã£o com o Projeto Base](#comparaÃ§Ã£o-com-o-projeto-base)
15. [Guia PrÃ¡tico: Passo a Passo](#guia-prÃ¡tico-passo-a-passo)
16. [Resumo: Checklist para Novo CRUD](#resumo-checklist-para-novo-crud)
17. [OpenAPI/Swagger para GeraÃ§Ã£o de Clientes](#openapiswagger-para-geraÃ§Ã£o-de-clientes)
18. [Frontend (Interface Web)](#frontend-interface-web)
19. [Armazenamento de Arquivos (AWS S3)](#armazenamento-de-arquivos-aws-s3)
20. [Fotos de OrganizaÃ§Ã£o e UsuÃ¡rio](#fotos-de-organizacao-e-usuario)

---

## Tecnologias

| Tecnologia | VersÃ£o | PropÃ³sito |
|------------|--------|-----------|
| Java | 21 | Linguagem de programaÃ§Ã£o |
| Spring Boot | 3.4.7 | Framework web |
| Spring Security | 6.4.x | AutenticaÃ§Ã£o e autorizaÃ§Ã£o |
| Spring Data JPA | 3.4.7 | AbstraÃ§Ã£o para acesso a dados |
| SQLite | - | Banco de dados local (arquivo) |
| Flyway | 10.x | Migrations de banco de dados |
| Hibernate Community Dialects | - | Suporte SQLite no Hibernate |
| JJWT | 0.12.6 | GeraÃ§Ã£o e validaÃ§Ã£o de tokens JWT |
| SpringDoc OpenAPI | 2.8.9 | DocumentaÃ§Ã£o da API (Swagger) |
| Lombok | - | ReduÃ§Ã£o de cÃ³digo boilerplate |
| ModelMapper | 3.2.5 | Mapeamento entre objetos |
| BCrypt | - | Hash seguro de senhas |
| JUnit 5 | - | Framework de testes |
| AssertJ | - | Assertions fluentes |
| Mockito | - | Mocks para testes |

---

## Arquitetura do Projeto

```
todo-api/
â”œâ”€â”€ pom.xml                                    # ConfiguraÃ§Ã£o Maven (dependÃªncias)
â”œâ”€â”€ flyway/sql/
â”‚   â”œâ”€â”€ V0001__criar_tabela_todo.sql           # Migration inicial (tabela TODO)
â”‚   â”œâ”€â”€ V0002__criar_tabelas_autenticacao.sql  # Tabelas de auth (USUARIO, ORGANIZATION, etc)
â”‚   â””â”€â”€ V0003__adicionar_organizacao_todo.sql  # Adiciona org_id Ã  tabela TODO
â”œâ”€â”€ data/                                      # Banco SQLite (criado automaticamente)
â”‚   â””â”€â”€ todo.db
â””â”€â”€ src/
    â”œâ”€â”€ main/
    â”‚   â”œâ”€â”€ java/br/com/exemplo/todo/         # CÃ³digo fonte (controllers, services, repos)
    â”‚   â””â”€â”€ resources/
    â”‚       â”œâ”€â”€ application.yml               # ConfiguraÃ§Ã£o principal (SQLite + JWT)
    â”‚       â””â”€â”€ application-testes.yml        # Config profile testes
    â””â”€â”€ test/java/br/com/exemplo/todo/        # Testes unitÃ¡rios/integraÃ§Ã£o
```

---

## AutenticaÃ§Ã£o JWT

### VisÃ£o Geral

O sistema usa **JWT (JSON Web Token)** para autenticaÃ§Ã£o stateless:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          FLUXO DE AUTENTICAÃ‡ÃƒO                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                             â”‚
â”‚  1. LOGIN                                                                   â”‚
â”‚     POST /auth/login { email, senha }                                       â”‚
â”‚          â”‚                                                                  â”‚
â”‚          â–¼                                                                  â”‚
â”‚     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚     â”‚ AuthService                                              â”‚            â”‚
â”‚     â”‚  - Valida credenciais                                    â”‚            â”‚
â”‚     â”‚  - Gera Access Token (15 min)                            â”‚            â”‚
â”‚     â”‚  - Gera Refresh Token (30 dias)                          â”‚            â”‚
â”‚     â”‚  - Persiste hash do refresh token                        â”‚            â”‚
â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚          â”‚                                                                  â”‚
â”‚          â–¼                                                                  â”‚
â”‚     { accessToken, refreshToken, user, organizations }                      â”‚
â”‚                                                                             â”‚
â”‚  2. REQUISIÃ‡Ã•ES AUTENTICADAS                                                â”‚
â”‚     GET /todos                                                              â”‚
â”‚     Headers:                                                                â”‚
â”‚       - Authorization: Bearer {accessToken}                                 â”‚
â”‚       - X-Organization-Id: 1                                                â”‚
â”‚          â”‚                                                                  â”‚
â”‚          â–¼                                                                  â”‚
â”‚     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚     â”‚ JwtAuthenticationFilter                                  â”‚            â”‚
â”‚     â”‚  - Extrai token do header                                â”‚            â”‚
â”‚     â”‚  - Valida assinatura e expiraÃ§Ã£o                         â”‚            â”‚
â”‚     â”‚  - Popula SecurityContext com AuthenticatedUser          â”‚            â”‚
â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚          â”‚                                                                  â”‚
â”‚          â–¼                                                                  â”‚
â”‚     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚     â”‚ TenantFilter                                             â”‚            â”‚
â”‚     â”‚  - LÃª X-Organization-Id do header                        â”‚            â”‚
â”‚     â”‚  - Valida membership do usuÃ¡rio na org                   â”‚            â”‚
â”‚     â”‚  - Popula TenantContext (ThreadLocal)                    â”‚            â”‚
â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚          â”‚                                                                  â”‚
â”‚          â–¼                                                                  â”‚
â”‚     Controller â†’ Service â†’ Repository (com isolamento por org)              â”‚
â”‚                                                                             â”‚
â”‚  3. REFRESH TOKEN                                                           â”‚
â”‚     POST /auth/refresh { refreshToken }                                     â”‚
â”‚          â”‚                                                                  â”‚
â”‚          â–¼                                                                  â”‚
â”‚     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚     â”‚ AuthService                                              â”‚            â”‚
â”‚     â”‚  - Valida refresh token (hash no banco)                  â”‚            â”‚
â”‚     â”‚  - Revoga token antigo (rotaÃ§Ã£o)                         â”‚            â”‚
â”‚     â”‚  - Gera novos tokens                                     â”‚            â”‚
â”‚     â”‚  - Detecta roubo (token jÃ¡ revogado = revoga famÃ­lia)    â”‚            â”‚
â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
  "nome": "JoÃ£o Silva"
}
```

### ConfiguraÃ§Ã£o (application.yml)

```yaml
security:
  jwt:
    secret: ${JWT_SECRET:chave-secreta-minimo-32-caracteres}
    access-token:
      expiration-ms: 900000      # 15 minutos
    refresh-token:
      expiration-days: 30        # 30 dias
  bcrypt:
    strength: 12                 # ForÃ§a do hash BCrypt
```

### Endpoints de AutenticaÃ§Ã£o

| MÃ©todo | Endpoint | DescriÃ§Ã£o | AutenticaÃ§Ã£o |
|--------|----------|-----------|--------------|
| POST | /auth/register | Registrar novo usuÃ¡rio | PÃºblica |
| POST | /auth/login | Login com email/senha | PÃºblica |
| POST | /auth/refresh | Renovar tokens | PÃºblica |
| POST | /auth/logout | Revogar refresh token | PÃºblica |

### SeguranÃ§a do Refresh Token

1. **Armazenamento seguro**: Apenas o hash SHA-256 Ã© persistido
2. **RotaÃ§Ã£o automÃ¡tica**: Cada uso gera um novo token
3. **DetecÃ§Ã£o de roubo**: Token jÃ¡ usado = revoga toda famÃ­lia
4. **Family tracking**: Tokens relacionados compartilham `familiaId`
5. **Metadados**: IP e User-Agent sÃ£o registrados

### Classes Importantes

```java
// JwtService.java - GeraÃ§Ã£o e validaÃ§Ã£o de tokens
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

// JwtAuthenticationFilter.java - Filtro de validaÃ§Ã£o
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

Multi-tenancy permite que mÃºltiplas organizaÃ§Ãµes usem a mesma aplicaÃ§Ã£o com dados isolados.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          MODELO DE MULTI-TENANCY                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                       â”‚
â”‚  â”‚   User A    â”‚                      â”‚   User B    â”‚                       â”‚
â”‚  â”‚  (JoÃ£o)     â”‚                      â”‚  (Maria)    â”‚                       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜                      â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜                       â”‚
â”‚         â”‚                                    â”‚                              â”‚
â”‚         â”‚  Membership                        â”‚  Membership                  â”‚
â”‚         â”‚  (OWNER)                           â”‚  (MEMBER)                    â”‚
â”‚         â”‚                                    â”‚                              â”‚
â”‚         â–¼                                    â–¼                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚
â”‚  â”‚                    Organization 1                            â”‚           â”‚
â”‚  â”‚                    "Empresa ABC"                             â”‚           â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                   â”‚           â”‚
â”‚  â”‚  â”‚  Todo 1  â”‚  â”‚  Todo 2  â”‚  â”‚  Todo 3  â”‚  (org_id = 1)     â”‚           â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚           â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚
â”‚                                                                             â”‚
â”‚         â”‚  Membership                                                       â”‚
â”‚         â”‚  (ADMIN)                                                          â”‚
â”‚         â–¼                                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚
â”‚  â”‚                    Organization 2                            â”‚           â”‚
â”‚  â”‚                    "Startup XYZ"                             â”‚           â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  (org_id = 2)                   â”‚           â”‚
â”‚  â”‚  â”‚  Todo 4  â”‚  â”‚  Todo 5  â”‚  â† JoÃ£o tambÃ©m acessa aqui      â”‚           â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                 â”‚           â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚
â”‚                                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Entidades do Multi-Tenancy

| Entidade | DescriÃ§Ã£o |
|----------|-----------|
| **User** | UsuÃ¡rio do sistema (pode pertencer a vÃ¡rias orgs) |
| **Organization** | OrganizaÃ§Ã£o/tenant (agrupa tarefas) |
| **Membership** | VÃ­nculo usuÃ¡rio â†” organizaÃ§Ã£o com papel |
| **Account** | Credenciais (email/senha, OAuth, etc) |
| **RefreshToken** | Tokens de refresh persistidos |

### PapÃ©is (MembershipRole)

```java
public enum MembershipRole {
    OWNER,   // Dono da organizaÃ§Ã£o (pode tudo)
    ADMIN,   // Administrador (gerencia membros)
    MEMBER   // Membro comum (apenas CRUD de tarefas)
}
```

### TenantContext (ThreadLocal)

O `TenantContext` armazena informaÃ§Ãµes da organizaÃ§Ã£o ativa para cada requisiÃ§Ã£o:

```java
// Definir contexto (feito pelo TenantFilter)
TenantContext.set(organizationId, userId, role);

// Usar no Service
Long orgId = TenantContext.getOrganizationId();
Long userId = TenantContext.getUserId();
MembershipRole role = TenantContext.getRole();

// VerificaÃ§Ãµes de permissÃ£o
TenantContext.isOwner();  // Ã‰ dono?
TenantContext.isAdmin();  // Ã‰ admin ou dono?

// IMPORTANTE: Limpar ao final (feito automaticamente pelo TenantFilter)
TenantContext.clear();
```

### Header X-Organization-Id

O cliente deve enviar o header `X-Organization-Id` para especificar qual organizaÃ§Ã£o acessar:

```bash
curl -H "Authorization: Bearer {token}" \
     -H "X-Organization-Id: 1" \
     http://localhost:8080/api/todos
```

**Comportamento:**
- Se nÃ£o enviar: usa a primeira organizaÃ§Ã£o do usuÃ¡rio
- Se enviar ID invÃ¡lido: retorna 400 Bad Request
- Se nÃ£o tiver membership: retorna 403 Forbidden

### Isolamento de Dados

Os repositÃ³rios filtram por `organizationId`:

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

// Verificar papel especÃ­fico
@PreAuthorize("@tenantSecurity.isAdmin()")
public void deletarMembro(Long membroId) { ... }

// Verificar se Ã© o prÃ³prio usuÃ¡rio
@PreAuthorize("@tenantSecurity.isCurrentUser(#userId)")
public void alterarPerfil(Long userId) { ... }
```

---

## Entendendo as Camadas

### 1. Camada API (ApresentaÃ§Ã£o)

ResponsÃ¡vel por receber requisiÃ§Ãµes HTTP e retornar respostas.

#### Controller (`TodoController.java`)
```java
@RestController          // Define que Ã© um controller REST
@RequestMapping("todos") // Base path: /api/todos
public class TodoController {

    @GetMapping          // GET /api/todos
    public List<TodoOutput> listar() { ... }

    @PostMapping         // POST /api/todos
    @ResponseStatus(HttpStatus.CREATED)  // Retorna 201
    public TodoOutput criar(@RequestBody @Valid TodoInput input) { ... }
}
```

**AnotaÃ§Ãµes importantes:**
- `@RestController` = `@Controller` + `@ResponseBody` (retorna JSON automaticamente)
- `@RequestMapping` = Define o path base do controller
- `@GetMapping`, `@PostMapping`, etc = Mapeia mÃ©todos HTTP
- `@PathVariable` = Captura variÃ¡vel da URL (`/todos/{id}`)
- `@RequestParam` = Captura query parameter (`?concluido=true`)
- `@RequestBody` = Converte JSON do body para objeto Java
- `@Valid` = Ativa validaÃ§Ã£o do Bean Validation

#### DTOs (Data Transfer Objects)
Objetos para transferir dados entre camadas. Separam a API da entidade do banco.

**Input DTO** - O que a API recebe:
```java
public class TodoInput {
    @NotBlank(message = "TÃ­tulo Ã© obrigatÃ³rio")  // ValidaÃ§Ã£o
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
- Entidade pode ter campos que nÃ£o devem ser expostos
- ValidaÃ§Ãµes ficam no Input, nÃ£o na Entity
- Permite evoluir API e banco independentemente

#### Exception Handler (`ApiExceptionHandler.java`)
Captura exceÃ§Ãµes e converte para respostas HTTP padronizadas.

```java
@RestControllerAdvice  // Intercepta exceÃ§Ãµes de TODOS os controllers automaticamente
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(TodoNaoEncontradoException.class)  // Captura esta exceÃ§Ã£o especÃ­fica
    public ResponseEntity<Object> handleTodoNaoEncontrado(...) {
        // Retorna HTTP 404 com ProblemDetail (RFC 7807)
    }
}
```

**Como funciona a conexÃ£o Controller â†” Exception Handler:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  O SPRING FAZ TUDO AUTOMATICAMENTE - NÃƒO PRECISA "LIGAR" NADA!              â”‚
â”‚                                                                             â”‚
â”‚  1. @RestControllerAdvice Ã© um interceptador GLOBAL                         â”‚
â”‚     â†’ Spring detecta automaticamente na inicializaÃ§Ã£o                       â”‚
â”‚     â†’ Aplica-se a TODOS os @RestController da aplicaÃ§Ã£o                     â”‚
â”‚                                                                             â”‚
â”‚  2. @ExceptionHandler define QUAL exceÃ§Ã£o esse mÃ©todo trata                 â”‚
â”‚     â†’ Quando qualquer Controller lanÃ§ar essa exceÃ§Ã£o                        â”‚
â”‚     â†’ O Spring redireciona automaticamente para este mÃ©todo                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Fluxo de uma exceÃ§Ã£o:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  TodoController  â”‚     â”‚   TodoService    â”‚     â”‚   ApiExceptionHandler    â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚                          â”‚
â”‚  GET /todos/999  â”‚â”€â”€â”€â”€â–¶â”‚  buscarPorId(999)â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚        â”‚         â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚        â–¼         â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚  repository      â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚  .findById(999)  â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚        â”‚         â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚        â–¼         â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚  Optional.empty()â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚        â”‚         â”‚     â”‚                          â”‚
â”‚                  â”‚     â”‚        â–¼         â”‚     â”‚                          â”‚
â”‚                  â”‚â—€â”€ â”€ â”‚  throw new       â”‚     â”‚                          â”‚
â”‚                  â”‚  â”€ â”€â”‚  TodoNaoEncon-   â”‚â”€ â”€ â”€â”‚â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”         â”‚
â”‚                  â”‚     â”‚  tradoException()â”‚     â”‚                â–¼         â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚  @ExceptionHandler(      â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚    TodoNaoEncontrado-    â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚    Exception.class)      â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚         â”‚                â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚         â–¼                â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚  Cria ProblemDetail      â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚  com status 404          â”‚
â”‚                  â”‚     â”‚                  â”‚     â”‚         â”‚                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                            â–¼
                                               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                               â”‚     HTTP Response        â”‚
                                               â”‚     Status: 404          â”‚
                                               â”‚     Body: ProblemDetail  â”‚
                                               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Exemplo prÃ¡tico - Controller NÃƒO trata exceÃ§Ã£o, apenas lanÃ§a:**

```java
// TodoController.java - NÃƒO precisa try/catch!
@GetMapping("/{id}")
public TodoOutput buscar(@PathVariable Long id) {
    // Se nÃ£o encontrar, o Service lanÃ§a TodoNaoEncontradoException
    // O Spring intercepta e redireciona para o ApiExceptionHandler
    Todo todo = todoService.buscarPorId(id);  // Pode lanÃ§ar exceÃ§Ã£o!
    return toOutput(todo);
}

// TodoService.java - LanÃ§a a exceÃ§Ã£o
public Todo buscarPorId(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new TodoNaoEncontradoException(id));  // LANÃ‡A!
}

// ApiExceptionHandler.java - CAPTURA automaticamente
@ExceptionHandler(TodoNaoEncontradoException.class)  // Escuta esta exceÃ§Ã£o
public ResponseEntity<Object> handleTodoNaoEncontradoException(
        TodoNaoEncontradoException ex, WebRequest request) {

    HttpStatus status = HttpStatus.NOT_FOUND;  // Define o status HTTP
    ProblemDetail problemDetail = createProblem(ex, status);

    return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
}
```

**Hierarquia de captura de exceÃ§Ãµes:**

```java
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    // 1. ESPECÃFICA: Captura apenas TodoNaoEncontradoException
    @ExceptionHandler(TodoNaoEncontradoException.class)
    public ResponseEntity<Object> handleTodoNaoEncontrado(...) {
        return ... // 404 Not Found
    }

    // 2. ESPECÃFICA: Captura apenas CategoriaNaoEncontradaException
    @ExceptionHandler(CategoriaNaoEncontradaException.class)
    public ResponseEntity<Object> handleCategoriaNaoEncontrada(...) {
        return ... // 404 Not Found
    }

    // 3. GENÃ‰RICA: Captura qualquer Exception nÃ£o tratada acima
    //    (funciona como "catch all" - fallback de seguranÃ§a)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(...) {
        return ... // 500 Internal Server Error
    }
}
```

**Ordem de prioridade:** O Spring escolhe o handler mais especÃ­fico.
Se lanÃ§ar `TodoNaoEncontradoException`, vai para o handler especÃ­fico (404).
Se lanÃ§ar `NullPointerException`, vai para o handler genÃ©rico (500).

**AnotaÃ§Ãµes importantes:**

| AnotaÃ§Ã£o | O que faz |
|----------|-----------|
| `@RestControllerAdvice` | Marca a classe como interceptador global de exceÃ§Ãµes para todos os `@RestController` |
| `@ExceptionHandler(Tipo.class)` | Define qual tipo de exceÃ§Ã£o este mÃ©todo trata |
| `ResponseEntityExceptionHandler` | Classe base do Spring que jÃ¡ trata exceÃ§Ãµes comuns (validaÃ§Ã£o, parsing, etc.) |

**Por que estender `ResponseEntityExceptionHandler`?**

Essa classe base jÃ¡ trata automaticamente vÃ¡rias exceÃ§Ãµes do Spring:
- `MethodArgumentNotValidException` â†’ Erros de validaÃ§Ã£o (`@Valid`)
- `HttpMessageNotReadableException` â†’ JSON malformado
- `HttpRequestMethodNotSupportedException` â†’ MÃ©todo HTTP errado (POST em endpoint GET)
- `MissingServletRequestParameterException` â†’ ParÃ¢metro obrigatÃ³rio ausente
- E muitas outras...

VocÃª pode sobrescrever esses mÃ©todos para customizar a resposta.

**PadrÃ£o ProblemDetail (RFC 7807):**
```json
{
    "type": "/api/errors/todo-nao-encontrado",
    "title": "Tarefa nÃ£o encontrada",
    "status": 404,
    "detail": "Tarefa com ID 999 nÃ£o encontrada",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Camada Domain (NegÃ³cio)

ContÃ©m a lÃ³gica de negÃ³cio, independente de frameworks.

#### Entity (`Todo.java`)
Representa uma tabela no banco de dados.

```java
@Entity                      // Marca como entidade JPA
@Table(name = "TODO")        // Nome da tabela
public class Todo {

    @Id                      // Chave primÃ¡ria
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    @Column(name = "TODO_ID")
    private Long id;

    @NotNull                 // ValidaÃ§Ã£o JPA
    @Column(name = "TODO_TITULO", nullable = false)
    private String titulo;

    @Column(name = "TODO_DESCRICAO")
    private String descricao;
}
```

**AnotaÃ§Ãµes Lombok usadas:**
- `@Data` = Gera getters, setters, equals, hashCode, toString
- `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` = Usa apenas campos marcados

#### Repository (`TodoRepository.java`)
Interface para acesso ao banco. Spring Data JPA implementa automaticamente.

```java
@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // Spring Data JPA cria a query automaticamente pelo nome do mÃ©todo!
    List<Todo> findByConcluidoOrderByDataCriacaoDesc(Boolean concluido);

    // Equivalente a:
    // SELECT * FROM TODO WHERE TODO_CONCLUIDO = ? ORDER BY TODO_DATA_CRIACAO DESC
}
```

**MÃ©todos herdados de JpaRepository:**
- `save(entity)` - Salva ou atualiza
- `findById(id)` - Busca por ID (retorna Optional)
- `findAll()` - Busca todos
- `delete(entity)` - Exclui
- `deleteById(id)` - Exclui por ID

#### Service (`TodoService.java`)
ContÃ©m a lÃ³gica de negÃ³cio. Orquestra operaÃ§Ãµes.

```java
@Service                     // Marca como bean de serviÃ§o
@RequiredArgsConstructor     // Lombok: cria construtor com campos final
public class TodoService {

    private final TodoRepository repository;  // InjeÃ§Ã£o de dependÃªncia
    private final ModelMapper modelMapper;

    @Transactional           // OperaÃ§Ã£o em transaÃ§Ã£o (commit/rollback automÃ¡tico)
    public Todo criar(TodoInput input) {
        Todo todo = modelMapper.map(input, Todo.class);  // Converte DTO â†’ Entity
        todo.setDataCriacao(LocalDateTime.now());
        todo.setConcluido(false);
        return repository.save(todo);  // Persiste no banco
    }

    public Todo buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new TodoNaoEncontradoException(id));  // LanÃ§a exceÃ§Ã£o se nÃ£o encontrar
    }
}
```

---

### 3. Camada Config

ConfiguraÃ§Ãµes do Spring (beans, interceptors, etc).

```java
@Configuration  // Marca como classe de configuraÃ§Ã£o
public class ModelMapperConfig {

    @Bean  // Registra como bean do Spring (disponÃ­vel para injeÃ§Ã£o)
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
```

---

## Fluxo de uma RequisiÃ§Ã£o

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           POST /api/todos                                   â”‚
â”‚                    {"titulo": "Comprar pÃ£o", "descricao": "..."}            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚
                                      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  1. CONTROLLER (TodoController)                                             â”‚
â”‚     - Recebe a requisiÃ§Ã£o HTTP                                              â”‚
â”‚     - @Valid valida o TodoInput (Bean Validation)                           â”‚
â”‚     - Se invÃ¡lido â†’ ApiExceptionHandler retorna 400                         â”‚
â”‚     - Se vÃ¡lido â†’ chama todoService.criar(input)                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚
                                      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  2. SERVICE (TodoService)                                                   â”‚
â”‚     - Aplica lÃ³gica de negÃ³cio                                              â”‚
â”‚     - Converte TodoInput â†’ Todo (ModelMapper)                               â”‚
â”‚     - Define dataCriacao = agora                                            â”‚
â”‚     - Define concluido = false                                              â”‚
â”‚     - Chama repository.save(todo)                                           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚
                                      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  3. REPOSITORY (TodoRepository)                                             â”‚
â”‚     - Spring Data JPA gera o SQL automaticamente                            â”‚
â”‚     - INSERT INTO TODO (TODO_TITULO, ...) VALUES (?, ...)                   â”‚
â”‚     - Retorna entidade com ID preenchido                                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚
                                      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  4. CONTROLLER (volta)                                                      â”‚
â”‚     - Recebe Todo do Service                                                â”‚
â”‚     - Converte Todo â†’ TodoOutput (ModelMapper)                              â”‚
â”‚     - Retorna ResponseEntity com status 201 (CREATED)                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚
                                      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         HTTP 201 Created                                    â”‚
â”‚  {"id": 1, "titulo": "Comprar pÃ£o", "concluido": false, ...}               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Conceitos Importantes

### Injecao de Dependencia (como o Spring faz)

> Vindo de ASP.NET Core? Pense que o `Program.cs` (onde voce chama `AddScoped`/`AddTransient`) aqui e substituido pelo **component scan** do Spring.

- **Quem registra os beans:** `TodoApplication.java` usa `@SpringBootApplication`, que habilita `@ComponentScan` no pacote base `br.com.exemplo.todo`. Qualquer classe abaixo dele anotada com `@Component`, `@Service`, `@Repository`, `@RestController` ou `@Configuration` vira bean automaticamente.
- **Ciclo de vida:** por padrao os beans sao `singleton` (similar a `AddSingleton`). Para um bean por requisicao existe `@RequestScope` (equivalente a `AddScoped`). Nada aqui usa escopo `prototype`/`transient`.
- **Injecao pelo construtor:** Lombok `@RequiredArgsConstructor` gera o construtor com os campos `final` e o Spring injeta. Ex.: `api/controller/AuthController.java` recebe `AuthService`; `domain/service/TodoService.java` recebe `TodoRepository` e `ModelMapper`.
- **Repositorios:** interfaces em `domain/repository` estendem `JpaRepository`; o Spring Data cria a implementacao e a registra, entao nao ha classe concreta nem registro manual.
- **Filtros e configs:** `security/JwtAuthenticationFilter.java` e `security/TenantFilter.java` sao `@Component` e sao injetados em `config/SecurityConfig.java`, que tambem expoe beans como `SecurityFilterChain`, `PasswordEncoder` e `AuthenticationManager` via metodos `@Bean`. `config/ModelMapperConfig.java` expoe o `ModelMapper`.
- **Propriedades:** `config/JwtConfig.java` usa `@ConfigurationProperties("security.jwt")` para virar bean populado a partir do `application.yml`; campos simples usam `@Value` (ex.: CORS em `SecurityConfig`).

```java
@SpringBootApplication            // ativa component scan em br.com.exemplo.todo
public class TodoApplication {    // nao existe um Program.cs separado
    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
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

### Bean Validation (Jakarta Validation)

ValidaÃ§Ãµes declarativas via anotaÃ§Ãµes.

```java
public class TodoInput {
    @NotBlank(message = "TÃ­tulo Ã© obrigatÃ³rio")
    @Size(min = 1, max = 200, message = "TÃ­tulo deve ter entre 1 e 200 caracteres")
    private String titulo;
}
```

**AnotaÃ§Ãµes comuns:**
| AnotaÃ§Ã£o | DescriÃ§Ã£o |
|----------|-----------|
| `@NotNull` | NÃ£o pode ser null |
| `@NotBlank` | NÃ£o pode ser null, vazio ou sÃ³ espaÃ§os |
| `@NotEmpty` | NÃ£o pode ser null ou vazio |
| `@Size(min, max)` | Tamanho da string ou coleÃ§Ã£o |
| `@Min`, `@Max` | Valor mÃ­nimo/mÃ¡ximo para nÃºmeros |
| `@Email` | Formato de email vÃ¡lido |
| `@Pattern(regexp)` | Deve casar com regex |

### TransaÃ§Ãµes (@Transactional)

Garante que operaÃ§Ãµes no banco sejam atÃ´micas.

```java
@Transactional  // Se der erro, faz rollback de tudo
public Todo criar(TodoInput input) {
    // OperaÃ§Ã£o 1: salva todo
    // OperaÃ§Ã£o 2: salva log (exemplo)
    // Se operaÃ§Ã£o 2 falhar, operaÃ§Ã£o 1 tambÃ©m Ã© desfeita
}
```

### Optional

Evita NullPointerException. ForÃ§a tratamento de ausÃªncia de valor.

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

### PrÃ©-requisitos
- Java 21+
- Maven 3.9+

### IDEs Recomendadas

| IDE | DescriÃ§Ã£o | Plugins Recomendados |
|-----|-----------|---------------------|
| **IntelliJ IDEA** | IDE mais popular para Java. VersÃ£o Community (gratuita) ou Ultimate | Lombok (geralmente jÃ¡ vem instalado) |
| **VS Code** | Editor leve com suporte a Java | Extension Pack for Java, Spring Boot Extension Pack, Lombok Annotations Support |
| **Eclipse** | IDE tradicional para Java | Spring Tools Suite (STS), Lombok |
| **NetBeans** | IDE gratuita da Apache | Suporte a Maven jÃ¡ integrado |

**Nota:** Todas as IDEs precisam do plugin **Lombok** para que o cÃ³digo compile corretamente (getters, setters, construtores sÃ£o gerados automaticamente).

### Estrutura do Projeto e Ponto de Entrada

```
src/main/java/br/com/exemplo/todo/
â””â”€â”€ TodoApplication.java    â† PONTO DE ENTRADA (classe main)
```

O arquivo `TodoApplication.java` contÃ©m o mÃ©todo `main()` que inicia a aplicaÃ§Ã£o Spring Boot:

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
3. Clique com botÃ£o direito â†’ Run (ou use o atalho da IDE)

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
| **IntelliJ IDEA** | Abra `TodoApplication.java` â†’ Clique no Ã­cone â–¶ï¸ verde ao lado do mÃ©todo `main` â†’ Run |
| **VS Code** | Abra `TodoApplication.java` â†’ Clique em "Run" acima do mÃ©todo `main` (ou F5) |
| **Eclipse/STS** | Clique direito em `TodoApplication.java` â†’ Run As â†’ Spring Boot App (ou Java Application) |
| **NetBeans** | Clique direito no projeto â†’ Run (ou F6) |

### Swagger UI

Acesse a documentaÃ§Ã£o interativa da API:
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

### AutenticaÃ§Ã£o (pÃºblicos)

| MÃ©todo | Endpoint | DescriÃ§Ã£o | Status |
|--------|----------|-----------|--------|
| POST | /auth/register | Registrar novo usuÃ¡rio | 201 / 400 / 409 |
| POST | /auth/login | Login com email/senha | 200 / 401 / 423 |
| POST | /auth/refresh | Renovar tokens | 200 / 401 |
| POST | /auth/logout | Revogar refresh token | 204 |

### Tarefas (autenticados - requer Bearer token)

| MÃ©todo | Endpoint | DescriÃ§Ã£o | Headers | Status |
|--------|----------|-----------|---------|--------|
| GET | /todos | Listar tarefas da org | Authorization, X-Organization-Id | 200 / 403 |
| GET | /todos?concluido=true | Filtrar por status | Authorization, X-Organization-Id | 200 |
| GET | /todos/{id} | Buscar tarefa por ID | Authorization, X-Organization-Id | 200 / 404 |
| POST | /todos | Criar nova tarefa | Authorization, X-Organization-Id | 201 / 400 |
| PUT | /todos/{id} | Atualizar tarefa | Authorization, X-Organization-Id | 200 / 400 / 404 |
| DELETE | /todos/{id} | Excluir tarefa | Authorization, X-Organization-Id | 204 / 404 |
| PATCH | /todos/{id}/concluir | Marcar como concluÃ­da | Authorization, X-Organization-Id | 200 / 404 |
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


### AdministraÃ§Ã£o de UsuÃ¡rios (requer OWNER ou ADMIN)

| MÃ©todo | Endpoint | DescriÃ§Ã£o | Headers | Status |
|--------|----------|-----------|---------|--------|
| GET | /admin/users | Listar usuÃ¡rios da org | Authorization, X-Organization-Id | 200 / 403 |
| GET | /admin/users?ativo=true&role=ADMIN | Filtrar usuÃ¡rios | Authorization, X-Organization-Id | 200 |
| POST | /admin/users | Criar novo usuÃ¡rio | Authorization, X-Organization-Id | 201 / 400 / 409 |
| GET | /admin/users/{id} | Buscar usuÃ¡rio por ID | Authorization, X-Organization-Id | 200 / 404 |
| PUT | /admin/users/{id} | Atualizar usuÃ¡rio | Authorization, X-Organization-Id | 200 / 400 / 404 |
| PATCH | /admin/users/{id}/ativar | Ativar usuÃ¡rio | Authorization, X-Organization-Id | 200 / 404 |
| PATCH | /admin/users/{id}/desativar | Desativar usuÃ¡rio | Authorization, X-Organization-Id | 200 / 400 / 403 |
| PATCH | /admin/users/{id}/role | Alterar papel (sÃ³ OWNER) | Authorization, X-Organization-Id | 200 / 400 / 403 |
| POST | /admin/users/{id}/reset-password | Resetar senha | Authorization, X-Organization-Id | 200 / 404 |
| POST | /admin/users/{id}/unlock | Desbloquear conta | Authorization, X-Organization-Id | 200 / 404 |
| GET | /admin/users/{id}/login-history | HistÃ³rico de login | Authorization, X-Organization-Id | 200 / 404 |

---

## Exemplos de RequisiÃ§Ãµes

> **Nota:** Todos os exemplos usam variÃ¡veis de ambiente para facilitar os testes.
> Configure `TOKEN` apÃ³s login/registro e `ORG_ID` com sua organizaÃ§Ã£o.

### 1. AutenticaÃ§Ã£o

#### Registrar novo usuÃ¡rio
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "JoÃ£o Silva",
    "email": "joao@exemplo.com",
    "senha": "minhasenha123",
    "nomeOrganizacao": "Empresa do JoÃ£o"
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
    "nome": "JoÃ£o Silva",
    "email": "joao@exemplo.com"
  },
  "memberships": [
    {
      "organizationId": 1,
      "organizationName": "Empresa do JoÃ£o",
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

**Salvar token para usar nos prÃ³ximos comandos:**
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

### 2. OperaÃ§Ãµes de Tarefas (Requerem AutenticaÃ§Ã£o)

#### Criar tarefa
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -d '{"titulo": "Comprar pÃ£o", "descricao": "Ir Ã  padaria do JoÃ£o"}'
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "titulo": "Comprar pÃ£o",
  "descricao": "Ir Ã  padaria do JoÃ£o",
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

#### Listar tarefas concluÃ­das
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
  -d '{"titulo": "Comprar pÃ£o integral", "descricao": "Na padaria do centro"}'
```

#### Marcar como concluÃ­da
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

#### Credenciais invÃ¡lidas (401 Unauthorized)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@exemplo.com", "senha": "senhaerrada"}'
```

**Resposta:**
```json
{
  "type": "/api/errors/credenciais-invalidas",
  "title": "Credenciais invÃ¡lidas.",
  "status": 401,
  "detail": "Email ou senha incorretos"
}
```

#### Email jÃ¡ cadastrado (409 Conflict)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome": "JoÃ£o", "email": "joao@exemplo.com", "senha": "123456"}'
```

**Resposta:**
```json
{
  "type": "/api/errors/email-ja-existe",
  "title": "Email jÃ¡ cadastrado.",
  "status": 409,
  "detail": "O email joao@exemplo.com jÃ¡ estÃ¡ cadastrado no sistema"
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

#### ValidaÃ§Ã£o de campos (400 Bad Request)
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -d '{"titulo": "", "descricao": "Sem tÃ­tulo"}'
```

**Resposta:**
```json
{
  "type": "/api/errors/campo-invalido",
  "title": "Campos invÃ¡lidos.",
  "status": 400,
  "detail": "Um ou mais campos sÃ£o invÃ¡lidos - [titulo: TÃ­tulo Ã© obrigatÃ³rio]"
}
```

---

### 4. Script Completo de Teste

```bash
#!/bin/bash
# Script para testar a API completa

BASE_URL="http://localhost:8080/api"

echo "=== 1. Registrando usuÃ¡rio ==="
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

echo -e "\n=== 4. Marcando como concluÃ­da ==="
curl -s -X PATCH "$BASE_URL/todos/1/concluir" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" | jq

echo -e "\n=== Teste completo! ==="
```

---

## Banco de Dados

### SQLite

O SQLite Ã© um banco de dados em arquivo. NÃ£o precisa de servidor separado.

- **Arquivo:** `data/todo.db` (criado automaticamente)
- **Driver:** `org.sqlite.JDBC`
- **Dialect:** `org.hibernate.community.dialect.SQLiteDialect`

### Modelo de Dados (ER)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                              MODELO DE DADOS                                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                                  â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚   â”‚   USUARIO    â”‚           â”‚    MEMBERSHIP    â”‚           â”‚ ORGANIZATION â”‚   â”‚
â”‚   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤           â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤           â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”‚
â”‚   â”‚ USR_ID (PK)  â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€<â”‚ MBS_USR_ID (FK)  â”‚>â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚ ORG_ID (PK)  â”‚   â”‚
â”‚   â”‚ USR_NOME     â”‚           â”‚ MBS_ORG_ID (FK)  â”‚           â”‚ ORG_NOME     â”‚   â”‚
â”‚   â”‚ USR_EMAIL    â”‚           â”‚ MBS_PAPEL        â”‚           â”‚ ORG_SLUG     â”‚   â”‚
â”‚   â”‚ USR_ATIVO    â”‚           â”‚ MBS_ATIVO        â”‚           â”‚ ORG_ATIVA    â”‚   â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚          â”‚                                                          â”‚           â”‚
â”‚          â”‚ 1:N                                                      â”‚ 1:N       â”‚
â”‚          â–¼                                                          â–¼           â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚   â”‚   ACCOUNT    â”‚                                           â”‚     TODO     â”‚   â”‚
â”‚   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                                           â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”‚
â”‚   â”‚ ACC_ID (PK)  â”‚                                           â”‚ TODO_ID (PK) â”‚   â”‚
â”‚   â”‚ ACC_USR_ID   â”‚                                           â”‚ TODO_ORG_ID  â”‚   â”‚
â”‚   â”‚ ACC_PROVIDER â”‚                                           â”‚ TODO_TITULO  â”‚   â”‚
â”‚   â”‚ ACC_SENHA    â”‚                                           â”‚ TODO_DESCR   â”‚   â”‚
â”‚   â”‚ ACC_BLOQUEADOâ”‚                                           â”‚ TODO_CONCL   â”‚   â”‚
â”‚   â”‚ ACC_TENTATIVASâ”‚                                          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                              â”‚
â”‚          â”‚                                                                       â”‚
â”‚          â”‚ 1:N                                                                   â”‚
â”‚          â–¼                                                                       â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                                          â”‚
â”‚   â”‚  REFRESH_TOKEN   â”‚                                                          â”‚
â”‚   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                                                          â”‚
â”‚   â”‚ RTK_ID (PK)      â”‚                                                          â”‚
â”‚   â”‚ RTK_USR_ID (FK)  â”‚                                                          â”‚
â”‚   â”‚ RTK_TOKEN_HASH   â”‚                                                          â”‚
â”‚   â”‚ RTK_FAMILIA_ID   â”‚   â—„â”€â”€ Agrupa tokens para rotaÃ§Ã£o                         â”‚
â”‚   â”‚ RTK_REVOGADO     â”‚                                                          â”‚
â”‚   â”‚ RTK_DATA_EXPIRACAOâ”‚                                                         â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                          â”‚
â”‚                                                                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### ConfiguraÃ§Ã£o (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:sqlite:file:./data/todo.db?date_class=TEXT
    driverClassName: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: update  # Hibernate gerencia o schema automaticamente

# ConfiguraÃ§Ã£o JWT
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

As migrations Flyway estÃ£o disponÃ­veis em `flyway/sql/` mas o Hibernate estÃ¡ configurado com `ddl-auto: update`, entÃ£o as tabelas sÃ£o criadas/ajustadas automaticamente.

Para aplicar migrations manualmente:
```bash
mvn -Dflyway.configFiles=flyway/flyway.conf flyway:migrate
```

Para recomeÃ§ar do zero, basta apagar o arquivo `data/todo.db` antes de rodar.
## Testes

### Estrutura de Testes

```
src/test/java/br/com/exemplo/todo/
â”œâ”€â”€ testesunitarios/           # Testes isolados (com mocks)
â”‚   â””â”€â”€ TodoServiceTest.java
â””â”€â”€ testesintegracao/          # Testes end-to-end (com banco real + auth)
    â””â”€â”€ TodoControllerIntegracaoTest.java
```

### Executar Testes

```bash
# Todos os testes
mvn test

# Apenas testes unitÃ¡rios
mvn test -Dtest="**/testesunitarios/**"

# Apenas testes de integraÃ§Ã£o
mvn test -Dtest="**/testesintegracao/**"
```

### Testes UnitÃ¡rios (com TenantContext)

Testam uma classe isolada, usando mocks para dependÃªncias.
**Importante:** Ã‰ necessÃ¡rio configurar o `TenantContext` nos testes para simular o multi-tenancy.

```java
@ExtendWith(MockitoExtension.class)  // Ativa Mockito
class TodoServiceTest {

    @Mock  // Cria mock do repositÃ³rio
    private TodoRepository repository;

    @InjectMocks  // Injeta mocks no service
    private TodoService service;

    @BeforeEach
    void setUp() {
        // Configura o TenantContext para simular um usuÃ¡rio autenticado
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
        // IMPORTANTE: Limpar o ThreadLocal apÃ³s cada teste
        TenantContext.clear();
    }

    @Test
    void deveCriarTodoComSucesso() {
        // Configura comportamento do mock
        when(repository.save(any())).thenReturn(todo);

        // Executa
        Todo resultado = service.criar(input);

        // Verifica
        assertThat(resultado.getTitulo()).isEqualTo("Comprar pÃ£o");
        assertThat(resultado.getOrganization().getId()).isEqualTo(1L);  // Valida org
        verify(repository).save(any());
    }
}
```

### Testes de IntegraÃ§Ã£o (com JWT)

Testam o fluxo completo, com banco de dados real e autenticaÃ§Ã£o JWT.

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

        // Cria usuÃ¡rio de teste
        User user = new User();
        user.setNome("Teste");
        user.setEmail("teste@teste.com");
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
        user.setDataAtualizacao(LocalDateTime.now());
        user = userRepository.save(user);

        // Cria organizaÃ§Ã£o de teste
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

| Aspecto | Teste UnitÃ¡rio | Teste de IntegraÃ§Ã£o |
|---------|---------------|---------------------|
| TenantContext | Manual via `TenantContext.set()` | AutomÃ¡tico via filtros |
| AutenticaÃ§Ã£o | NÃ£o passa pelos filtros | Requer token JWT real |
| Banco de dados | Mockado | Real (SQLite) |
| Limpeza | `TenantContext.clear()` | `@BeforeEach` com `deleteAll()` |

---

## MÃ³dulo de AdministraÃ§Ã£o de UsuÃ¡rios (User Admin)

Sistema completo de CRUD de usuÃ¡rios da organizaÃ§Ã£o com controle de acesso por roles.

### Arquitetura

```
domain/
â”œâ”€â”€ exception/
â”‚   â”œâ”€â”€ UserNotFoundException.java          # UsuÃ¡rio nÃ£o encontrado
â”‚   â”œâ”€â”€ CannotModifyOwnerException.java     # NÃ£o pode modificar OWNER
â”‚   â”œâ”€â”€ CannotModifySelfException.java      # NÃ£o pode modificar a si mesmo
â”‚   â””â”€â”€ PasswordExpiredException.java       # Senha expirada
â”œâ”€â”€ model/entity/
â”‚   â””â”€â”€ LoginAttempt.java                   # Registro de tentativas de login
â”œâ”€â”€ repository/
â”‚   â””â”€â”€ LoginAttemptRepository.java         # Repository para histÃ³rico de login
â””â”€â”€ service/
    â””â”€â”€ UserAdminService.java               # LÃ³gica de negÃ³cio

api/
â”œâ”€â”€ controller/
â”‚   â””â”€â”€ UserAdminController.java            # REST endpoints
â”œâ”€â”€ dto/admin/
â”‚   â”œâ”€â”€ UserAdminOutput.java                # Dados completos do usuÃ¡rio
â”‚   â”œâ”€â”€ UserAdminInput.java                 # Input para criar usuÃ¡rio
â”‚   â”œâ”€â”€ UserUpdateInput.java                # Input para atualizar
â”‚   â”œâ”€â”€ UserRoleUpdateInput.java            # Input para alterar role
â”‚   â”œâ”€â”€ UserPasswordResetOutput.java        # Resposta com senha temporÃ¡ria
â”‚   â””â”€â”€ LoginAttemptOutput.java             # Tentativa de login
â””â”€â”€ openapi/
    â””â”€â”€ UserAdminControllerOpenApi.java     # DocumentaÃ§Ã£o Swagger
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

-- Ãndice para busca por usuÃ¡rio
CREATE INDEX IDX_LOGIN_ATTEMPT_USER ON LOGIN_ATTEMPT(LOGA_USER_ID);

-- Coluna senhaExpirada em ACCOUNT
ALTER TABLE ACCOUNT ADD COLUMN ACCO_SENHA_EXPIRADA BOOLEAN DEFAULT FALSE;
```

### UserAdminService - MÃ©todos Principais

```java
@Service
@RequiredArgsConstructor
public class UserAdminService {

    // Listar usuÃ¡rios com filtros e paginaÃ§Ã£o
    public Page<UserAdminOutput> listarUsuarios(
        Boolean ativo, String role, String search, Pageable pageable);

    // Buscar usuÃ¡rio por ID (valida membership na org)
    public UserAdminOutput buscarUsuario(Long userId);

    // Criar usuÃ¡rio com senha temporÃ¡ria
    public UserPasswordResetOutput criarUsuario(UserAdminInput input);

    // Atualizar nome/email
    public UserAdminOutput atualizarUsuario(Long userId, UserUpdateInput input);

    // Ativar/desativar (soft delete)
    public UserAdminOutput ativarUsuario(Long userId);
    public UserAdminOutput desativarUsuario(Long userId);  // Valida: nÃ£o pode desativar OWNER ou si mesmo

    // Alterar role (apenas OWNER pode)
    public UserAdminOutput alterarRole(Long userId, UserRoleUpdateInput input);

    // Resetar senha (gera senha temporÃ¡ria, marca senhaExpirada=true)
    public UserPasswordResetOutput resetarSenha(Long userId);

    // Desbloquear conta bloqueada por tentativas
    public UserAdminOutput desbloquearConta(Long userId);

    // HistÃ³rico de login (Ãºltimas 10 tentativas)
    public List<LoginAttemptOutput> listarHistoricoLogin(Long userId);
}
```

### Regras de NegÃ³cio

1. **CriaÃ§Ã£o de usuÃ¡rio**:
   - Email deve ser Ãºnico
   - NÃ£o pode criar com role OWNER
   - Gera senha temporÃ¡ria de 12 caracteres
   - Marca `senhaExpirada = true` (forÃ§a troca no primeiro login)

2. **DesativaÃ§Ã£o**:
   - NÃ£o pode desativar OWNER
   - NÃ£o pode desativar a si mesmo

3. **AlteraÃ§Ã£o de role**:
   - Apenas OWNER pode alterar roles
   - NÃ£o pode promover alguÃ©m a OWNER
   - NÃ£o pode alterar prÃ³prio role
   - NÃ£o pode rebaixar/alterar OWNER

4. **Reset de senha**:
   - Gera nova senha temporÃ¡ria
   - Desbloqueia conta se bloqueada
   - Marca `senhaExpirada = true`

### ExceÃ§Ãµes e HTTP Status

| ExceÃ§Ã£o | Status | Quando |
|---------|--------|--------|
| `UserNotFoundException` | 404 | UsuÃ¡rio nÃ£o existe ou nÃ£o pertence Ã  org |
| `CannotModifyOwnerException` | 403 | Tentativa de modificar OWNER |
| `CannotModifySelfException` | 400 | Tentativa de desativar/alterar a si mesmo |
| `EmailAlreadyExistsException` | 409 | Email jÃ¡ cadastrado |
| `PasswordExpiredException` | 403 | Login com senha expirada |

### ProteÃ§Ã£o de Endpoints

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

### Testes UnitÃ¡rios (UserAdminServiceTest)

20 testes cobrindo:
- Buscar usuÃ¡rio (sucesso e nÃ£o encontrado)
- Criar usuÃ¡rio (sucesso, email duplicado, criar OWNER)
- Atualizar usuÃ¡rio (sucesso, email duplicado)
- Desativar (sucesso, desativar si mesmo, desativar OWNER)
- Ativar usuÃ¡rio
- Alterar role (sucesso como OWNER, falha como ADMIN, definir como OWNER, alterar prÃ³prio)
- Resetar senha (sucesso, sem conta local)
- Desbloquear conta
- HistÃ³rico de login (sucesso, usuÃ¡rio nÃ£o pertence Ã  org)

### Exemplos de RequisiÃ§Ãµes

#### Criar usuÃ¡rio
```bash
curl -X POST http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-Id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"nome": "JoÃ£o Silva", "email": "joao@empresa.com", "role": "MEMBER"}'
```

**Resposta:**
```json
{
  "userId": 5,
  "senhaTemporaria": "aB3#xY9!kL2$",
  "mensagem": "UsuÃ¡rio criado. Senha temporÃ¡ria deve ser alterada no primeiro login."
}
```

#### Listar usuÃ¡rios com filtros
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

#### Ver histÃ³rico de login
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

## ComparaÃ§Ã£o com o Projeto Base

| Aspecto | Todo API | Reforma TributÃ¡ria |
|---------|----------|-------------------|
| Controllers | 3 (Auth + Todo + UserAdmin) | MÃºltiplos |
| Entities | 7 (User, Org, Todo, LoginAttempt...) | 50+ tabelas |
| AutenticaÃ§Ã£o | JWT + Refresh Token | JWT + OAuth2 |
| Multi-tenancy | Por header X-Organization-Id | Complexo, mÃºltiplas camadas |
| Complexidade | CRUD + Auth + User Admin | CÃ¡lculos tributÃ¡rios complexos |
| Endpoints | 22 | 50+ |
| Cache | NÃ£o implementado | 60+ caches Caffeine |
| ValidaÃ§Ãµes | Bean Validation + regras de negÃ³cio | Regras de negÃ³cio complexas |
| ExceÃ§Ãµes | 11 customizadas | 40+ exceÃ§Ãµes de negÃ³cio |
| ServiÃ§os externos | Nenhum | WebClient, retry patterns |

### O que este projeto ensina:

**BÃ¡sico (estrutura):**
- **Estrutura de pastas** - OrganizaÃ§Ã£o `api/`, `domain/`, `security/`, `config/`
- **PadrÃ£o de camadas** - Controller â†’ Service â†’ Repository
- **DTOs separados** - Input/Output para controle da API
- **Exception Handler** - Tratamento centralizado com ProblemDetail (RFC 7807)
- **OpenAPI/Swagger** - DocumentaÃ§Ã£o automÃ¡tica com autenticaÃ§Ã£o
- **Testes organizados** - UnitÃ¡rios vs IntegraÃ§Ã£o

**IntermediÃ¡rio (autenticaÃ§Ã£o):**
- **JWT stateless** - Access token + Refresh token
- **Spring Security 6** - SecurityFilterChain (sem WebSecurityConfigurerAdapter)
- **Filtros customizados** - JwtAuthenticationFilter, TenantFilter
- **BCrypt** - Hash seguro de senhas
- **RotaÃ§Ã£o de tokens** - FamÃ­lia de tokens para detecÃ§Ã£o de roubo

**AvanÃ§ado (multi-tenancy):**
- **ThreadLocal** - TenantContext para isolamento por thread
- **SpEL expressions** - @PreAuthorize com expressÃµes customizadas
- **Isolamento de dados** - Cada organizaÃ§Ã£o vÃª apenas seus dados

### PrÃ³ximos passos para aprender:

1. Estudar os Services do projeto Reforma (lÃ³gica de negÃ³cio complexa)
2. Ver como o cache Caffeine Ã© configurado
3. Analisar as validaÃ§Ãµes de negÃ³cio customizadas
4. Entender o uso de WebClient para chamadas externas
5. Explorar os testes de integraÃ§Ã£o mais elaborados
6. Implementar OAuth2 (Google, GitHub) usando o padrÃ£o Account

---

## Guia PrÃ¡tico: Passo a Passo

Esta seÃ§Ã£o ensina como criar novos recursos do zero. Vamos usar como exemplo a criaÃ§Ã£o de um CRUD de **Categoria** para organizar as tarefas.

### Ãndice do Guia PrÃ¡tico

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

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/domain/model/entity/`

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
- [ ] `@Id` no campo de chave primÃ¡ria
- [ ] `@EqualsAndHashCode.Include` no ID
- [ ] `@GeneratedValue(strategy = GenerationType.IDENTITY)` para auto-increment
- [ ] `@Column(name = "NOME_COLUNA")` em cada campo
- [ ] `@NotNull` em campos obrigatÃ³rios
- [ ] Valores default definidos na declaraÃ§Ã£o do campo

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

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/domain/repository/`

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

    // Query method automÃ¡tica pelo nome
    List<Categoria> findByAtivoOrderByNomeAsc(Boolean ativo);

    // Query method com ordenaÃ§Ã£o
    List<Categoria> findAllByOrderByNomeAsc();

    // Busca por nome (case insensitive)
    Optional<Categoria> findByNomeIgnoreCase(String nome);

    // Verifica se existe por nome
    boolean existsByNomeIgnoreCase(String nome);

    // Query customizada com JPQL
    @Query("SELECT c FROM Categoria c WHERE c.ativo = true ORDER BY c.nome")
    List<Categoria> buscarAtivas();

    // Query customizada com parÃ¢metro
    @Query("SELECT c FROM Categoria c WHERE LOWER(c.nome) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Categoria> buscarPorTermo(@Param("termo") String termo);

    // Query nativa SQL (quando JPQL nÃ£o resolve)
    @Query(value = "SELECT * FROM CATEGORIA WHERE CATE_ATIVO = true LIMIT :limite", nativeQuery = true)
    List<Categoria> buscarAtivasComLimite(@Param("limite") int limite);

}
```

**PadrÃµes de Query Methods (Spring Data JPA cria automaticamente):**

| MÃ©todo | SQL Gerado |
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

**OrdenaÃ§Ã£o:**
- `findByAtivoOrderByNomeAsc` â†’ `ORDER BY nome ASC`
- `findByAtivoOrderByNomeDesc` â†’ `ORDER BY nome DESC`
- `findAllByOrderByDataCriacaoDesc` â†’ `ORDER BY dataCriacao DESC`

---

### 4. Criar Exception Customizada

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/domain/service/exception/`

**Criar arquivo:** `CategoriaNaoEncontradaException.java`

```java
package br.com.exemplo.todo.domain.service.exception;

public class CategoriaNaoEncontradaException extends RuntimeException {

    public CategoriaNaoEncontradaException(String message) {
        super(message);
    }

    public CategoriaNaoEncontradaException(Long id) {
        this(String.format("Categoria com ID %d nÃ£o encontrada", id));
    }

}
```

**Outras exceÃ§Ãµes comuns:**

```java
// Para regras de negÃ³cio
public class CategoriaEmUsoException extends RuntimeException {
    public CategoriaEmUsoException(Long id) {
        super(String.format("Categoria %d nÃ£o pode ser excluÃ­da pois estÃ¡ em uso", id));
    }
}

// Para duplicidade
public class CategoriaDuplicadaException extends RuntimeException {
    public CategoriaDuplicadaException(String nome) {
        super(String.format("JÃ¡ existe uma categoria com o nome '%s'", nome));
    }
}
```

---

### 5. Criar DTOs (Input e Output)

#### 5.1 Input DTO (dados que a API recebe)

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/api/model/input/`

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

    @NotBlank(message = "Nome Ã© obrigatÃ³rio")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    @Schema(description = "Nome da categoria", example = "Trabalho")
    private String nome;

    @Size(max = 500, message = "DescriÃ§Ã£o deve ter no mÃ¡ximo 500 caracteres")
    @Schema(description = "DescriÃ§Ã£o da categoria", example = "Tarefas relacionadas ao trabalho")
    private String descricao;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor deve estar no formato hexadecimal (#RRGGBB)")
    @Schema(description = "Cor em hexadecimal", example = "#FF5733")
    private String cor;

}
```

**AnotaÃ§Ãµes de validaÃ§Ã£o mais usadas:**

```java
// Strings
@NotNull                    // NÃ£o pode ser null
@NotBlank                   // NÃ£o pode ser null, vazio ou sÃ³ espaÃ§os
@NotEmpty                   // NÃ£o pode ser null ou vazio (funciona em listas tambÃ©m)
@Size(min = 1, max = 100)   // Tamanho mÃ­nimo e mÃ¡ximo
@Pattern(regexp = "...")    // Deve casar com regex
@Email                      // Formato de email vÃ¡lido

// NÃºmeros
@Min(0)                     // Valor mÃ­nimo
@Max(100)                   // Valor mÃ¡ximo
@Positive                   // Deve ser positivo (> 0)
@PositiveOrZero             // Deve ser >= 0
@Negative                   // Deve ser negativo
@DecimalMin("0.01")         // Para BigDecimal
@DecimalMax("999.99")       // Para BigDecimal
@Digits(integer = 10, fraction = 2)  // PrecisÃ£o decimal

// Datas
@Past                       // Deve ser no passado
@PastOrPresent              // Passado ou presente
@Future                     // Deve ser no futuro
@FutureOrPresent            // Futuro ou presente

// Objetos aninhados
@Valid                      // Valida objeto interno recursivamente
@NotNull @Valid             // Objeto obrigatÃ³rio e validado
```

#### 5.2 Output DTO (dados que a API retorna)

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/api/model/output/`

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

    @Schema(description = "ID Ãºnico da categoria", example = "1")
    private Long id;

    @Schema(description = "Nome da categoria", example = "Trabalho")
    private String nome;

    @Schema(description = "DescriÃ§Ã£o da categoria", example = "Tarefas relacionadas ao trabalho")
    private String descricao;

    @Schema(description = "Cor em hexadecimal", example = "#FF5733")
    private String cor;

    @Schema(description = "Se a categoria estÃ¡ ativa", example = "true")
    private Boolean ativo;

    @Schema(description = "Data de criaÃ§Ã£o", example = "2024-01-15T10:30:00")
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

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/domain/service/`

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
     * @throws CategoriaNaoEncontradaException se nÃ£o encontrar
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
                        String.format("Categoria '%s' nÃ£o encontrada", nome)));
    }

    // ==================== COMANDOS ====================

    /**
     * Cria uma nova categoria.
     */
    @Transactional
    public Categoria criar(CategoriaInput input) {
        log.debug("Criando categoria: {}", input.getNome());

        // ValidaÃ§Ã£o de regra de negÃ³cio
        validarNomeDuplicado(input.getNome(), null);

        // ConversÃ£o e defaults
        Categoria categoria = modelMapper.map(input, Categoria.class);
        categoria.setDataCriacao(LocalDateTime.now());
        categoria.setAtivo(true);

        // Se cor nÃ£o informada, usa default
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

        // ValidaÃ§Ã£o de regra de negÃ³cio (ignora a prÃ³pria categoria)
        validarNomeDuplicado(input.getNome(), id);

        // Atualiza apenas os campos editÃ¡veis
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

        // Aqui vocÃª pode adicionar validaÃ§Ã£o se a categoria estÃ¡ em uso
        // Ex: if (todoRepository.existsByCategoriaId(id)) throw new CategoriaEmUsoException(id);

        repository.delete(categoria);
        log.info("Categoria ID {} excluÃ­da", id);
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

    // ==================== VALIDAÃ‡Ã•ES PRIVADAS ====================

    /**
     * Valida se jÃ¡ existe categoria com o mesmo nome.
     * @param nome nome a validar
     * @param idIgnorar ID para ignorar (usado em atualizaÃ§Ã£o)
     */
    private void validarNomeDuplicado(String nome, Long idIgnorar) {
        repository.findByNomeIgnoreCase(nome).ifPresent(existente -> {
            // Se estÃ¡ atualizando e encontrou a prÃ³pria categoria, OK
            if (idIgnorar != null && existente.getId().equals(idIgnorar)) {
                return;
            }
            throw new RuntimeException(
                    String.format("JÃ¡ existe uma categoria com o nome '%s'", nome));
        });
    }

}
```

**Checklist do Service:**
- [ ] `@Service` na classe
- [ ] `@RequiredArgsConstructor` para injeÃ§Ã£o
- [ ] `@Slf4j` para logging
- [ ] `@Transactional` em mÃ©todos que alteram dados
- [ ] Injetar Repository e ModelMapper
- [ ] MÃ©todos de consulta (listar, buscar)
- [ ] MÃ©todos de comando (criar, atualizar, excluir)
- [ ] ValidaÃ§Ãµes de negÃ³cio
- [ ] Logging adequado (debug para inÃ­cio, info para conclusÃ£o)

---

### 7. Criar Interface OpenAPI

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/api/openapi/`

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
            @ApiResponse(responseCode = "404", description = "Categoria nÃ£o encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput buscar(
            @Parameter(description = "ID da categoria", required = true, example = "1")
            Long id
    );

    @Operation(summary = "Cria nova categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoria criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados invÃ¡lidos",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput criar(
            @Parameter(description = "Dados da categoria", required = true)
            CategoriaInput input
    );

    @Operation(summary = "Atualiza categoria existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria atualizada"),
            @ApiResponse(responseCode = "400", description = "Dados invÃ¡lidos",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Categoria nÃ£o encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput atualizar(
            @Parameter(description = "ID da categoria", required = true) Long id,
            @Parameter(description = "Novos dados", required = true) CategoriaInput input
    );

    @Operation(summary = "Exclui categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Categoria excluÃ­da"),
            @ApiResponse(responseCode = "404", description = "Categoria nÃ£o encontrada",
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
            @ApiResponse(responseCode = "404", description = "Categoria nÃ£o encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput ativar(
            @Parameter(description = "ID da categoria", required = true) Long id
    );

    @Operation(summary = "Inativa categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria inativada"),
            @ApiResponse(responseCode = "404", description = "Categoria nÃ£o encontrada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput inativar(
            @Parameter(description = "ID da categoria", required = true) Long id
    );

}
```

---

### 8. Criar Controller

**LocalizaÃ§Ã£o:** `src/main/java/br/com/exemplo/todo/api/controller/`

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

    // ==================== MÃ‰TODOS AUXILIARES ====================

    private CategoriaOutput toOutput(Categoria categoria) {
        return modelMapper.map(categoria, CategoriaOutput.class);
    }

}
```

**Checklist do Controller:**
- [ ] `@RestController`
- [ ] `@RequestMapping("nome-recurso")` (plural, minÃºsculo)
- [ ] `@RequiredArgsConstructor`
- [ ] `@Slf4j`
- [ ] Implementa interface OpenAPI
- [ ] Injeta Service e ModelMapper
- [ ] `@GetMapping` para consultas
- [ ] `@PostMapping` + `@ResponseStatus(CREATED)` para criar
- [ ] `@PutMapping` para atualizar
- [ ] `@DeleteMapping` + `@ResponseStatus(NO_CONTENT)` para excluir
- [ ] `@PatchMapping` para aÃ§Ãµes especÃ­ficas
- [ ] `@Valid` no `@RequestBody` para validaÃ§Ã£o
- [ ] `@PathVariable` para parÃ¢metros de URL
- [ ] `@RequestParam` para query parameters
- [ ] MÃ©todo privado `toOutput()` para conversÃ£o

---

### 9. Registrar Exception no Handler

**Editar arquivo:** `src/main/java/br/com/exemplo/todo/api/exceptionhandler/ProblemType.java`

```java
// Adicionar novo enum
CATEGORIA_NAO_ENCONTRADA(CategoriaNaoEncontradaException.class,
        "Categoria nÃ£o encontrada", "categoria-nao-encontrada"),
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

#### 10.1 Teste UnitÃ¡rio do Service

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
        @DisplayName("deve lanÃ§ar exceÃ§Ã£o quando nÃ£o existe")
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

#### 10.2 Teste de IntegraÃ§Ã£o

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
@DisplayName("CategoriaController - IntegraÃ§Ã£o")
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

Para adicionar categoria Ã s tarefas (relacionamento ManyToOne):

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
â–¡ 1. Migration SQL (src/main/resources/db/migration/V000X__*.sql)
â–¡ 2. Entity (domain/model/entity/*.java)
â–¡ 3. Repository (domain/repository/*Repository.java)
â–¡ 4. Exception (domain/service/exception/*Exception.java)
â–¡ 5. Input DTO (api/model/input/*Input.java)
â–¡ 6. Output DTO (api/model/output/*Output.java)
â–¡ 7. Service (domain/service/*Service.java)
â–¡ 8. OpenAPI Interface (api/openapi/*ControllerOpenApi.java)
â–¡ 9. Controller (api/controller/*Controller.java)
â–¡ 10. Registrar Exception no Handler
â–¡ 11. Testes UnitÃ¡rios (testesunitarios/*ServiceTest.java)
â–¡ 12. Testes de IntegraÃ§Ã£o (testesintegracao/*ControllerIntegracaoTest.java)
```

**Ordem recomendada de criaÃ§Ã£o:**
1. Migration â†’ 2. Entity â†’ 3. Repository â†’ 4. Exception â†’ 5. DTOs â†’ 6. Service â†’ 7. OpenAPI â†’ 8. Controller â†’ 9. Handler â†’ 10. Testes

---

## OpenAPI/Swagger para GeraÃ§Ã£o de Clientes

Esta seÃ§Ã£o documenta as boas prÃ¡ticas para configurar as anotaÃ§Ãµes OpenAPI no backend, garantindo que clientes TypeScript gerados automaticamente (usando ferramentas como `ng-openapi-gen`) tenham tipos corretos.

### Problema: responseType 'blob' em vez de 'json'

Quando o endpoint nÃ£o especifica `mediaType` no `@Content`, o SpringDoc gera:

```json
"content": { "*/*": {} }
```

Isso faz com que geradores de cliente usem `responseType: 'blob'`, causando problemas na deserializaÃ§Ã£o.

**SoluÃ§Ã£o:** Sempre especifique `mediaType = "application/json"` no `@Content`:

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

Quando o schema nÃ£o define `required`, o gerador marca todas propriedades como opcionais (`?` em TypeScript).

**SoluÃ§Ã£o:** Use `requiredProperties` na anotaÃ§Ã£o `@Schema` da classe:

```java
@Schema(description = "Dados de saida",
        requiredProperties = {"id", "nome", "email"})
public record MeuOutput(Long id, String nome, String email, String opcional) {}
```

Resultado no TypeScript gerado:

```typescript
export interface MeuOutput {
  id: number;           // obrigatÃ³rio
  nome: string;         // obrigatÃ³rio
  email: string;        // obrigatÃ³rio
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

### LocalizaÃ§Ã£o

```
src/main/resources/static/
â””â”€â”€ index.html          # PÃ¡gina principal (Single Page Application)
```

### Tecnologias do Frontend

| Tecnologia | VersÃ£o | CDN | PropÃ³sito |
|------------|--------|-----|-----------|
| Bootstrap | 5.3.3 | jsdelivr | Framework CSS (layout, componentes) |
| Bootstrap Icons | 1.11.3 | jsdelivr | Ãcones |
| Axios | latest | jsdelivr | RequisiÃ§Ãµes HTTP para a API |
| jQuery | 3.7.1 | jsdelivr | ManipulaÃ§Ã£o DOM e eventos |

### Como Funciona

O Spring Boot serve automaticamente arquivos da pasta `src/main/resources/static/` como conteÃºdo estÃ¡tico. O arquivo `index.html` Ã© reconhecido como "welcome page" e Ã© servido na raiz do context-path.

**ConfiguraÃ§Ã£o automÃ¡tica:**
- Spring detecta: `Adding welcome page: class path resource [static/index.html]`
- AcessÃ­vel em: `http://localhost:8080/api/` (redireciona para index.html)
- TambÃ©m acessÃ­vel em: `http://localhost:8080/api/index.html`

### Acesso

| URL | DescriÃ§Ã£o |
|-----|-----------|
| http://localhost:8080/api/ | Frontend (interface web) |
| http://localhost:8080/api/swagger-ui.html | Swagger UI (documentaÃ§Ã£o interativa) |
| http://localhost:8080/api/todos | API REST (JSON) |

### Funcionalidades do Frontend

- Listar todas as tarefas
- Filtrar por status: Todas / Pendentes / ConcluÃ­das
- Criar nova tarefa (modal com formulÃ¡rio)
- Editar tarefa existente
- Excluir tarefa (com confirmaÃ§Ã£o)
- Marcar tarefa como concluÃ­da
- Reabrir tarefa concluÃ­da
- NotificaÃ§Ãµes toast para feedback de aÃ§Ãµes

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
    <!-- Filtros e BotÃ£o Nova Tarefa -->
    <!-- Lista de Tarefas (renderizada via JavaScript) -->
    <!-- Modais (criar/editar, confirmar exclusÃ£o) -->
    <!-- Toast de notificaÃ§Ãµes -->

    <!-- CDNs do Bootstrap JS, Axios e jQuery -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>

    <!-- JavaScript da aplicaÃ§Ã£o -->
    <script>
        const API_URL = '/api/todos';
        // FunÃ§Ãµes: carregarTarefas(), criar(), editar(), excluir(), etc.
    </script>
</body>
</html>
```

### Como Remover o Frontend

Se vocÃª quiser remover a interface web e manter apenas a API REST:

```bash
# Excluir o arquivo
rm src/main/resources/static/index.html

# Ou excluir toda a pasta static (se nÃ£o houver outros arquivos)
rm -rf src/main/resources/static/
```

ApÃ³s remover, a API REST continua funcionando normalmente em `/api/todos`.

### Como Incrementar o Frontend

#### Adicionar novos arquivos estÃ¡ticos

Coloque arquivos em `src/main/resources/static/`:

```
src/main/resources/static/
â”œâ”€â”€ index.html
â”œâ”€â”€ css/
â”‚   â””â”€â”€ styles.css      # CSS customizado
â”œâ”€â”€ js/
â”‚   â””â”€â”€ app.js          # JavaScript separado
â””â”€â”€ img/
    â””â”€â”€ logo.png        # Imagens
```

Referencie nos arquivos HTML:
```html
<link rel="stylesheet" href="css/styles.css">
<script src="js/app.js"></script>
<img src="img/logo.png">
```

#### Separar JavaScript em arquivo prÃ³prio

1. Criar `src/main/resources/static/js/app.js` com o cÃ³digo JavaScript
2. No `index.html`, substituir o `<script>` inline por:
   ```html
   <script src="js/app.js"></script>
   ```

#### Adicionar novas pÃ¡ginas

Criar novos arquivos HTML em `static/`:
- `src/main/resources/static/categorias.html` â†’ `http://localhost:8080/api/categorias.html`
- `src/main/resources/static/sobre.html` â†’ `http://localhost:8080/api/sobre.html`

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

1. **Hot Reload**: Com Spring DevTools (jÃ¡ configurado), alteraÃ§Ãµes em arquivos estÃ¡ticos sÃ£o recarregadas automaticamente. Basta atualizar o navegador (F5).

2. **Console do Navegador**: Use F12 â†’ Console para ver erros JavaScript e respostas da API.

3. **Network Tab**: Use F12 â†’ Network para inspecionar requisiÃ§Ãµes HTTP para a API.

4. **CORS**: NÃ£o hÃ¡ problemas de CORS pois o frontend e a API estÃ£o no mesmo servidor/porta.

### Alternativa: Framework Frontend Separado

Se preferir usar React, Vue, ou Angular:

1. Crie o projeto frontend separado
2. Configure o frontend para apontar para `http://localhost:8080/api`
3. Adicione configuraÃ§Ã£o CORS no Spring se necessÃ¡rio:

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


## Armazenamento de Arquivos (AWS S3)

O backend inclui um sistema completo de armazenamento de arquivos usando **AWS S3**. O backend atua como **proxy** entre o frontend e o S3, nunca expondo URLs diretas do storage.

### Arquitetura do Sistema

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         ARQUITETURA DE STORAGE                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                             â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â"‚   â"‚ Frontend â"‚ â"€â"€â"€â"€â"€â–º â"‚   Backend (API)   â"‚ â"€â"€â"€â"€â"€â–º â"‚   AWS S3     â"‚        â"‚
â"‚   â"‚          â"‚        â"‚   (Proxy Layer)   â"‚        â"‚   (Storage)  â"‚        â"‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚        â”‚                      â”‚                           â”‚                â”‚
â”‚        â”‚                      â”‚                           â”‚                â”‚
â”‚        â”‚                      â–¼                           â”‚                â”‚
â”‚        â”‚              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚                â”‚
â”‚        â”‚              â”‚     Database      â”‚               â”‚                â”‚
â”‚        â”‚              â”‚   (StoredFile)    â”‚               â”‚                â”‚
â”‚        â”‚              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚                â”‚
â”‚        â”‚                                                                    â”‚
â"‚   IMPORTANTE:                                                               â"‚
â"‚   - Frontend NUNCA acessa S3 diretamente                                    â"‚
â”‚   - URLs sempre sÃ£o /api/media/{uuid} (relativas ao backend)                â”‚
â”‚   - Backend faz proxy/stream do conteÃºdo                                    â”‚
â”‚                                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Por que o Backend atua como Proxy?

1. **SeguranÃ§a**: Credenciais AWS nunca sÃ£o expostas ao cliente
2. **Controle de Acesso**: Backend pode validar permissÃµes antes de servir arquivos
3. **Multi-Tenancy**: Isolamento por organizaÃ§Ã£o no banco de dados
4. **Flexibilidade**: AbstraÃ§Ã£o permite trocar provider sem alterar frontend
5. **URLs EstÃ¡veis**: `/api/media/{uuid}` funciona independente do storage

---

### ConfiguraÃ§Ã£o AWS S3

#### VariÃ¡veis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas credenciais:

```bash
cp .env.example .env
```

| VariÃ¡vel | DescriÃ§Ã£o | Exemplo |
|----------|-----------|---------|
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS | `wJalr...` |
| `AWS_REGION` | RegiÃ£o AWS (opcional) | `us-east-1` |
| `AWS_S3_BUCKET` | Nome do bucket S3 | `meu-app-media` |

**IMPORTANTE**: O arquivo `.env` estÃ¡ no `.gitignore` e nunca deve ser commitado.

---

### ConfiguraÃ§Ã£o no Spring

`application.yml` jÃ¡ contÃ©m:

```yaml
storage:
  s3:
    enabled: true
    region: ${AWS_REGION:us-east-1}
    bucket: ${AWS_S3_BUCKET:linve-media}
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 5MB
```

O AWS SDK v2 busca credenciais automaticamente via `DefaultCredentialsProvider`:
1. VariÃ¡veis de ambiente (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. Arquivo `~/.aws/credentials`
3. IAM Roles (para EC2/ECS/Lambda)

---

### Endpoints de MÃ­dia

| Endpoint | MÃ©todo | Auth | DescriÃ§Ã£o |
|----------|--------|------|-----------|
| `/api/media` | POST | Sim | Upload genÃ©rico de arquivo |
| `/api/media/{id}` | GET | **NÃ£o** (pÃºblico) | Download/stream do arquivo |
| `/api/media/{id}` | DELETE | Sim | Remove arquivo e metadados |

**Importante sobre autenticaÃ§Ã£o:**
- **GET /api/media/{id}** Ã© **pÃºblico** (sem JWT) para que tags `<img src="...">` funcionem no browser
- **POST e DELETE** requerem autenticaÃ§Ã£o + header `X-Organization-Id`

---

### Fluxo de Upload

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                            FLUXO DE UPLOAD                                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                             â”‚
â”‚  1. Cliente envia POST /api/media com multipart/form-data                   â”‚
â”‚     Headers: Authorization: Bearer {token}, X-Organization-Id: 1            â”‚
â”‚                                                                             â”‚
â”‚  2. TenantFilter valida JWT e extrai organizationId                         â”‚
â”‚                                                                             â”‚
â"‚  3. AwsS3FileStorageService.store():                                        â"‚
â"‚     a) Valida arquivo (nÃ£o vazio)                                           â"‚
â"‚     b) Gera storageKey: {orgId}/{ownerType}/{ownerId}/{uuid}-{filename}     â"‚
â"‚     c) Faz upload para S3 via s3Client.putObject()                          â"‚
â"‚     d) Salva metadados na tabela stored_file                                â"‚
â”‚                                                                             â”‚
â”‚  4. Retorna StoredFileResponse com URL relativa /api/media/{uuid}           â”‚
â”‚                                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Fluxo de Download (Proxy Pattern)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                       FLUXO DE DOWNLOAD (PROXY)                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                             â”‚
â”‚  1. Browser/Frontend requisita GET /api/media/{uuid}                        â”‚
â”‚     (sem Authorization header - endpoint pÃºblico)                           â”‚
â”‚                                                                             â”‚
â”‚  2. MediaController.download():                                             â”‚
â”‚     a) Busca StoredFile por UUID no banco                                   â”‚
â”‚     b) NÃ£o valida tenant (acesso pÃºblico por UUID)                          â”‚
â”‚                                                                             â”‚
â"‚  3. AwsS3FileStorageService.getContent():                                   â"‚
â"‚     a) Recupera metadados (contentType, filename)                           â"‚
â"‚     b) Abre InputStream do S3 via s3Client.getObject()                      â"‚
â”‚                                                                             â”‚
â”‚  4. Controller faz stream para o response:                                  â”‚
â”‚     - Content-Type: {contentType do arquivo}                                â”‚
â”‚     - Content-Disposition: inline; filename="{filename}"                    â”‚
â”‚     - Cache-Control: public, max-age=31536000, immutable (1 ano)            â”‚
â”‚                                                                             â”‚
â”‚  SEGURANÃ‡A:                                                                 â”‚
â”‚  - UUID Ã© praticamente impossÃ­vel de adivinhar (128 bits)                   â”‚
â”‚  - Sem listagem de arquivos (precisa saber o UUID)                          â”‚
â”‚  - Para arquivos sensÃ­veis, usar endpoints autenticados especÃ­ficos         â”‚
â”‚                                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Entidade StoredFile

```java
@Entity
@Table(name = "stored_file")
public class StoredFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;                    // UUID pÃºblico (usado na URL)

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

| Componente | Arquivo | PropÃ³sito |
|------------|---------|-----------|
| `AwsS3FileStorageService` | domain/service/ | ImplementaÃ§Ã£o do storage com AWS S3 |
| `FileStorageService` | domain/service/ | Interface para abstraÃ§Ã£o do storage |
| `MediaController` | api/controller/ | Endpoints REST de mÃ­dia |
| `StoredFile` | domain/model/entity/ | Entidade JPA dos metadados |
| `StoredFileRepository` | domain/repository/ | Acesso ao banco |
| `StorageProperties` | config/ | ConfiguraÃ§Ãµes do S3 |
| `StorageConfig` | config/ | Bean do S3Client |

---

### SeguranÃ§a: PÃºblico vs Autenticado

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           MATRIZ DE SEGURANÃ‡A                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                             â”‚
â”‚  ENDPOINTS PÃšBLICOS (sem JWT):                                              â”‚
â”‚  â”œâ”€â”€ GET /api/media/{id}     â†’ Download por UUID (imagens em <img>)         â”‚
â”‚  â””â”€â”€ GET /api/auth/**        â†’ Login, registro, refresh token               â”‚
â”‚                                                                             â”‚
â”‚  ENDPOINTS AUTENTICADOS (JWT + X-Organization-Id):                          â”‚
â”‚  â”œâ”€â”€ POST /api/media         â†’ Upload genÃ©rico                              â”‚
â”‚  â”œâ”€â”€ DELETE /api/media/{id}  â†’ Remover arquivo                              â”‚
â”‚  â”œâ”€â”€ POST/DELETE /api/account/avatar    â†’ Avatar prÃ³prio                    â”‚
â”‚  â””â”€â”€ POST/DELETE /api/organizations/{id}/logo â†’ Logo da org (OWNER/ADMIN)   â”‚
â”‚                                                                             â”‚
â”‚  VALIDAÃ‡ÃƒO DE ROLE:                                                         â”‚
â”‚  â”œâ”€â”€ Logo de organizaÃ§Ã£o: requer OWNER ou ADMIN na org alvo                 â”‚
â”‚  â”œâ”€â”€ Avatar de outro usuÃ¡rio (admin): requer ADMIN na org                   â”‚
â”‚  â””â”€â”€ Avatar prÃ³prio: qualquer usuÃ¡rio autenticado                           â”‚
â”‚                                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**ConfiguraÃ§Ã£o no SecurityConfig.java:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/media/**").permitAll()  // Download pÃºblico
    // ...
    .anyRequest().authenticated())
```

---

### Exemplos de RequisiÃ§Ãµes

**Upload genÃ©rico:**
```bash
curl -X POST "http://localhost:8080/api/media?ownerType=ORGANIZATION&ownerId=1" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Organization-Id: 1" \
  -F "file=@./documento.pdf"
```

**Download (pÃºblico, sem auth):**
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

### Endpoints de Logo de OrganizaÃ§Ã£o

| Endpoint | MÃ©todo | Auth | Role | DescriÃ§Ã£o |
|----------|--------|------|------|-----------|
| `/api/organizations/{id}/logo` | POST | Sim | OWNER/ADMIN | Upload/substituiÃ§Ã£o do logo |
| `/api/organizations/{id}/logo` | DELETE | Sim | OWNER/ADMIN | Remove o logo |

**Formatos aceitos**: PNG, JPEG, WEBP

**Comportamento importante**: O usuÃ¡rio pode editar o logo de **qualquer organizaÃ§Ã£o** onde seja OWNER ou ADMIN, mesmo que nÃ£o seja a organizaÃ§Ã£o atual (do header `X-Organization-Id`). Isso permite que administradores de mÃºltiplas organizaÃ§Ãµes gerenciem logos sem trocar de contexto.

### Endpoints de Avatar de UsuÃ¡rio

| Endpoint | MÃ©todo | Auth | Role | DescriÃ§Ã£o |
|----------|--------|------|------|-----------|
| `/api/account/avatar` | POST | Sim | Qualquer | UsuÃ¡rio atualiza seu prÃ³prio avatar |
| `/api/account/avatar` | DELETE | Sim | Qualquer | UsuÃ¡rio remove seu prÃ³prio avatar |
| `/api/admin/users/{userId}/avatar` | POST | Sim | ADMIN | Admin atualiza avatar de outro usuÃ¡rio |
| `/api/admin/users/{userId}/avatar` | DELETE | Sim | ADMIN | Admin remove avatar de outro usuÃ¡rio |

**ProteÃ§Ã£o especial**: ADMIN nÃ£o pode alterar avatar de um OWNER.

### Exemplos de RequisiÃ§Ãµes

**Upload de logo da organizaÃ§Ã£o:**
```bash
curl -X POST http://localhost:8080/api/organizations/1/logo \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Organization-Id: 1" \
  -F "file=@./logo.png"
```

**Upload de avatar prÃ³prio:**
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

As URLs de avatar/logo sÃ£o retornadas automaticamente nos DTOs de resposta:

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
  "nome": "JoÃ£o Silva",
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
- Usa `WebClient` (bean `WebClient.Builder` em `TodoApplication`) para chamar:
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

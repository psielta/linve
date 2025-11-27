package br.com.exemplo.todo.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracao de seguranca do OpenAPI/Swagger.
 * Adiciona suporte a autenticacao JWT Bearer e header X-Organization-Id.
 */
@Configuration
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Access token JWT obtido via /auth/login ou /auth/register"
)
public class OpenApiSecurityConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Todo API")
                        .version("2.0.0")
                        .description("""
                                API de gerenciamento de tarefas com autenticacao JWT e multi-tenancy.

                                ## Autenticacao

                                1. Registre-se via `POST /auth/register` ou faca login via `POST /auth/login`
                                2. Use o `accessToken` retornado no header `Authorization: Bearer {token}`
                                3. O token expira em 15 minutos - use `POST /auth/refresh` para renovar

                                ## Multi-tenancy

                                - Cada usuario pode pertencer a multiplas organizacoes
                                - Envie o header `X-Organization-Id` para especificar a organizacao ativa
                                - Se nao enviar, sera usada a primeira organizacao do usuario
                                """)
                        .contact(new Contact()
                                .name("Equipe de Desenvolvimento")
                                .email("dev@exemplo.com.br")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new io.swagger.v3.oas.models.security.SecurityScheme()
                                        .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Access token JWT")));
    }
}

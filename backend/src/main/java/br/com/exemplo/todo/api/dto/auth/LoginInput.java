package br.com.exemplo.todo.api.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Dados para login")
public record LoginInput(
        @Schema(description = "Email do usuario", example = "joao@exemplo.com")
        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        String email,

        @Schema(description = "Senha do usuario", example = "senha123")
        @NotBlank(message = "Senha e obrigatoria")
        String senha
) {}

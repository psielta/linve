package br.com.exemplo.todo.api.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para atualizar um usuario")
public record UserUpdateInput(
        @Schema(description = "Nome completo do usuario", example = "Maria Santos Silva")
        @NotBlank(message = "Nome e obrigatorio")
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String nome,

        @Schema(description = "Email do usuario", example = "maria.silva@exemplo.com")
        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        String email
) {}

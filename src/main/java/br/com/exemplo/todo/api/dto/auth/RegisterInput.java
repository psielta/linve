package br.com.exemplo.todo.api.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para registro de novo usuario")
public record RegisterInput(
        @Schema(description = "Nome completo do usuario", example = "Joao Silva")
        @NotBlank(message = "Nome e obrigatorio")
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String nome,

        @Schema(description = "Email do usuario", example = "joao@exemplo.com")
        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        String email,

        @Schema(description = "Senha do usuario (minimo 6 caracteres)", example = "senha123")
        @NotBlank(message = "Senha e obrigatoria")
        @Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
        String senha,

        @Schema(description = "Nome da organizacao inicial (opcional)", example = "Minha Empresa")
        @Size(max = 100, message = "Nome da organizacao deve ter no maximo 100 caracteres")
        String nomeOrganizacao
) {}

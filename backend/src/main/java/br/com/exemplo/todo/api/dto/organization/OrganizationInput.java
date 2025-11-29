package br.com.exemplo.todo.api.dto.organization;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para criar uma nova organizacao")
public record OrganizationInput(
        @Schema(description = "Nome da organizacao", example = "Minha Empresa")
        @NotBlank(message = "Nome da organizacao e obrigatorio")
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String nome
) {}

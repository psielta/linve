package br.com.exemplo.todo.api.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Requisicao para confirmar login via magic link")
public record MagicLinkConfirmInput(
        @Schema(description = "Token JWT recebido no magic link")
        @NotBlank
        String token
) {
}


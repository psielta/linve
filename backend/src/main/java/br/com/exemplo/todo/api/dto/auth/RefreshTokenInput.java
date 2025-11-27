package br.com.exemplo.todo.api.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Dados para renovacao de token")
public record RefreshTokenInput(
        @Schema(description = "Refresh token atual")
        @NotBlank(message = "Refresh token e obrigatorio")
        String refreshToken
) {}

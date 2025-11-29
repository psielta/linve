package br.com.exemplo.todo.api.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Requisicao para login via magic link")
public record MagicLinkLoginInput(
        @Schema(description = "Email do usuario que recebera o magic link")
        @NotBlank
        @Email
        String email
) {
}

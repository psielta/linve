package br.com.exemplo.todo.api.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta com senha temporaria gerada")
public record UserPasswordResetOutput(
        @Schema(description = "ID do usuario")
        Long userId,

        @Schema(description = "Senha temporaria gerada (mostrar apenas uma vez)")
        String senhaTemporaria,

        @Schema(description = "Mensagem informativa")
        String mensagem
) {
    public static UserPasswordResetOutput of(Long userId, String senhaTemporaria) {
        return new UserPasswordResetOutput(
                userId,
                senhaTemporaria,
                "Senha temporaria gerada. O usuario devera troca-la no proximo login."
        );
    }
}

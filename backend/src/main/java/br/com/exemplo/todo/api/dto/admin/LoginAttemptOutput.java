package br.com.exemplo.todo.api.dto.admin;

import br.com.exemplo.todo.domain.model.entity.LoginAttempt;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Dados de uma tentativa de login")
public record LoginAttemptOutput(
        @Schema(description = "ID da tentativa")
        Long id,

        @Schema(description = "Se o login foi bem sucedido")
        Boolean sucesso,

        @Schema(description = "Endereco IP de origem")
        String ipAddress,

        @Schema(description = "User Agent do navegador/cliente")
        String userAgent,

        @Schema(description = "Motivo da falha (se aplicavel)")
        String motivoFalha,

        @Schema(description = "Data e hora da tentativa")
        LocalDateTime dataTentativa
) {
    public static LoginAttemptOutput from(LoginAttempt attempt) {
        return new LoginAttemptOutput(
                attempt.getId(),
                attempt.getSucesso(),
                attempt.getIpAddress(),
                attempt.getUserAgent(),
                attempt.getMotivoFalha(),
                attempt.getDataTentativa()
        );
    }
}

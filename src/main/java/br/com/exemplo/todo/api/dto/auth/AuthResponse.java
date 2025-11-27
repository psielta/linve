package br.com.exemplo.todo.api.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Resposta de autenticacao com tokens e dados do usuario")
public record AuthResponse(
        @Schema(description = "Access token JWT (curta duracao)")
        String accessToken,

        @Schema(description = "Refresh token (longa duracao)")
        String refreshToken,

        @Schema(description = "Tipo do token", example = "Bearer")
        String tokenType,

        @Schema(description = "Tempo de expiracao do access token em segundos")
        long expiresIn,

        @Schema(description = "Dados do usuario autenticado")
        UserOutput user,

        @Schema(description = "Organizacoes do usuario")
        List<MembershipOutput> organizations
) {
    public AuthResponse(String accessToken, String refreshToken, long expiresIn,
                        UserOutput user, List<MembershipOutput> organizations) {
        this(accessToken, refreshToken, "Bearer", expiresIn, user, organizations);
    }
}

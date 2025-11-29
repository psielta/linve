package br.com.exemplo.todo.api.dto.admin;

import br.com.exemplo.todo.domain.model.entity.Account;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Dados completos do usuario para administracao")
public record UserAdminOutput(
        @Schema(description = "ID do usuario")
        Long id,

        @Schema(description = "Nome do usuario")
        String nome,

        @Schema(description = "Email do usuario")
        String email,

        @Schema(description = "Se o usuario esta ativo")
        Boolean ativo,

        @Schema(description = "Papel do usuario na organizacao")
        MembershipRole role,

        @Schema(description = "Data de criacao do usuario")
        LocalDateTime dataCriacao,

        @Schema(description = "Data do ultimo acesso")
        LocalDateTime ultimoAcesso,

        @Schema(description = "Se a conta esta bloqueada")
        Boolean contaBloqueada,

        @Schema(description = "Se a senha esta expirada (precisa trocar)")
        Boolean senhaExpirada,

        @Schema(description = "Numero de tentativas de login falhas")
        Integer tentativasFalha
) {
    public static UserAdminOutput from(User user, Membership membership, Account account) {
        return new UserAdminOutput(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getAtivo(),
                membership.getPapel(),
                user.getDataCriacao(),
                user.getUltimoAcesso(),
                account != null && Boolean.TRUE.equals(account.getBloqueado()),
                account != null && Boolean.TRUE.equals(account.getSenhaExpirada()),
                account != null && account.getTentativasFalha() != null ? account.getTentativasFalha() : 0
        );
    }
}

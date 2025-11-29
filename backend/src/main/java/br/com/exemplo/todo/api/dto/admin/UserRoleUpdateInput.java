package br.com.exemplo.todo.api.dto.admin;

import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Dados para alterar o papel do usuario")
public record UserRoleUpdateInput(
        @Schema(description = "Novo papel do usuario (ADMIN ou MEMBER)", example = "ADMIN")
        @NotNull(message = "Papel e obrigatorio")
        MembershipRole role
) {}

package br.com.exemplo.todo.api.dto.auth;

import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de membership do usuario em uma organizacao", requiredProperties = {"organization", "role"})
public record MembershipOutput(
        @Schema(description = "Dados da organizacao")
        OrganizationOutput organization,

        @Schema(description = "Papel do usuario na organizacao")
        MembershipRole role
) {
    public static MembershipOutput from(Membership membership) {
        return new MembershipOutput(
                OrganizationOutput.from(membership.getOrganization()),
                membership.getPapel()
        );
    }
}

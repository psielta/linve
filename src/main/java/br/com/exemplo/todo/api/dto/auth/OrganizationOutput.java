package br.com.exemplo.todo.api.dto.auth;

import br.com.exemplo.todo.domain.model.entity.Organization;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados da organizacao")
public record OrganizationOutput(
        @Schema(description = "ID da organizacao")
        Long id,

        @Schema(description = "Nome da organizacao")
        String nome,

        @Schema(description = "Slug da organizacao (URL-friendly)")
        String slug,

        @Schema(description = "URL do logo da organizacao")
        String logo
) {
    public static OrganizationOutput from(Organization organization) {
        return new OrganizationOutput(
                organization.getId(),
                organization.getNome(),
                organization.getSlug(),
                organization.getLogo()
        );
    }
}

package br.com.exemplo.todo.api.dto.auth;

import br.com.exemplo.todo.domain.model.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados do usuario", requiredProperties = {"id", "nome", "email"})
public record UserOutput(
        @Schema(description = "ID do usuario")
        Long id,

        @Schema(description = "Nome do usuario")
        String nome,

        @Schema(description = "Email do usuario")
        String email
) {
    public static UserOutput from(User user) {
        return new UserOutput(user.getId(), user.getNome(), user.getEmail());
    }
}

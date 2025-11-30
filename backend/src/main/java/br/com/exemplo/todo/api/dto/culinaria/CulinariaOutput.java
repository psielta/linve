package br.com.exemplo.todo.api.dto.culinaria;

import br.com.exemplo.todo.domain.model.entity.Culinaria;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados da culinaria")
public record CulinariaOutput(
        @Schema(description = "ID da culinaria")
        Integer id,
        @Schema(description = "Nome da culinaria")
        String nome,
        @Schema(description = "Indica se permite meio a meio")
        Boolean meioMeio
) {
    public static CulinariaOutput from(Culinaria entity) {
        return new CulinariaOutput(
                entity.getId(),
                entity.getNome(),
                entity.getMeioMeio()
        );
    }
}

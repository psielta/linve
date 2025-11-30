package br.com.exemplo.todo.api.dto.dadosabertos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dados de saida da UF",
        requiredProperties = {"codigo", "sigla", "nome"})
public class UfOutput {

    @JsonProperty("codigo")
    @Schema(description = "Codigo IBGE da UF", example = "43")
    private Long codigo;

    @JsonProperty("sigla")
    @Schema(description = "Sigla da UF", example = "RS")
    private String sigla;

    @JsonProperty("nome")
    @Schema(description = "Nome da UF", example = "RIO GRANDE DO SUL")
    private String nome;
}

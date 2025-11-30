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
@Schema(description = "Dados de saida do Municipio",
        requiredProperties = {"codigo", "nome"})
public class MunicipioOutput {

    @JsonProperty("codigo")
    @Schema(description = "Codigo IBGE do Municipio", example = "4314902")
    private Long codigo;

    @JsonProperty("nome")
    @Schema(description = "Nome do Municipio", example = "Porto Alegre")
    private String nome;
}

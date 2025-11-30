package br.com.exemplo.todo.api.dto.categoria;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dias da semana em que a categoria estara disponivel")
public class CategoriaDisponibilidadeDto {

    @JsonProperty("domingo")
    @Schema(description = "Disponivel aos domingos", example = "true")
    private Boolean domingo = false;

    @JsonProperty("segunda")
    @Schema(description = "Disponivel as segundas-feiras", example = "true")
    private Boolean segunda = true;

    @JsonProperty("terca")
    @Schema(description = "Disponivel as tercas-feiras", example = "true")
    private Boolean terca = true;

    @JsonProperty("quarta")
    @Schema(description = "Disponivel as quartas-feiras", example = "true")
    private Boolean quarta = true;

    @JsonProperty("quinta")
    @Schema(description = "Disponivel as quintas-feiras", example = "true")
    private Boolean quinta = true;

    @JsonProperty("sexta")
    @Schema(description = "Disponivel as sextas-feiras", example = "true")
    private Boolean sexta = true;

    @JsonProperty("sabado")
    @Schema(description = "Disponivel aos sabados", example = "true")
    private Boolean sabado = true;
}


package br.com.exemplo.todo.api.dto.adicional;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Item de adicional")
public class AdicionalItemOutput {

    @JsonProperty("id_item")
    @Schema(description = "ID do item de adicional", example = "11")
    private Long idItem;

    @JsonProperty("nome")
    @Schema(description = "Nome do adicional", example = "Granola")
    private String nome;

    @JsonProperty("valor")
    @Schema(description = "Valor do adicional", example = "1.50")
    private BigDecimal valor;

    @JsonProperty("status")
    @Schema(description = "Status (ativo/inativo)", example = "true")
    private Boolean status;
}


package br.com.exemplo.todo.api.dto.adicional;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de saida do grupo de adicionais")
public class AdicionalOutput {

    @JsonProperty("id_adicional")
    @Schema(description = "ID do adicional", example = "5001")
    private Long idAdicional;

    @JsonProperty("id_categoria")
    @Schema(description = "ID da categoria", example = "123")
    private Long idCategoria;

    @JsonProperty("nome")
    @Schema(description = "Nome do grupo", example = "Escolha um adicional")
    private String nome;

    @JsonProperty("selecao")
    @Schema(description = "Tipo de selecao (U, M, Q)", example = "M")
    private String selecao;

    @JsonProperty("minimo")
    @Schema(description = "Minimo (quando aplicavel)", example = "0")
    private Integer minimo;

    @JsonProperty("limite")
    @Schema(description = "Limite (quando aplicavel)", example = "3")
    private Integer limite;

    @JsonProperty("status")
    @Schema(description = "Status (ativo/inativo)", example = "true")
    private Boolean status;

    @JsonProperty("opcoes")
    @Schema(description = "Itens de adicional")
    private List<AdicionalItemOutput> opcoes;
}


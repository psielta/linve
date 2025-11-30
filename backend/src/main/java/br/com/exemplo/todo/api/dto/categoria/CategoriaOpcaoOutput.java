package br.com.exemplo.todo.api.dto.categoria;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de saida de uma opcao de categoria",
        requiredProperties = {"id_opcao", "id_categoria", "nome", "ativo"})
public class CategoriaOpcaoOutput {

    @JsonProperty("id_opcao")
    @Schema(description = "ID da opcao de categoria", example = "12312342")
    private Long idOpcao;

    @JsonProperty("id_categoria")
    @Schema(description = "ID da categoria a que pertence a opcao", example = "160732")
    private Long idCategoria;

    @JsonProperty("nome")
    @Schema(description = "Nome da opcao", example = "500ml")
    private String nome;

    @JsonProperty("ativo")
    @Schema(description = "Indica se a opcao esta ativa (soft delete)", example = "true")
    private Boolean ativo;
}


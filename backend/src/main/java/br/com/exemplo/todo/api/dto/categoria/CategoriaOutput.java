package br.com.exemplo.todo.api.dto.categoria;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de saida da categoria",
        requiredProperties = {
                "id_categoria", "id_culinaria", "nome", "ativo", "disponivel"
        })
public class CategoriaOutput {

    @JsonProperty("id_categoria")
    @Schema(description = "ID da categoria", example = "160732")
    private Long idCategoria;

    @JsonProperty("id_culinaria")
    @Schema(description = "ID da culinaria da categoria", example = "4")
    private Integer idCulinaria;

    @JsonProperty("ordem")
    @Schema(description = "Ordem da categoria no cardapio", example = "1")
    private Integer ordem;

    @JsonProperty("nome")
    @Schema(description = "Nome da categoria", example = "Açaís")
    private String nome;

    @JsonProperty("descricao")
    @Schema(description = "Descricao da categoria", example = "Nova descrição.")
    private String descricao;

    @JsonProperty("inicio")
    @Schema(description = "Horario inicial (hh:mm)", example = "00:00")
    private String inicio;

    @JsonProperty("fim")
    @Schema(description = "Horario final (hh:mm)", example = "23:00")
    private String fim;

    @JsonProperty("ativo")
    @Schema(description = "Indica se a categoria esta ativa (soft delete)", example = "true")
    private Boolean ativo;

    @JsonProperty("opcao_meia")
    @Schema(description = "Usada em pizzas: '', 'M' (valor medio) ou 'V' (maior valor)", example = "")
    private String opcaoMeia;

    @JsonProperty("disponivel")
    @Schema(description = "Dias da semana em que a categoria esta disponivel")
    private CategoriaDisponibilidadeDto disponivel;

    @JsonProperty("opcoes")
    @Schema(description = "Opcoes desta categoria")
    private List<CategoriaOpcaoOutput> opcoes;
}


package br.com.exemplo.todo.api.dto.adicional;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de entrada para criacao/atualizacao de adicionais",
        requiredProperties = {"id_categoria", "nome", "selecao", "opcoes"})
public class AdicionalInput {

    @NotNull(message = "id_categoria e obrigatorio")
    @JsonProperty("id_categoria")
    @Schema(description = "ID da categoria a que o adicional pertence", example = "123")
    private Long idCategoria;

    @NotBlank(message = "nome e obrigatorio")
    @JsonProperty("nome")
    @Schema(description = "Nome do grupo de adicionais", example = "Escolha um adicional")
    private String nome;

    @NotBlank(message = "selecao e obrigatoria")
    @Pattern(regexp = "U|M|Q", message = "selecao deve ser U, M ou Q")
    @JsonProperty("selecao")
    @Schema(description = "Tipo de selecao: U (unico), M (multiplo), Q (quantidade multipla)", example = "M")
    private String selecao;

    @JsonProperty("minimo")
    @Schema(description = "Quantidade minima (apenas para selecao Q)", example = "0")
    private Integer minimo;

    @JsonProperty("limite")
    @Schema(description = "Limite maximo (M ou Q)", example = "3")
    private Integer limite;

    @JsonProperty("status")
    @Schema(description = "Status do adicional (ativo)", example = "true")
    private Boolean status = true;

    @NotEmpty(message = "deve informar ao menos uma opcao")
    @Valid
    @JsonProperty("opcoes")
    @Schema(description = "Opcoes de adicionais (itens)")
    private List<AdicionalOpcaoInput> opcoes;
}


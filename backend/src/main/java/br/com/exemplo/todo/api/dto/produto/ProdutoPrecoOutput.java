package br.com.exemplo.todo.api.dto.produto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Preco do produto")
public class ProdutoPrecoOutput {

    @Schema(description = "ID do preco do produto", example = "1467748")
    private Long id_preco;

    @Schema(description = "ID da opcao de categoria", example = "185862")
    private Long id_opcao;

    @Schema(description = "Nome da opcao", example = "Pequeno")
    private String nome;

    @Schema(description = "Valor atribuido ao produto para esta opcao", example = "20.00")
    private BigDecimal valor;

    @Schema(description = "Status do preco (ativo/inativo)", example = "true")
    private Boolean status;
}


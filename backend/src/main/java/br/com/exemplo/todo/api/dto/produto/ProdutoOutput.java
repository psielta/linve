package br.com.exemplo.todo.api.dto.produto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de saida do produto",
        requiredProperties = {"id_produto", "id_categoria", "nome", "status", "opcoes"})
public class ProdutoOutput {

    @Schema(description = "ID do produto", example = "673114")
    private Long id_produto;

    @Schema(description = "ID da categoria do produto", example = "90395")
    private Long id_categoria;

    @Schema(description = "Nome do produto", example = "No copo")
    private String nome;

    @Schema(description = "Descricao do produto", example = "AcaI no copo")
    private String descricao;

    @Schema(description = "Status do produto (ativo/inativo)", example = "true")
    private Boolean status;

    @Schema(description = "Opcoes de preco do produto")
    private List<ProdutoPrecoOutput> opcoes;
}


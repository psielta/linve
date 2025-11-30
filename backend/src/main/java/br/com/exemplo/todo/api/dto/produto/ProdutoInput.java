package br.com.exemplo.todo.api.dto.produto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de entrada do produto", requiredProperties = {"id_categoria", "nome", "opcoes"})
public class ProdutoInput {

    @NotNull(message = "id_categoria e obrigatorio")
    @Schema(description = "ID da categoria do produto", example = "90395")
    private Long id_categoria;

    @NotBlank(message = "nome e obrigatorio")
    @Size(min = 1, max = 150, message = "nome deve ter entre 1 e 150 caracteres")
    @Schema(description = "Nome do produto", example = "No copo")
    private String nome;

    @Size(max = 500, message = "descricao deve ter no maximo 500 caracteres")
    @Schema(description = "Descricao do produto", example = "AcaI no copo")
    private String descricao;

    @NotEmpty(message = "opcoes nao pode ser vazio")
    @Valid
    @Schema(description = "Lista de opcoes de preco para o produto")
    private List<ProdutoOpcaoInput> opcoes;
}


package br.com.exemplo.todo.api.dto.produto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Opcao de preco do produto", requiredProperties = {"id_opcao", "valor"})
public class ProdutoOpcaoInput {

    @NotNull(message = "id_opcao e obrigatorio")
    @Schema(description = "ID da opcao de categoria", example = "185862")
    private Long id_opcao;

    @NotNull(message = "valor e obrigatorio")
    @Positive(message = "valor deve ser maior que zero")
    @Schema(description = "Preco atribuido ao produto para esta opcao", example = "20.0")
    private BigDecimal valor;
}


package br.com.exemplo.todo.api.dto.adicional;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Opcao de adicional")
public class AdicionalOpcaoInput {

    @NotBlank(message = "nome da opcao e obrigatorio")
    @JsonProperty("nome")
    @Schema(description = "Nome do adicional", example = "Granola")
    private String nome;

    @NotNull(message = "valor e obrigatorio")
    @DecimalMin(value = "0.01", inclusive = true, message = "valor deve ser maior que zero")
    @JsonProperty("valor")
    @Schema(description = "Preco do adicional", example = "1.50")
    private BigDecimal valor;

    @JsonProperty("status")
    @Schema(description = "Status do adicional (ativo/inativo)", example = "true")
    private Boolean status = true;
}


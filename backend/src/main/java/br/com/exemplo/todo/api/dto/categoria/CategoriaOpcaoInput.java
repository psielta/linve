package br.com.exemplo.todo.api.dto.categoria;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de entrada para criacao/atualizacao de opcao de categoria",
        requiredProperties = {"nome"})
public class CategoriaOpcaoInput {

    @NotBlank(message = "nome da opcao e obrigatorio")
    @Size(min = 1, max = 150, message = "nome deve ter entre 1 e 150 caracteres")
    @JsonProperty("nome")
    @Schema(description = "Nome da opcao", example = "500ml")
    private String nome;
}


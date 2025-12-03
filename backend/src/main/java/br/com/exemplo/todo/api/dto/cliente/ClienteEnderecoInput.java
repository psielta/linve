package br.com.exemplo.todo.api.dto.cliente;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de entrada para endereco do cliente",
        requiredProperties = {"municipio"})
public class ClienteEnderecoInput {

    @Schema(description = "ID do endereco (informar apenas para atualizacao)", example = "1")
    private Long id;

    @NotNull(message = "municipio e obrigatorio")
    @JsonProperty("municipio")
    @Schema(description = "Codigo IBGE do municipio", example = "3147907")
    private Long municipioId;

    @Size(max = 10, message = "cep deve ter no maximo 10 caracteres")
    @Schema(description = "CEP", example = "36305060")
    private String cep;

    @Size(max = 100, message = "bairro deve ter no maximo 100 caracteres")
    @Schema(description = "Bairro", example = "Matozinhos")
    private String bairro;

    @Size(max = 200, message = "rua deve ter no maximo 200 caracteres")
    @Schema(description = "Rua/Logradouro", example = "Rua do Jatoba")
    private String rua;

    @Size(max = 20, message = "num deve ter no maximo 20 caracteres")
    @Schema(description = "Numero", example = "71")
    private String num;

    @Size(max = 100, message = "complemento deve ter no maximo 100 caracteres")
    @Schema(description = "Complemento", example = "Ap 303")
    private String complemento;

    @Size(max = 200, message = "ponto_referencia deve ter no maximo 200 caracteres")
    @JsonProperty("ponto_referencia")
    @Schema(description = "Ponto de referencia", example = "Proximo ao supermercado")
    private String pontoReferencia;
}

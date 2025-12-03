package br.com.exemplo.todo.api.dto.cliente;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dados de saida do endereco do cliente",
        requiredProperties = {"id", "municipio"})
public class ClienteEnderecoOutput {

    @Schema(description = "ID do endereco", example = "2387541")
    private Long id;

    @Schema(description = "CEP", example = "36305060")
    private String cep;

    @Schema(description = "Codigo IBGE do municipio", example = "3147907")
    private Long municipio;

    @Schema(description = "Sigla da UF", example = "MG")
    private String uf;

    @Schema(description = "Nome da cidade", example = "Passos")
    private String cidade;

    @Schema(description = "Bairro", example = "Matozinhos")
    private String bairro;

    @Schema(description = "Rua/Logradouro", example = "Rua do Jatoba")
    private String rua;

    @Schema(description = "Numero", example = "71")
    private String num;

    @Schema(description = "Complemento", example = "Ap 303")
    private String complemento;

    @JsonProperty("ponto_referencia")
    @Schema(description = "Ponto de referencia", example = "Proximo ao supermercado")
    private String pontoReferencia;
}

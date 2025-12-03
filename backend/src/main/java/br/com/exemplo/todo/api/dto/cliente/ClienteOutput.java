package br.com.exemplo.todo.api.dto.cliente;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dados de saida do cliente",
        requiredProperties = {"id", "nome", "enderecos"})
public class ClienteOutput {

    @Schema(description = "ID do cliente", example = "1760306")
    private Long id;

    @Schema(description = "Nome do cliente", example = "Ramon")
    private String nome;

    @JsonProperty("tel_1")
    @Schema(description = "Telefone principal", example = "35999992334")
    private String tel1;

    @JsonProperty("tel_2")
    @Schema(description = "Telefone secundario", example = "3535318899")
    private String tel2;

    @JsonProperty("tel_3")
    @Schema(description = "Telefone adicional", example = "")
    private String tel3;

    @Schema(description = "CPF ou CNPJ do cliente", example = "95607770095")
    private String documento;

    @Schema(description = "Lista de enderecos do cliente")
    private List<ClienteEnderecoOutput> enderecos;
}

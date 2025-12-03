package br.com.exemplo.todo.api.dto.cliente;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de entrada para criacao/atualizacao de cliente",
        requiredProperties = {"nome", "enderecos"})
public class ClienteInput {

    @NotBlank(message = "nome e obrigatorio")
    @Size(max = 200, message = "nome deve ter no maximo 200 caracteres")
    @Schema(description = "Nome do cliente", example = "Ramon")
    private String nome;

    @Size(max = 20, message = "tel_1 deve ter no maximo 20 caracteres")
    @JsonProperty("tel_1")
    @Schema(description = "Telefone principal", example = "35999992334")
    private String tel1;

    @Size(max = 20, message = "tel_2 deve ter no maximo 20 caracteres")
    @JsonProperty("tel_2")
    @Schema(description = "Telefone secundario", example = "3535318899")
    private String tel2;

    @Size(max = 20, message = "tel_3 deve ter no maximo 20 caracteres")
    @JsonProperty("tel_3")
    @Schema(description = "Telefone adicional", example = "")
    private String tel3;

    @Size(max = 20, message = "documento deve ter no maximo 20 caracteres")
    @Schema(description = "CPF ou CNPJ do cliente", example = "95607770095")
    private String documento;

    @NotEmpty(message = "deve informar pelo menos um endereco")
    @Valid
    @Schema(description = "Lista de enderecos do cliente")
    private List<ClienteEnderecoInput> enderecos;
}

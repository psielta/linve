package br.com.exemplo.todo.api.dto.categoria;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Dados de entrada para criacao/atualizacao de categoria",
        requiredProperties = {"id_culinaria", "nome", "opcoes"})
public class CategoriaInput {

    @NotNull(message = "id_culinaria e obrigatorio")
    @JsonProperty("id_culinaria")
    @Schema(description = "ID da culinaria na qual pertence a categoria", example = "4")
    private Integer idCulinaria;

    @NotBlank(message = "nome e obrigatorio")
    @Size(min = 1, max = 150, message = "nome deve ter entre 1 e 150 caracteres")
    @JsonProperty("nome")
    @Schema(description = "Nome da categoria", example = "Acaís")
    private String nome;

    @NotEmpty(message = "deve informar pelo menos uma opcao")
    @JsonProperty("opcoes")
    @Schema(description = "Lista de nomes das opcoes da categoria", example = "[\"300ml\",\"500ml\"]")
    private List<@NotBlank(message = "nome da opcao nao pode ser vazio") String> opcoes;

    @Size(max = 500, message = "descricao deve ter no maximo 500 caracteres")
    @JsonProperty("descricao")
    @Schema(description = "Descricao da categoria", example = "Descriçao de categoria de Açaís.")
    private String descricao;

    @Size(max = 1, message = "opcao_meia deve ter apenas 1 caractere")
    @JsonProperty("opcao_meia")
    @Schema(description = "Usada em pizzas: '', 'M' (valor medio) ou 'V' (maior valor)", example = "")
    private String opcaoMeia;

    @JsonProperty("disponivel")
    @Schema(description = "Objeto contendo os dias da semana em que a categoria está disponivel")
    private CategoriaDisponibilidadeDto disponivel;

    @JsonProperty("inicio")
    @Schema(description = "Horario inicial (hh:mm) em que a categoria fica disponivel", example = "00:00")
    private String inicio;

    @JsonProperty("fim")
    @Schema(description = "Horario final (hh:mm) em que a categoria fica disponivel", example = "23:00")
    private String fim;

    @JsonProperty("ordem")
    @Schema(description = "Ordem da categoria no cardapio (unica por organizacao)", example = "1")
    private Integer ordem;
}


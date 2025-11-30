package br.com.exemplo.todo.api.dto.todo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TodoInput {

    @NotBlank(message = "Título é obrigatório")
    @Size(min = 1, max = 200, message = "Título deve ter entre 1 e 200 caracteres")
    @Schema(description = "Título da tarefa", example = "Comprar pão")
    private String titulo;

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    @Schema(description = "Descrição detalhada da tarefa", example = "Ir à padaria do João e comprar 2 pães franceses")
    private String descricao;

}

package br.com.exemplo.todo.api.dto.todo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de saída da tarefa", requiredProperties = {"id", "titulo", "concluido", "dataCriacao"})
public class TodoOutput {

    @Schema(description = "ID único da tarefa", example = "1")
    private Long id;

    @Schema(description = "Título da tarefa", example = "Comprar pão")
    private String titulo;

    @Schema(description = "Descrição detalhada da tarefa", example = "Ir à padaria do João e comprar 2 pães franceses")
    private String descricao;

    @Schema(description = "Indica se a tarefa foi concluída", example = "false")
    private Boolean concluido;

    @Schema(description = "Data e hora de criação da tarefa", example = "2024-01-15T10:30:00")
    private LocalDateTime dataCriacao;

    @Schema(description = "Data e hora de conclusão da tarefa", example = "2024-01-15T14:45:00")
    private LocalDateTime dataConclusao;

}

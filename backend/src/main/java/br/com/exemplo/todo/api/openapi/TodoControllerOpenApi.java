package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.model.input.TodoInput;
import br.com.exemplo.todo.api.model.output.TodoOutput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;

import java.util.List;

@Tag(name = "Tarefas (Todo)", description = "Gerenciamento de tarefas da organizacao atual")
@SecurityRequirement(name = "bearerAuth")
public interface TodoControllerOpenApi {

    @Operation(summary = "Lista todas as tarefas",
            description = "Retorna a lista de todas as tarefas da organizacao atual")
    @ApiResponse(responseCode = "200", description = "Lista de tarefas retornada com sucesso",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TodoOutput.class))))
    List<TodoOutput> listar(
            @Parameter(description = "Filtrar por status de conclusão (true = concluídas, false = pendentes)")
            Boolean concluido
    );

    @Operation(summary = "Busca uma tarefa pelo ID", description = "Retorna os dados de uma tarefa específica")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tarefa encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TodoOutput.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    TodoOutput buscar(
            @Parameter(description = "ID da tarefa", required = true) Long id
    );

    @Operation(summary = "Cria uma nova tarefa", description = "Cadastra uma nova tarefa no sistema")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tarefa criada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TodoOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    TodoOutput criar(
            @Parameter(description = "Dados da tarefa", required = true) TodoInput input
    );

    @Operation(summary = "Atualiza uma tarefa", description = "Atualiza os dados de uma tarefa existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tarefa atualizada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TodoOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    TodoOutput atualizar(
            @Parameter(description = "ID da tarefa", required = true) Long id,
            @Parameter(description = "Novos dados da tarefa", required = true) TodoInput input
    );

    @Operation(summary = "Exclui uma tarefa", description = "Remove uma tarefa do sistema")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Tarefa excluída com sucesso"),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    void excluir(
            @Parameter(description = "ID da tarefa", required = true) Long id
    );

    @Operation(summary = "Marca uma tarefa como concluída", description = "Atualiza o status da tarefa para concluída")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tarefa marcada como concluída",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TodoOutput.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    TodoOutput marcarConcluido(
            @Parameter(description = "ID da tarefa", required = true) Long id
    );

    @Operation(summary = "Reabre uma tarefa", description = "Remove o status de concluída da tarefa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tarefa reaberta com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TodoOutput.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    TodoOutput reabrir(
            @Parameter(description = "ID da tarefa", required = true) Long id
    );

}

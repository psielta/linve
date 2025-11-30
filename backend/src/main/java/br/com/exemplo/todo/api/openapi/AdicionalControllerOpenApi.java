package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.adicional.AdicionalInput;
import br.com.exemplo.todo.api.dto.adicional.AdicionalOutput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;

import java.util.List;

@Tag(name = "Adicionais", description = "Gestao de adicionais de produtos")
public interface AdicionalControllerOpenApi {

    @Operation(summary = "Listar adicionais",
            description = "Lista grupos de adicionais da organizacao, opcionalmente filtrando por categoria")
    @ApiResponse(responseCode = "200", description = "Lista de adicionais",
            content = @Content(schema = @Schema(implementation = AdicionalOutput.class)))
    List<AdicionalOutput> listar(
            @Parameter(description = "ID da categoria (opcional)") Long id_categoria);

    @Operation(summary = "Buscar adicional por ID")
    @ApiResponse(responseCode = "200", description = "Adicional encontrado")
    @ApiResponse(responseCode = "404", description = "Nao encontrado",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    AdicionalOutput buscar(Long id);

    @Operation(summary = "Criar adicional")
    @ApiResponse(responseCode = "201", description = "Criado")
    @ApiResponse(responseCode = "400", description = "Validacao falhou",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    AdicionalOutput criar(AdicionalInput input);

    @Operation(summary = "Atualizar adicional")
    @ApiResponse(responseCode = "200", description = "Atualizado")
    @ApiResponse(responseCode = "400", description = "Validacao falhou",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Nao encontrado",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    AdicionalOutput atualizar(Long id, AdicionalInput input);

    @Operation(summary = "Excluir (soft delete) adicional")
    @ApiResponse(responseCode = "204", description = "Excluido")
    @ApiResponse(responseCode = "404", description = "Nao encontrado",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    void excluir(Long id);
}


package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.culinaria.CulinariaOutput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Culinarias", description = "Lista estatica de culinarias")
@SecurityRequirement(name = "bearerAuth")
public interface CulinariaControllerOpenApi {

    @Operation(
            summary = "Listar culinarias",
            description = "Retorna lista estatica de culinarias (somente leitura)"
    )
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    List<CulinariaOutput> listar(Boolean meioMeio);

    @Operation(
            summary = "Buscar culinaria por ID",
            description = "Retorna os dados de uma culinaria pelo ID"
    )
    @ApiResponse(responseCode = "200", description = "Culinaria encontrada")
    @ApiResponse(responseCode = "404", description = "Culinaria nao encontrada")
    CulinariaOutput buscarPorId(Integer id);
}

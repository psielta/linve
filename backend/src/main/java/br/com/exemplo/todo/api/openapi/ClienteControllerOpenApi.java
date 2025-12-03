package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.cliente.ClienteInput;
import br.com.exemplo.todo.api.dto.cliente.ClienteOutput;
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

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "Clientes", description = "CRUD de clientes e seus enderecos por organizacao")
@SecurityRequirement(name = "bearerAuth")
public interface ClienteControllerOpenApi {

    @Operation(summary = "Lista clientes da organizacao atual",
            description = "Retorna todos os clientes ativos da organizacao atual com seus enderecos.")
    @ApiResponse(responseCode = "200", description = "Lista de clientes retornada com sucesso",
            content = @Content(mediaType = APPLICATION_JSON_VALUE,
                    array = @ArraySchema(schema = @Schema(implementation = ClienteOutput.class))))
    List<ClienteOutput> listar();

    @Operation(summary = "Busca cliente pelo ID",
            description = "Retorna os dados de um cliente especifico da organizacao atual com seus enderecos.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ClienteOutput.class))),
            @ApiResponse(responseCode = "404", description = "Cliente nao encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    ClienteOutput buscar(
            @Parameter(description = "ID do cliente", required = true) Long id
    );

    @Operation(summary = "Cria novo cliente",
            description = "Cria um novo cliente para a organizacao atual com seus enderecos. "
                    + "O documento (CPF/CNPJ) deve ser unico por organizacao.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ClienteOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos ou documento ja cadastrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    ClienteOutput criar(
            @Parameter(description = "Dados do cliente", required = true) ClienteInput input
    );

    @Operation(summary = "Atualiza cliente existente",
            description = "Atualiza os dados de um cliente existente da organizacao atual. "
                    + "Enderecos com ID sao atualizados, sem ID sao criados, e os nao enviados sao desativados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ClienteOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Cliente nao encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    ClienteOutput atualizar(
            @Parameter(description = "ID do cliente", required = true) Long id,
            @Parameter(description = "Novos dados do cliente", required = true) ClienteInput input
    );

    @Operation(summary = "Remove cliente",
            description = "Desativa (soft delete) um cliente e todos os seus enderecos da organizacao atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Cliente desativado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Cliente nao encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    void excluir(
            @Parameter(description = "ID do cliente", required = true) Long id
    );
}

package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.produto.ProdutoInput;
import br.com.exemplo.todo.api.dto.produto.ProdutoOutput;
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

@Tag(name = "Produtos", description = "Gerenciamento de produtos e seus precos")
@SecurityRequirement(name = "bearerAuth")
public interface ProdutoControllerOpenApi {

    @Operation(summary = "Listar produtos",
            description = "Retorna produtos da organizacao atual. Filtro opcional por id_categoria.")
    @ApiResponse(responseCode = "200", description = "Lista retornada",
            content = @Content(mediaType = APPLICATION_JSON_VALUE,
                    array = @ArraySchema(schema = @Schema(implementation = ProdutoOutput.class))))
    List<ProdutoOutput> listar(
            @Parameter(description = "ID da categoria para filtrar") Long id_categoria
    );

    @Operation(summary = "Buscar produto por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produto encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProdutoOutput.class))),
            @ApiResponse(responseCode = "404", description = "Produto nao encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    ProdutoOutput buscar(Long id);

    @Operation(summary = "Criar produto")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Produto criado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProdutoOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    ProdutoOutput criar(ProdutoInput input);

    @Operation(summary = "Atualizar produto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produto atualizado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProdutoOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Produto nao encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    ProdutoOutput atualizar(Long id, ProdutoInput input);

    @Operation(summary = "Excluir produto (soft delete)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Produto desativado"),
            @ApiResponse(responseCode = "404", description = "Produto nao encontrado",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    void excluir(Long id);
}


package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.categoria.CategoriaInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoOutput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOutput;
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

@Tag(name = "Categorias de Produtos", description = "CRUD de categorias e suas opcoes por organizacao")
@SecurityRequirement(name = "bearerAuth")
public interface CategoriaControllerOpenApi {

    @Operation(summary = "Lista categorias da organizacao atual",
            description = "Retorna todas as categorias ativas da organizacao atual. "
                    + "Opcionalmente filtra por ID de culinaria.")
    @ApiResponse(responseCode = "200", description = "Lista de categorias retornada com sucesso",
            content = @Content(mediaType = APPLICATION_JSON_VALUE,
                    array = @ArraySchema(schema = @Schema(implementation = CategoriaOutput.class))))
    List<CategoriaOutput> listar(
            @Parameter(description = "ID da culinaria para filtro opcional") Integer idCulinaria
    );

    @Operation(summary = "Busca categoria pelo ID",
            description = "Retorna os dados de uma categoria especifica da organizacao atual")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CategoriaOutput.class))),
            @ApiResponse(responseCode = "404", description = "Categoria nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput buscar(
            @Parameter(description = "ID da categoria", required = true) Long id
    );

    @Operation(summary = "Cria nova categoria",
            description = "Cria uma nova categoria para a organizacao atual, incluindo suas opcoes ativas.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoria criada com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CategoriaOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput criar(
            @Parameter(description = "Dados da categoria", required = true) CategoriaInput input
    );

    @Operation(summary = "Atualiza categoria existente",
            description = "Atualiza os dados de uma categoria existente da organizacao atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria atualizada com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CategoriaOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Categoria nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOutput atualizar(
            @Parameter(description = "ID da categoria", required = true) Long id,
            @Parameter(description = "Novos dados da categoria", required = true) CategoriaInput input
    );

    @Operation(summary = "Remove categoria",
            description = "Desativa (soft delete) uma categoria da organizacao atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Categoria desativada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Categoria nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    void excluir(
            @Parameter(description = "ID da categoria", required = true) Long id
    );

    @Operation(summary = "Lista opcoes de uma categoria",
            description = "Retorna as opcoes ativas de uma categoria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de opcoes retornada com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            array = @ArraySchema(schema = @Schema(implementation = CategoriaOpcaoOutput.class)))),
            @ApiResponse(responseCode = "404", description = "Categoria nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    List<CategoriaOpcaoOutput> listarOpcoes(
            @Parameter(description = "ID da categoria", required = true) Long idCategoria
    );

    @Operation(summary = "Adiciona opcao a categoria",
            description = "Cria uma nova opcao ativa para a categoria informada.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Opcao criada com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CategoriaOpcaoOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Categoria nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOpcaoOutput adicionarOpcao(
            @Parameter(description = "ID da categoria", required = true) Long idCategoria,
            @Parameter(description = "Dados da opcao", required = true) CategoriaOpcaoInput input
    );

    @Operation(summary = "Atualiza opcao de categoria",
            description = "Atualiza o nome de uma opcao existente da categoria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Opcao atualizada com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CategoriaOpcaoOutput.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Categoria ou opcao nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    CategoriaOpcaoOutput atualizarOpcao(
            @Parameter(description = "ID da categoria", required = true) Long idCategoria,
            @Parameter(description = "ID da opcao", required = true) Long idOpcao,
            @Parameter(description = "Dados da opcao", required = true) CategoriaOpcaoInput input
    );

    @Operation(summary = "Remove opcao de categoria",
            description = "Desativa (soft delete) uma opcao de categoria.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Opcao desativada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Categoria ou opcao nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    void desativarOpcao(
            @Parameter(description = "ID da categoria", required = true) Long idCategoria,
            @Parameter(description = "ID da opcao", required = true) Long idOpcao
    );
}


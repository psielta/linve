package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.dadosabertos.MunicipioOutput;
import br.com.exemplo.todo.api.dto.dadosabertos.UfOutput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "Dados Abertos", description = "Endpoints publicos para consulta de UFs e Municipios (sem autenticacao)")
public interface DadosAbertosControllerOpenApi {

    @Operation(summary = "Lista todas as UFs",
            description = "Retorna todas as Unidades Federativas do Brasil ordenadas por sigla. "
                    + "Este endpoint e publico e nao requer autenticacao.")
    @ApiResponse(responseCode = "200", description = "Lista de UFs retornada com sucesso",
            content = @Content(mediaType = APPLICATION_JSON_VALUE,
                    array = @ArraySchema(schema = @Schema(implementation = UfOutput.class))))
    ResponseEntity<List<UfOutput>> listarUfs();

    @Operation(summary = "Lista municipios de uma UF",
            description = "Retorna todos os municipios de uma Unidade Federativa ordenados por nome. "
                    + "Este endpoint e publico e nao requer autenticacao.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de municipios retornada com sucesso",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            array = @ArraySchema(schema = @Schema(implementation = MunicipioOutput.class)))),
            @ApiResponse(responseCode = "404", description = "UF nao encontrada",
                    content = @Content(mediaType = APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProblemDetail.class)))
    })
    ResponseEntity<List<MunicipioOutput>> listarMunicipiosPorUf(
            @Parameter(description = "Sigla da UF (ex: RS, SP, RJ)", required = true, example = "RS") String siglaUf
    );

    @Operation(summary = "Lista todos os municipios",
            description = "Retorna todos os municipios do Brasil ordenados por nome. "
                    + "Este endpoint e publico e nao requer autenticacao. "
                    + "Atencao: retorna aproximadamente 5570 registros.")
    @ApiResponse(responseCode = "200", description = "Lista de municipios retornada com sucesso",
            content = @Content(mediaType = APPLICATION_JSON_VALUE,
                    array = @ArraySchema(schema = @Schema(implementation = MunicipioOutput.class))))
    ResponseEntity<List<MunicipioOutput>> listarTodosMunicipios();
}

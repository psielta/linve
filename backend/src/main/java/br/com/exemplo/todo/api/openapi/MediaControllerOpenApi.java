package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.media.MediaOutput;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Tag(name = "Media", description = "Armazenamento e entrega de arquivos")
@SecurityRequirement(name = "bearerAuth")
public interface MediaControllerOpenApi {

    @Operation(
            summary = "Upload de arquivo",
            description = "Armazena um arquivo generico (imagem, PDF, planilha, etc.) associado a uma entidade/tenant.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Arquivo salvo com sucesso"),
                    @ApiResponse(responseCode = "400", description = "Parametros invalidos"),
                    @ApiResponse(responseCode = "401", description = "Nao autenticado")
            }
    )
    MediaOutput upload(
            @Parameter(description = "Tipo do dono do arquivo", required = true, in = ParameterIn.QUERY)
            @RequestParam MediaOwnerType ownerType,
            @Parameter(description = "ID do dono do arquivo (pode ser nulo para uso generico)", in = ParameterIn.QUERY)
            @RequestParam(required = false) Long ownerId,
            @Parameter(description = "Arquivo a ser enviado", required = true)
            @RequestPart("file") MultipartFile file);

    @Operation(
            summary = "Download de arquivo",
            description = "Retorna o binario do arquivo pertencente ao tenant atual.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Arquivo retornado"),
                    @ApiResponse(responseCode = "404", description = "Arquivo nao encontrado")
            }
    )
    ResponseEntity<Resource> download(@PathVariable UUID id);

    @Operation(
            summary = "Excluir arquivo",
            description = "Remove o arquivo do armazenamento e do catalogo.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Arquivo removido"),
                    @ApiResponse(responseCode = "404", description = "Arquivo nao encontrado")
            }
    )
    ResponseEntity<Void> delete(@PathVariable UUID id);
}

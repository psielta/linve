package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.auth.UserOutput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Conta", description = "Operacoes relacionadas a conta do usuario autenticado")
@SecurityRequirement(name = "bearerAuth")
public interface AccountControllerOpenApi {

    @Operation(summary = "Atualizar avatar do proprio usuario",
            description = "Atualiza a foto de perfil do usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Avatar atualizado")
    @ApiResponse(responseCode = "400", description = "Arquivo invalido", content = @Content)
    UserOutput atualizarAvatar(
            @Parameter(description = "Arquivo de avatar (PNG/JPEG/WEBP)", required = true)
            MultipartFile file);

    @Operation(summary = "Remover avatar do proprio usuario",
            description = "Remove a foto de perfil do usuario autenticado")
    @ApiResponse(responseCode = "204", description = "Avatar removido")
    void removerAvatar();
}

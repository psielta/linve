package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.auth.MembershipOutput;
import br.com.exemplo.todo.api.dto.auth.OrganizationOutput;
import br.com.exemplo.todo.api.dto.organization.OrganizationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Organizations", description = "Gerenciamento de organizacoes")
@SecurityRequirement(name = "bearerAuth")
public interface OrganizationControllerOpenApi {

    @Operation(
            summary = "Criar organizacao",
            description = "Cria uma nova organizacao e define o usuario autenticado como OWNER"
    )
    @ApiResponse(responseCode = "201", description = "Organizacao criada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados invalidos")
    @ApiResponse(responseCode = "401", description = "Nao autenticado")
    MembershipOutput criar(@RequestBody @Valid OrganizationInput input);

    @Operation(
            summary = "Atualizar organizacao",
            description = "Atualiza o nome de uma organizacao. Apenas OWNER ou ADMIN podem atualizar."
    )
    @ApiResponse(responseCode = "200", description = "Organizacao atualizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados invalidos")
    @ApiResponse(responseCode = "401", description = "Nao autenticado")
    @ApiResponse(responseCode = "403", description = "Sem permissao para atualizar esta organizacao")
    @ApiResponse(responseCode = "404", description = "Organizacao nao encontrada")
    OrganizationOutput atualizar(
            @Parameter(description = "ID da organizacao") @PathVariable Long id,
            @RequestBody @Valid OrganizationInput input);

    @Operation(
            summary = "Atualizar logo da organizacao",
            description = "Substitui o logo da organizacao. Apenas OWNER ou ADMIN podem alterar."
    )
    @ApiResponse(responseCode = "200", description = "Logo atualizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Arquivo invalido")
    @ApiResponse(responseCode = "401", description = "Nao autenticado")
    @ApiResponse(responseCode = "403", description = "Sem permissao")
    @ApiResponse(responseCode = "404", description = "Organizacao nao encontrada")
    OrganizationOutput atualizarLogo(
            @Parameter(description = "ID da organizacao") @PathVariable Long id,
            @Parameter(description = "Arquivo de logo (PNG/JPEG/WEBP)", required = true) @RequestPart("file") MultipartFile file);

    @Operation(
            summary = "Remover logo da organizacao",
            description = "Remove o logo atual da organizacao. Apenas OWNER ou ADMIN podem remover."
    )
    @ApiResponse(responseCode = "204", description = "Logo removida com sucesso")
    @ApiResponse(responseCode = "401", description = "Nao autenticado")
    @ApiResponse(responseCode = "403", description = "Sem permissao")
    @ApiResponse(responseCode = "404", description = "Organizacao nao encontrada")
    void removerLogo(@Parameter(description = "ID da organizacao") @PathVariable Long id);
}

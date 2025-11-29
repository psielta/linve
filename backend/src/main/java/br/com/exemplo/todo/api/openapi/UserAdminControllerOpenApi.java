package br.com.exemplo.todo.api.openapi;

import br.com.exemplo.todo.api.dto.admin.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Administracao de Usuarios", description = "Gerenciamento de usuarios da organizacao")
@SecurityRequirement(name = "bearerAuth")
public interface UserAdminControllerOpenApi {

    @Operation(summary = "Listar usuarios", description = "Lista usuarios da organizacao com filtros e paginacao")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuarios"),
            @ApiResponse(responseCode = "401", description = "Nao autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sem permissao (requer ADMIN)", content = @Content)
    })
    Page<UserAdminOutput> listar(
            @Parameter(description = "Filtrar por status ativo") Boolean ativo,
            @Parameter(description = "Filtrar por papel (ADMIN, MEMBER)") String role,
            @Parameter(description = "Buscar por nome ou email") String search,
            @Parameter(description = "Numero da pagina (0-based)") int page,
            @Parameter(description = "Tamanho da pagina") int size,
            @Parameter(description = "Ordenacao (campo,direcao)") String sort
    );

    @Operation(summary = "Buscar usuario", description = "Busca um usuario pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    UserAdminOutput buscar(@Parameter(description = "ID do usuario") Long userId);

    @Operation(summary = "Criar usuario", description = "Cria um novo usuario na organizacao")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario criado com senha temporaria"),
            @ApiResponse(responseCode = "400", description = "Dados invalidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Email ja cadastrado", content = @Content)
    })
    UserPasswordResetOutput criar(UserAdminInput input);

    @Operation(summary = "Atualizar usuario", description = "Atualiza dados de um usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario atualizado"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Email ja cadastrado", content = @Content)
    })
    UserAdminOutput atualizar(@Parameter(description = "ID do usuario") Long userId, UserUpdateInput input);

    @Operation(summary = "Ativar usuario", description = "Ativa um usuario desativado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario ativado"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    UserAdminOutput ativar(@Parameter(description = "ID do usuario") Long userId);

    @Operation(summary = "Desativar usuario", description = "Desativa um usuario (soft delete)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario desativado"),
            @ApiResponse(responseCode = "400", description = "Nao pode desativar a si mesmo", content = @Content),
            @ApiResponse(responseCode = "403", description = "Nao pode desativar o proprietario", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    UserAdminOutput desativar(@Parameter(description = "ID do usuario") Long userId);

    @Operation(summary = "Alterar papel", description = "Altera o papel de um usuario (apenas OWNER)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Papel alterado"),
            @ApiResponse(responseCode = "403", description = "Sem permissao (requer OWNER)", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    UserAdminOutput alterarRole(@Parameter(description = "ID do usuario") Long userId, UserRoleUpdateInput input);

    @Operation(summary = "Resetar senha", description = "Gera uma nova senha temporaria para o usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Senha resetada"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    UserPasswordResetOutput resetarSenha(@Parameter(description = "ID do usuario") Long userId);

    @Operation(summary = "Desbloquear conta", description = "Desbloqueia a conta de um usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conta desbloqueada"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    UserAdminOutput desbloquearConta(@Parameter(description = "ID do usuario") Long userId);

    @Operation(summary = "Historico de login", description = "Lista as ultimas tentativas de login de um usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Historico de login"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    List<LoginAttemptOutput> historicoLogin(@Parameter(description = "ID do usuario") Long userId);

    @Operation(summary = "Atualizar avatar do usuario", description = "Atualiza a foto de perfil do usuario na organizacao")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Avatar atualizado"),
            @ApiResponse(responseCode = "400", description = "Arquivo invalido", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    UserAdminOutput atualizarAvatar(
            @Parameter(description = "ID do usuario") Long userId,
            @Parameter(description = "Arquivo de avatar (PNG/JPEG/WEBP)", required = true)
            MultipartFile file);

    @Operation(summary = "Remover avatar do usuario", description = "Remove a foto de perfil do usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Avatar removido"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content)
    })
    void removerAvatar(@Parameter(description = "ID do usuario") Long userId);
}

package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.admin.*;
import br.com.exemplo.todo.api.openapi.UserAdminControllerOpenApi;
import br.com.exemplo.todo.domain.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/admin/users", produces = "application/json")
@PreAuthorize("@tenantSecurity.isAdmin()")
public class UserAdminController implements UserAdminControllerOpenApi {

    private final UserAdminService userAdminService;

    @Override
    @GetMapping
    public Page<UserAdminOutput> listar(
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nome,asc") String sort) {

        log.debug("GET /admin/users - ativo={}, role={}, search={}, page={}, size={}",
                ativo, role, search, page, size);

        Pageable pageable = buildPageable(page, size, sort);

        return userAdminService.listarUsuarios(ativo, role, search, pageable);
    }

    @Override
    @GetMapping("/{userId}")
    public UserAdminOutput buscar(@PathVariable Long userId) {
        log.debug("GET /admin/users/{}", userId);
        return userAdminService.buscarUsuario(userId);
    }

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserPasswordResetOutput criar(@RequestBody @Valid UserAdminInput input) {
        log.debug("POST /admin/users - email={}", input.email());
        return userAdminService.criarUsuario(input);
    }

    @Override
    @PutMapping("/{userId}")
    public UserAdminOutput atualizar(@PathVariable Long userId, @RequestBody @Valid UserUpdateInput input) {
        log.debug("PUT /admin/users/{} - nome={}", userId, input.nome());
        return userAdminService.atualizarUsuario(userId, input);
    }

    @Override
    @PatchMapping("/{userId}/ativar")
    public UserAdminOutput ativar(@PathVariable Long userId) {
        log.debug("PATCH /admin/users/{}/ativar", userId);
        return userAdminService.ativarUsuario(userId);
    }

    @Override
    @PatchMapping("/{userId}/desativar")
    public UserAdminOutput desativar(@PathVariable Long userId) {
        log.debug("PATCH /admin/users/{}/desativar", userId);
        return userAdminService.desativarUsuario(userId);
    }

    @Override
    @PatchMapping("/{userId}/role")
    @PreAuthorize("@tenantSecurity.isOwner()")
    public UserAdminOutput alterarRole(@PathVariable Long userId, @RequestBody @Valid UserRoleUpdateInput input) {
        log.debug("PATCH /admin/users/{}/role - role={}", userId, input.role());
        return userAdminService.alterarRole(userId, input);
    }

    @Override
    @PostMapping("/{userId}/reset-password")
    public UserPasswordResetOutput resetarSenha(@PathVariable Long userId) {
        log.debug("POST /admin/users/{}/reset-password", userId);
        return userAdminService.resetarSenha(userId);
    }

    @Override
    @PostMapping("/{userId}/unlock")
    public UserAdminOutput desbloquearConta(@PathVariable Long userId) {
        log.debug("POST /admin/users/{}/unlock", userId);
        return userAdminService.desbloquearConta(userId);
    }

    @Override
    @GetMapping("/{userId}/login-history")
    public List<LoginAttemptOutput> historicoLogin(@PathVariable Long userId) {
        log.debug("GET /admin/users/{}/login-history", userId);
        return userAdminService.listarHistoricoLogin(userId);
    }

    private Pageable buildPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        String property = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;

        String mappedProperty = switch (property) {
            case "email" -> "user.email";
            case "role" -> "papel";
            case "dataCriacao" -> "user.dataCriacao";
            case "ultimoAcesso" -> "user.ultimoAcesso";
            default -> "user.nome";
        };

        return PageRequest.of(page, size, Sort.by(direction, mappedProperty));
    }
}

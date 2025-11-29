package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.auth.*;
import br.com.exemplo.todo.domain.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticacao", description = "Endpoints de autenticacao e gerenciamento de sessao")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Registrar novo usuario",
            description = "Cria uma nova conta de usuario com uma organizacao inicial")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario criado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email ja cadastrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping(value = "/register", produces = "application/json")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterInput input,
            HttpServletRequest request) {

        AuthResponse response = authService.register(input, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Login",
            description = "Autentica um usuario e retorna tokens de acesso")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais invalidas",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "423", description = "Conta bloqueada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping(value = "/login", produces = "application/json")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginInput input,
            HttpServletRequest request) {

        AuthResponse response = authService.login(input, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Renovar tokens",
            description = "Gera novos tokens usando o refresh token atual (rotacao de token)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tokens renovados com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token invalido ou expirado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping(value = "/refresh", produces = "application/json")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenInput input,
            HttpServletRequest request) {

        AuthResponse response = authService.refresh(input, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Logout",
            description = "Revoga o refresh token atual e toda a familia de tokens")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Logout realizado com sucesso")
    })
    @PostMapping(value = "/logout", produces = "application/json")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshTokenInput input) {
        if (input != null) {
            authService.logout(input.refreshToken());
        }
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Solicitar magic link de login",
            description = "Envia um link de login por email. Nao revela se o email existe ou nao.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Magic link enviado (se email existir)")
    })
    @PostMapping(value = "/magic-link", produces = "application/json")
    public ResponseEntity<Void> solicitarMagicLink(
            @Valid @RequestBody MagicLinkLoginInput input,
            HttpServletRequest request) {

        authService.enviarMagicLink(input.email(), request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Login via magic link",
            description = "Confirma o magic link enviado por email e retorna tokens JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Magic link invalido ou expirado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping(value = "/magic-link/confirm", produces = "application/json")
    public ResponseEntity<AuthResponse> confirmarMagicLink(
            @Valid @RequestBody MagicLinkConfirmInput input,
            HttpServletRequest request) {

        AuthResponse response = authService.loginViaMagicLink(input.token(), request);
        return ResponseEntity.ok(response);
    }
}

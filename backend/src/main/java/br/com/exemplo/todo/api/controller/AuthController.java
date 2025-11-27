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
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email ja cadastrado",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping("/register")
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
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais invalidas",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "423", description = "Conta bloqueada",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping("/login")
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
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token invalido ou expirado",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping("/refresh")
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
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshTokenInput input) {
        if (input != null) {
            authService.logout(input.refreshToken());
        }
        return ResponseEntity.noContent().build();
    }
}

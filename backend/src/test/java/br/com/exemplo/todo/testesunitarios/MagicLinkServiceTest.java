package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.dto.auth.AuthResponse;
import br.com.exemplo.todo.config.AuthProperties;
import br.com.exemplo.todo.config.JwtConfig;
import br.com.exemplo.todo.domain.exception.AccountLockedException;
import br.com.exemplo.todo.domain.exception.InvalidCredentialsException;
import br.com.exemplo.todo.domain.model.entity.Account;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.repository.*;
import br.com.exemplo.todo.domain.service.AuthService;
import br.com.exemplo.todo.domain.service.EmailService;
import br.com.exemplo.todo.infrastructure.email.EmailTemplateService;
import br.com.exemplo.todo.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

class MagicLinkServiceTest {

    private UserRepository userRepository;
    private AccountRepository accountRepository;
    private OrganizationRepository organizationRepository;
    private MembershipRepository membershipRepository;
    private RefreshTokenRepository refreshTokenRepository;
    private LoginAttemptRepository loginAttemptRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private JwtConfig jwtConfig;
    private EmailService emailService;
    private EmailTemplateService emailTemplateService;
    private AuthProperties authProperties;
    private AuthService authService;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        accountRepository = mock(AccountRepository.class);
        organizationRepository = mock(OrganizationRepository.class);
        membershipRepository = mock(MembershipRepository.class);
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        loginAttemptRepository = mock(LoginAttemptRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        jwtConfig = mock(JwtConfig.class);
        emailService = mock(EmailService.class);
        emailTemplateService = mock(EmailTemplateService.class);
        authProperties = new AuthProperties();
        authProperties.setBaseUrl("http://localhost:4200/auth/magic-link");

        // Configuração do JwtConfig
        JwtConfig.AccessToken accessToken = new JwtConfig.AccessToken();
        accessToken.setExpirationMs(900000L);
        JwtConfig.RefreshToken refreshToken = new JwtConfig.RefreshToken();
        refreshToken.setExpirationDays(30);
        JwtConfig.MagicLink magicLink = new JwtConfig.MagicLink();
        magicLink.setExpirationMinutes(15);
        given(jwtConfig.getAccessToken()).willReturn(accessToken);
        given(jwtConfig.getRefreshToken()).willReturn(refreshToken);
        given(jwtConfig.getMagicLink()).willReturn(magicLink);

        // Mock do template service para retornar HTML simples
        given(emailTemplateService.processTemplate(anyString(), anyMap())).willReturn("<html>Magic Link Email</html>");

        authService = new AuthService(
                userRepository,
                accountRepository,
                organizationRepository,
                membershipRepository,
                refreshTokenRepository,
                loginAttemptRepository,
                passwordEncoder,
                jwtService,
                jwtConfig,
                emailService,
                emailTemplateService,
                authProperties
        );

        request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("User-Agent", "Mozilla/5.0 Test");
    }

    @Nested
    class EnviarMagicLink {

        @Test
        void deveEnviarEmailQuandoUsuarioExiste() {
            User user = criarUser(1L, "usuario@teste.com");
            given(userRepository.findByEmail("usuario@teste.com")).willReturn(Optional.of(user));
            given(jwtService.generateMagicLoginToken(user)).willReturn("magic-token-123");

            authService.enviarMagicLink("usuario@teste.com", request);

            // Verifica que o template foi processado com os parametros corretos
            verify(emailTemplateService).processTemplate(eq("magic-link.html"), anyMap());

            // Verifica que o email foi enviado
            verify(emailService).send(
                    eq("usuario@teste.com"),
                    eq("Seu link de acesso - Linve"),
                    anyString()
            );
        }

        @Test
        void naoDeveEnviarEmailQuandoUsuarioNaoExiste() {
            given(userRepository.findByEmail("inexistente@teste.com")).willReturn(Optional.empty());

            authService.enviarMagicLink("inexistente@teste.com", request);

            verify(emailService, never()).send(anyString(), anyString(), anyString());
        }

        @Test
        void naoDeveFazerNadaQuandoEmailVazio() {
            authService.enviarMagicLink("", request);

            verify(userRepository, never()).findByEmail(anyString());
            verify(emailService, never()).send(anyString(), anyString(), anyString());
        }

        @Test
        void naoDeveFazerNadaQuandoEmailNulo() {
            authService.enviarMagicLink(null, request);

            verify(userRepository, never()).findByEmail(anyString());
            verify(emailService, never()).send(anyString(), anyString(), anyString());
        }
    }

    @Nested
    class LoginViaMagicLink {

        @Test
        void deveRealizarLoginQuandoTokenValido() {
            User user = criarUser(1L, "usuario@teste.com");
            Claims claims = criarClaims(1L, "usuario@teste.com");

            given(jwtService.validateMagicLoginToken("token-valido")).willReturn(Optional.of(claims));
            given(jwtService.extractUserId(claims)).willReturn(1L);
            given(userRepository.findById(1L)).willReturn(Optional.of(user));
            given(accountRepository.findByUserIdAndProvider(1L, "local")).willReturn(Optional.empty());
            given(membershipRepository.findByUserIdAndAtivoTrueOrderByDataIngressoAsc(1L)).willReturn(Collections.emptyList());
            given(jwtService.generateAccessToken(user)).willReturn("access-token");
            given(jwtService.generateRefreshToken()).willReturn("refresh-token");
            given(jwtService.hashToken("refresh-token")).willReturn("hashed-refresh-token");

            AuthResponse response = authService.loginViaMagicLink("token-valido", request);

            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.refreshToken()).isEqualTo("refresh-token");
            assertThat(response.user().email()).isEqualTo("usuario@teste.com");
            verify(loginAttemptRepository).save(argThat(attempt ->
                    attempt.getSucesso() && "MAGIC_LINK".equals(attempt.getMotivoFalha())
            ));
        }

        @Test
        void deveLancarExcecaoQuandoTokenInvalido() {
            given(jwtService.validateMagicLoginToken("token-invalido")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.loginViaMagicLink("token-invalido", request))
                    .isInstanceOf(InvalidCredentialsException.class)
                    .hasMessage("Magic link invalido ou expirado");
        }

        @Test
        void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
            Claims claims = criarClaims(999L, "usuario@teste.com");

            given(jwtService.validateMagicLoginToken("token-usuario-inexistente")).willReturn(Optional.of(claims));
            given(jwtService.extractUserId(claims)).willReturn(999L);
            given(userRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.loginViaMagicLink("token-usuario-inexistente", request))
                    .isInstanceOf(InvalidCredentialsException.class)
                    .hasMessage("Usuario nao encontrado para magic link");
        }

        @Test
        void deveLancarExcecaoQuandoContaBloqueada() {
            User user = criarUser(1L, "usuario@teste.com");
            Account account = criarAccount(user, true);
            Claims claims = criarClaims(1L, "usuario@teste.com");

            given(jwtService.validateMagicLoginToken("token-bloqueado")).willReturn(Optional.of(claims));
            given(jwtService.extractUserId(claims)).willReturn(1L);
            given(userRepository.findById(1L)).willReturn(Optional.of(user));
            given(accountRepository.findByUserIdAndProvider(1L, "local")).willReturn(Optional.of(account));

            assertThatThrownBy(() -> authService.loginViaMagicLink("token-bloqueado", request))
                    .isInstanceOf(AccountLockedException.class);
        }

        @Test
        void deveLancarExcecaoQuandoUsuarioInativo() {
            User user = criarUser(1L, "usuario@teste.com");
            user.setAtivo(false);
            Claims claims = criarClaims(1L, "usuario@teste.com");

            given(jwtService.validateMagicLoginToken("token-inativo")).willReturn(Optional.of(claims));
            given(jwtService.extractUserId(claims)).willReturn(1L);
            given(userRepository.findById(1L)).willReturn(Optional.of(user));
            given(accountRepository.findByUserIdAndProvider(1L, "local")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.loginViaMagicLink("token-inativo", request))
                    .isInstanceOf(InvalidCredentialsException.class)
                    .hasMessage("Usuario inativo");
        }

        @Test
        void deveRetornarSenhaExpiradaQuandoAccountTemSenhaExpirada() {
            User user = criarUser(1L, "usuario@teste.com");
            Account account = criarAccount(user, false);
            account.setSenhaExpirada(true);
            Claims claims = criarClaims(1L, "usuario@teste.com");

            given(jwtService.validateMagicLoginToken("token-senha-expirada")).willReturn(Optional.of(claims));
            given(jwtService.extractUserId(claims)).willReturn(1L);
            given(userRepository.findById(1L)).willReturn(Optional.of(user));
            given(accountRepository.findByUserIdAndProvider(1L, "local")).willReturn(Optional.of(account));
            given(membershipRepository.findByUserIdAndAtivoTrueOrderByDataIngressoAsc(1L)).willReturn(Collections.emptyList());
            given(jwtService.generateAccessToken(user)).willReturn("access-token");
            given(jwtService.generateRefreshToken()).willReturn("refresh-token");
            given(jwtService.hashToken("refresh-token")).willReturn("hashed-refresh-token");

            AuthResponse response = authService.loginViaMagicLink("token-senha-expirada", request);

            assertThat(response.senhaExpirada()).isTrue();
        }
    }

    private User criarUser(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setNome("Usuario Teste");
        user.setEmail(email);
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
        return user;
    }

    private Account criarAccount(User user, boolean bloqueado) {
        Account account = new Account();
        account.setUser(user);
        account.setProvider("local");
        account.setSenhaHash("hash");
        account.setBloqueado(bloqueado);
        account.setTentativasFalha(0);
        account.setSenhaExpirada(false);
        return account;
    }

    private Claims criarClaims(Long userId, String email) {
        return Jwts.claims()
                .subject(userId.toString())
                .add("email", email)
                .add("tipo", "MAGIC_LOGIN")
                .build();
    }
}

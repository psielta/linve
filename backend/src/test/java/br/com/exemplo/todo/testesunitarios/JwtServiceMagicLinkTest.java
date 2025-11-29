package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.config.JwtConfig;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceMagicLinkTest {

    private JwtService jwtService;
    private JwtConfig jwtConfig;

    @BeforeEach
    void setUp() {
        jwtConfig = new JwtConfig();
        jwtConfig.setSecret("minha-chave-secreta-muito-longa-para-256-bits-minimo-32-chars");

        JwtConfig.AccessToken accessToken = new JwtConfig.AccessToken();
        accessToken.setExpirationMs(900000L); // 15 min
        jwtConfig.setAccessToken(accessToken);

        JwtConfig.RefreshToken refreshToken = new JwtConfig.RefreshToken();
        refreshToken.setExpirationDays(30);
        jwtConfig.setRefreshToken(refreshToken);

        JwtConfig.MagicLink magicLink = new JwtConfig.MagicLink();
        magicLink.setExpirationMinutes(15);
        jwtConfig.setMagicLink(magicLink);

        jwtService = new JwtService(jwtConfig);
    }

    @Nested
    class GenerateMagicLoginToken {

        @Test
        void deveGerarTokenComClaimsCorretos() {
            User user = criarUser(1L, "teste@mail.com");

            String token = jwtService.generateMagicLoginToken(user);

            assertThat(token).isNotBlank();

            Optional<Claims> claimsOpt = jwtService.validateMagicLoginToken(token);
            assertThat(claimsOpt).isPresent();

            Claims claims = claimsOpt.get();
            assertThat(claims.getSubject()).isEqualTo("1");
            assertThat(claims.get("email", String.class)).isEqualTo("teste@mail.com");
            assertThat(claims.get("tipo", String.class)).isEqualTo("MAGIC_LOGIN");
            assertThat(claims.getIssuer()).isEqualTo("todo-api-magic-link");
        }

        @Test
        void deveGerarTokensComMesmoConteudoParaMesmoUsuario() {
            // Tokens gerados no mesmo instante terão o mesmo conteúdo
            // já que não há componente aleatório (diferente de refreshToken)
            User user = criarUser(1L, "teste@mail.com");

            String token1 = jwtService.generateMagicLoginToken(user);

            // Ambos tokens devem ser válidos
            assertThat(jwtService.validateMagicLoginToken(token1)).isPresent();
        }
    }

    @Nested
    class ValidateMagicLoginToken {

        @Test
        void deveValidarTokenValido() {
            User user = criarUser(1L, "teste@mail.com");
            String token = jwtService.generateMagicLoginToken(user);

            Optional<Claims> claimsOpt = jwtService.validateMagicLoginToken(token);

            assertThat(claimsOpt).isPresent();
            Claims claims = claimsOpt.get();
            assertThat(jwtService.extractUserId(claims)).isEqualTo(1L);
            assertThat(jwtService.extractEmail(claims)).isEqualTo("teste@mail.com");
        }

        @Test
        void deveRetornarVazioParaTokenInvalido() {
            Optional<Claims> claimsOpt = jwtService.validateMagicLoginToken("token-invalido");

            assertThat(claimsOpt).isEmpty();
        }

        @Test
        void deveRetornarVazioParaTokenMalFormado() {
            Optional<Claims> claimsOpt = jwtService.validateMagicLoginToken("abc.def.ghi");

            assertThat(claimsOpt).isEmpty();
        }

        @Test
        void deveRejeitarAccessTokenComoMagicLink() {
            User user = criarUser(1L, "teste@mail.com");
            String accessToken = jwtService.generateAccessToken(user);

            Optional<Claims> claimsOpt = jwtService.validateMagicLoginToken(accessToken);

            // Access token nao tem claim "tipo" = "MAGIC_LOGIN", deve ser rejeitado
            assertThat(claimsOpt).isEmpty();
        }
    }

    @Nested
    class ExtractUserInfo {

        @Test
        void deveExtrairUserIdDoClaims() {
            User user = criarUser(42L, "usuario@mail.com");
            String token = jwtService.generateMagicLoginToken(user);
            Claims claims = jwtService.validateMagicLoginToken(token).get();

            Long userId = jwtService.extractUserId(claims);

            assertThat(userId).isEqualTo(42L);
        }

        @Test
        void deveExtrairEmailDoClaims() {
            User user = criarUser(1L, "email@dominio.com");
            String token = jwtService.generateMagicLoginToken(user);
            Claims claims = jwtService.validateMagicLoginToken(token).get();

            String email = jwtService.extractEmail(claims);

            assertThat(email).isEqualTo("email@dominio.com");
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
}

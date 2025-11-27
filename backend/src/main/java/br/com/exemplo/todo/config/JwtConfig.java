package br.com.exemplo.todo.config;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Configuracoes de JWT carregadas do application.yml.
 */
@Configuration
@ConfigurationProperties(prefix = "security.jwt")
@Validated
@Getter
@Setter
public class JwtConfig {

    @NotBlank
    @Size(min = 32, message = "JWT secret deve ter pelo menos 32 caracteres (256 bits)")
    private String secret;

    private AccessToken accessToken = new AccessToken();
    private RefreshToken refreshToken = new RefreshToken();

    @Getter
    @Setter
    public static class AccessToken {
        private long expirationMs = 900000; // 15 minutos
    }

    @Getter
    @Setter
    public static class RefreshToken {
        private int expirationDays = 30;
    }

    /**
     * Retorna a chave secreta para assinatura HS256.
     */
    public SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}

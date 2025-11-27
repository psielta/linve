package br.com.exemplo.todo.security;

import br.com.exemplo.todo.config.JwtConfig;
import br.com.exemplo.todo.domain.model.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.Optional;

/**
 * Servico para geracao e validacao de tokens JWT.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    private final JwtConfig jwtConfig;

    /**
     * Gera access token JWT.
     */
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(jwtConfig.getAccessToken().getExpirationMs());

        return Jwts.builder()
                .header()
                    .type("JWT")
                    .and()
                .subject(user.getId().toString())
                .issuer("todo-api")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .claim("email", user.getEmail())
                .claim("nome", user.getNome())
                .signWith(jwtConfig.getSecretKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Gera refresh token (string opaca aleatoria).
     */
    public String generateRefreshToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Gera hash SHA-256 do token para armazenamento seguro.
     */
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 nao disponivel", e);
        }
    }

    /**
     * Valida e extrai claims do access token.
     * @return Optional vazio se token invalido
     * @throws ExpiredJwtException se token expirado (para tratamento especifico)
     */
    public Optional<Claims> validateAccessToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(jwtConfig.getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (ExpiredJwtException e) {
            log.debug("Token JWT expirado: {}", e.getMessage());
            throw e;
        } catch (JwtException e) {
            log.warn("Token JWT invalido: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Extrai user ID do token.
     */
    public Long extractUserId(Claims claims) {
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extrai email do token.
     */
    public String extractEmail(Claims claims) {
        return claims.get("email", String.class);
    }

    /**
     * Extrai nome do token.
     */
    public String extractNome(Claims claims) {
        return claims.get("nome", String.class);
    }

    /**
     * Retorna tempo de expiracao do access token em segundos.
     */
    public long getAccessTokenExpirationSeconds() {
        return jwtConfig.getAccessToken().getExpirationMs() / 1000;
    }

    /**
     * Retorna dias de expiracao do refresh token.
     */
    public int getRefreshTokenExpirationDays() {
        return jwtConfig.getRefreshToken().getExpirationDays();
    }
}

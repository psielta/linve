package br.com.exemplo.todo.domain.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Entidade que armazena refresh tokens para renovacao de access tokens.
 * Tokens sao armazenados como hash SHA-256 por seguranca.
 * Usa o conceito de "familia" para detectar roubo de tokens.
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "REFRESH_TOKEN")
public class RefreshToken {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RT_ID")
    private Long id;

    @NotNull
    @Column(name = "RT_TOKEN_HASH", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "RT_USR_ID", nullable = false)
    private User user;

    @NotNull
    @Column(name = "RT_DATA_EXPIRACAO", nullable = false)
    private LocalDateTime dataExpiracao;

    @NotNull
    @Column(name = "RT_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "RT_REVOGADO")
    private Boolean revogado = false;

    @Column(name = "RT_DATA_REVOGACAO")
    private LocalDateTime dataRevogacao;

    @NotNull
    @Column(name = "RT_FAMILIA_ID", nullable = false, length = 36)
    private String familiaId;

    @Column(name = "RT_DEVICE_INFO", length = 255)
    private String deviceInfo;

    @Column(name = "RT_IP_ADDRESS", length = 45)
    private String ipAddress;

    /**
     * Verifica se o token esta expirado.
     */
    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(this.dataExpiracao);
    }

    /**
     * Verifica se o token e valido (nao revogado e nao expirado).
     */
    public boolean isValido() {
        return !Boolean.TRUE.equals(this.revogado) && !isExpirado();
    }

    /**
     * Revoga o token.
     */
    public void revogar() {
        this.revogado = true;
        this.dataRevogacao = LocalDateTime.now();
    }
}

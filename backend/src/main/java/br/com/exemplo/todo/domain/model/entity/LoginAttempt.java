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
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade que registra tentativas de login para auditoria.
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@NoArgsConstructor
@Entity
@Table(name = "LOGIN_ATTEMPT")
public class LoginAttempt {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LGA_ID")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "LGA_USR_ID", nullable = false)
    private User user;

    @NotNull
    @Column(name = "LGA_SUCESSO", nullable = false)
    private Boolean sucesso;

    @Column(name = "LGA_IP_ADDRESS", length = 45)
    private String ipAddress;

    @Column(name = "LGA_USER_AGENT", length = 500)
    private String userAgent;

    @Column(name = "LGA_MOTIVO_FALHA", length = 50)
    private String motivoFalha;

    @NotNull
    @Column(name = "LGA_DATA_TENTATIVA", nullable = false)
    private LocalDateTime dataTentativa;

    public LoginAttempt(User user, Boolean sucesso, String ipAddress, String userAgent, String motivoFalha) {
        this.user = user;
        this.sucesso = sucesso;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.motivoFalha = motivoFalha;
        this.dataTentativa = LocalDateTime.now();
    }
}

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
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Entidade que armazena credenciais de autenticacao do usuario.
 * Suporta multiplos provedores (local, google, github, etc).
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "ACCOUNT", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ACC_USR_ID", "ACC_PROVIDER"})
})
public class Account {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACC_ID")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ACC_USR_ID", nullable = false)
    private User user;

    @NotNull
    @Column(name = "ACC_PROVIDER", nullable = false, length = 20)
    private String provider = "local";

    @Column(name = "ACC_SENHA_HASH", length = 255)
    private String senhaHash;

    @Column(name = "ACC_BLOQUEADO")
    private Boolean bloqueado = false;

    @Column(name = "ACC_TENTATIVAS_FALHA")
    private Integer tentativasFalha = 0;

    @Column(name = "ACC_DATA_BLOQUEIO")
    private LocalDateTime dataBloqueio;

    @NotNull
    @Column(name = "ACC_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "ACC_DATA_ALTERACAO_SENHA")
    private LocalDateTime dataAlteracaoSenha;

    /**
     * Incrementa contador de tentativas falhas.
     * @return true se a conta deve ser bloqueada (5+ tentativas)
     */
    public boolean incrementarTentativasFalha() {
        this.tentativasFalha = (this.tentativasFalha == null ? 0 : this.tentativasFalha) + 1;
        return this.tentativasFalha >= 5;
    }

    /**
     * Reseta contador de tentativas falhas apos login bem-sucedido.
     */
    public void resetarTentativasFalha() {
        this.tentativasFalha = 0;
    }

    /**
     * Bloqueia a conta.
     */
    public void bloquear() {
        this.bloqueado = true;
        this.dataBloqueio = LocalDateTime.now();
    }

    /**
     * Desbloqueia a conta.
     */
    public void desbloquear() {
        this.bloqueado = false;
        this.dataBloqueio = null;
        this.tentativasFalha = 0;
    }
}

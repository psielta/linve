package br.com.exemplo.todo.domain.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Entidade que representa um Usuario no sistema.
 * Usuarios podem pertencer a multiplas organizacoes atraves de Memberships.
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "USUARIO")
public class User {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USR_ID")
    private Long id;

    @NotNull
    @Column(name = "USR_NOME", nullable = false, length = 150)
    private String nome;

    @NotNull
    @Column(name = "USR_EMAIL", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "USR_ATIVO")
    private Boolean ativo = true;

    @NotNull
    @Column(name = "USR_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "USR_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;

    @Column(name = "USR_ULTIMO_ACESSO")
    private LocalDateTime ultimoAcesso;

    @Column(name = "USR_AVATAR", length = 500)
    private String avatar;
}

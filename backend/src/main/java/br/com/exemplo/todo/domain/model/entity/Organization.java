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
 * Entidade que representa uma Organizacao no sistema multi-tenant.
 * Usuarios pertencem a organizacoes atraves de Memberships.
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "ORGANIZATION")
public class Organization {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORG_ID")
    private Long id;

    @NotNull
    @Column(name = "ORG_NOME", nullable = false, length = 100)
    private String nome;

    @NotNull
    @Column(name = "ORG_SLUG", nullable = false, unique = true, length = 50)
    private String slug;

    @Column(name = "ORG_LOGO", length = 500)
    private String logo;

    @Column(name = "ORG_ATIVA")
    private Boolean ativa = true;

    @NotNull
    @Column(name = "ORG_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "ORG_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;
}

package br.com.exemplo.todo.domain.model.entity;

import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Entidade que representa o vinculo entre Usuario e Organizacao.
 * Cada membership define o papel (role) do usuario dentro da organizacao.
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "MEMBERSHIP", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"MBR_USR_ID", "MBR_ORG_ID"})
})
public class Membership {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MBR_ID")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MBR_USR_ID", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MBR_ORG_ID", nullable = false)
    private Organization organization;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "MBR_PAPEL", nullable = false, length = 20)
    private MembershipRole papel;

    @Column(name = "MBR_ATIVO")
    private Boolean ativo = true;

    @NotNull
    @Column(name = "MBR_DATA_INGRESSO", nullable = false)
    private LocalDateTime dataIngresso;

    @Column(name = "MBR_CONVIDADO_POR")
    private Long convidadoPor;
}

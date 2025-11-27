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

@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "TODO")
public class Todo {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TODO_ID")
    private Long id;

    @NotNull
    @Column(name = "TODO_TITULO", nullable = false)
    private String titulo;

    @Column(name = "TODO_DESCRICAO")
    private String descricao;

    @Column(name = "TODO_CONCLUIDO")
    private Boolean concluido = false;

    @NotNull
    @Column(name = "TODO_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "TODO_DATA_CONCLUSAO")
    private LocalDateTime dataConclusao;

    // Multi-tenancy fields
    @Column(name = "TODO_ORG_ID")
    private Long organizationId;

    @Column(name = "TODO_CRIADO_POR")
    private Long criadoPor;

}

package br.com.exemplo.todo.domain.model.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "PRODUTO")
public class Produto {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRD_ID")
    private Long id;

    @Column(name = "PRD_ORG_ID", nullable = false)
    private Long organizationId;

    @Column(name = "PRD_CAT_ID", nullable = false)
    private Long categoriaId;

    @Column(name = "PRD_NOME", nullable = false, length = 150)
    private String nome;

    @Column(name = "PRD_DESCRICAO")
    private String descricao;

    @Column(name = "PRD_ATIVO", nullable = false)
    private Boolean ativo = true;

    @Column(name = "PRD_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "PRD_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;

    @Column(name = "PRD_CRIADO_POR")
    private Long criadoPor;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = false)
    private List<ProdutoPreco> precos = new ArrayList<>();
}


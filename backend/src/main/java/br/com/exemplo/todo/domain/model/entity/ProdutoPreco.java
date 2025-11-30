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
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "PRODUTO_PRECO")
public class ProdutoPreco {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRP_ID")
    private Long id;

    @Column(name = "PRP_ORG_ID", nullable = false)
    private Long organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRP_PRD_ID", nullable = false)
    private Produto produto;

    @Column(name = "PRP_CATOP_ID", nullable = false)
    private Long categoriaOpcaoId;

    @Column(name = "PRP_VALOR", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "PRP_ATIVO", nullable = false)
    private Boolean ativo = true;

    @Column(name = "PRP_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "PRP_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;
}


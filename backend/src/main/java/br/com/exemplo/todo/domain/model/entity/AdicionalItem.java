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
@Table(name = "ADICIONAL_ITEM")
public class AdicionalItem {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AIT_ID")
    private Long id;

    @Column(name = "AIT_ORG_ID", nullable = false)
    private Long organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AIT_ADC_ID", nullable = false)
    private Adicional adicional;

    @Column(name = "AIT_NOME", nullable = false, length = 150)
    private String nome;

    @Column(name = "AIT_VALOR", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "AIT_ATIVO", nullable = false)
    private Boolean ativo = true;

    @Column(name = "AIT_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "AIT_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;
}


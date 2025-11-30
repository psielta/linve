package br.com.exemplo.todo.domain.model.entity;

import br.com.exemplo.todo.domain.model.enums.SelecaoAdicional;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "ADICIONAL")
public class Adicional {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ADC_ID")
    private Long id;

    @Column(name = "ADC_ORG_ID", nullable = false)
    private Long organizationId;

    @Column(name = "ADC_CAT_ID", nullable = false)
    private Long categoriaId;

    @Column(name = "ADC_NOME", nullable = false, length = 150)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "ADC_SELECAO", nullable = false, length = 1)
    private SelecaoAdicional selecao;

    @Column(name = "ADC_MINIMO")
    private Integer minimo;

    @Column(name = "ADC_LIMITE")
    private Integer limite;

    @Column(name = "ADC_ATIVO", nullable = false)
    private Boolean ativo = true;

    @Column(name = "ADC_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "ADC_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;

    @Column(name = "ADC_CRIADO_POR")
    private Long criadoPor;

    @OneToMany(mappedBy = "adicional", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = false)
    private List<AdicionalItem> itens = new ArrayList<>();
}


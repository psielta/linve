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
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "CATEGORIA")
public class Categoria {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CAT_ID")
    private Long id;

    @NotNull
    @Column(name = "CAT_ORG_ID", nullable = false)
    private Long organizationId;

    @NotNull
    @Column(name = "CAT_CUL_ID", nullable = false)
    private Integer culinariaId;

    @Column(name = "CAT_ORDEM")
    private Integer ordem;

    @NotNull
    @Column(name = "CAT_NOME", nullable = false, length = 150)
    private String nome;

    @Column(name = "CAT_DESCRICAO")
    private String descricao;

    @Column(name = "CAT_INICIO")
    private String inicio;

    @Column(name = "CAT_FIM")
    private String fim;

    @Column(name = "CAT_ATIVO")
    private Boolean ativo = true;

    @Column(name = "CAT_OPCAO_MEIA", nullable = false, length = 1)
    private String opcaoMeia = "";

    @Column(name = "CAT_DISP_DOMINGO")
    private Boolean disponivelDomingo = true;

    @Column(name = "CAT_DISP_SEGUNDA")
    private Boolean disponivelSegunda = true;

    @Column(name = "CAT_DISP_TERCA")
    private Boolean disponivelTerca = true;

    @Column(name = "CAT_DISP_QUARTA")
    private Boolean disponivelQuarta = true;

    @Column(name = "CAT_DISP_QUINTA")
    private Boolean disponivelQuinta = true;

    @Column(name = "CAT_DISP_SEXTA")
    private Boolean disponivelSexta = true;

    @Column(name = "CAT_DISP_SABADO")
    private Boolean disponivelSabado = true;

    @NotNull
    @Column(name = "CAT_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "CAT_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;

    @Column(name = "CAT_CRIADO_POR")
    private Long criadoPor;

    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CategoriaOpcao> opcoes = new ArrayList<>();
}


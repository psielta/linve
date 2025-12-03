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
@Table(name = "CLIENTE")
public class Cliente {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CLI_ID")
    private Long id;

    @NotNull
    @Column(name = "CLI_ORG_ID", nullable = false)
    private Long organizationId;

    @NotNull
    @Column(name = "CLI_NOME", nullable = false, length = 200)
    private String nome;

    @Column(name = "CLI_TEL_1", length = 20)
    private String tel1;

    @Column(name = "CLI_TEL_2", length = 20)
    private String tel2;

    @Column(name = "CLI_TEL_3", length = 20)
    private String tel3;

    @Column(name = "CLI_DOCUMENTO", length = 20)
    private String documento;

    @Column(name = "CLI_ATIVO", nullable = false)
    private Boolean ativo = true;

    @NotNull
    @Column(name = "CLI_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "CLI_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;

    @Column(name = "CLI_CRIADO_POR")
    private Long criadoPor;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ClienteEndereco> enderecos = new ArrayList<>();
}

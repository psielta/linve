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
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
@Entity
@Table(name = "CLIENTE_ENDERECO")
public class ClienteEndereco {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "END_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "END_CLI_ID", nullable = false)
    private Cliente cliente;

    @NotNull
    @Column(name = "END_ORG_ID", nullable = false)
    private Long organizationId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "END_MUNI_CD", nullable = false)
    private Municipio municipio;

    @Column(name = "END_CEP", length = 10)
    private String cep;

    @Column(name = "END_BAIRRO", length = 100)
    private String bairro;

    @Column(name = "END_RUA", length = 200)
    private String rua;

    @Column(name = "END_NUM", length = 20)
    private String num;

    @Column(name = "END_COMPLEMENTO", length = 100)
    private String complemento;

    @Column(name = "END_PONTO_REFERENCIA", length = 200)
    private String pontoReferencia;

    @Column(name = "END_ATIVO", nullable = false)
    private Boolean ativo = true;

    @NotNull
    @Column(name = "END_DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "END_DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;
}

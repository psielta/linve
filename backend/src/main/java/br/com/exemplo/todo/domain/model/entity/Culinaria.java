package br.com.exemplo.todo.domain.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "CULINARIA")
public class Culinaria {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "CUL_ID")
    private Integer id;

    @Column(name = "CUL_NOME", nullable = false, length = 100)
    private String nome;

    @Column(name = "CUL_MEIO_MEIO", nullable = false)
    private Boolean meioMeio;
}

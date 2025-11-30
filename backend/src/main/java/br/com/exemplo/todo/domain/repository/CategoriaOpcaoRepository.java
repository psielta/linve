package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.CategoriaOpcao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaOpcaoRepository extends JpaRepository<CategoriaOpcao, Long> {

    List<CategoriaOpcao> findByCategoriaIdAndAtivoTrueOrderByNomeAsc(Long categoriaId);

    Optional<CategoriaOpcao> findByIdAndCategoriaId(Long id, Long categoriaId);

    boolean existsByCategoriaIdAndNomeIgnoreCaseAndAtivoTrue(Long categoriaId, String nome);
}


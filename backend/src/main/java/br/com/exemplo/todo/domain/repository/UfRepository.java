package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Uf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UfRepository extends JpaRepository<Uf, Long> {

    Optional<Uf> findBySiglaIgnoreCase(String sigla);

    List<Uf> findAllByOrderBySiglaAsc();
}

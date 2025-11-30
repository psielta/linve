package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Municipio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MunicipioRepository extends JpaRepository<Municipio, Long> {

    List<Municipio> findByUfSiglaIgnoreCaseOrderByNomeAsc(String siglaUf);

    List<Municipio> findAllByOrderByNomeAsc();
}

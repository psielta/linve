package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Culinaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CulinariaRepository extends JpaRepository<Culinaria, Integer> {

    List<Culinaria> findAllByOrderByNomeAsc();

    List<Culinaria> findByMeioMeioTrueOrderByNomeAsc();
}

package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    /**
     * Busca todas as tarefas filtrando por status de conclusão,
     * ordenadas por data de criação (mais recentes primeiro).
     *
     * @param concluido status de conclusão (true = concluídas, false = pendentes)
     * @return lista de tarefas filtradas
     */
    List<Todo> findByConcluidoOrderByDataCriacaoDesc(Boolean concluido);

    /**
     * Busca todas as tarefas ordenadas por data de criação (mais recentes primeiro).
     *
     * @return lista de todas as tarefas
     */
    List<Todo> findAllByOrderByDataCriacaoDesc();

}

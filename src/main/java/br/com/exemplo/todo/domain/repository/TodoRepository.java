package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para acesso a dados de Todo com suporte a multi-tenancy.
 * IMPORTANTE: Todas as consultas devem filtrar por organizationId para
 * garantir isolamento de dados entre organizacoes.
 */
@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // ==================== CONSULTAS COM TENANT (USAR ESTAS) ====================

    /**
     * Busca todas as tarefas de uma organizacao ordenadas por data de criacao.
     */
    List<Todo> findByOrganizationIdOrderByDataCriacaoDesc(Long organizationId);

    /**
     * Busca tarefas de uma organizacao filtrando por status de conclusao.
     */
    List<Todo> findByOrganizationIdAndConcluidoOrderByDataCriacaoDesc(Long organizationId, Boolean concluido);

    /**
     * Busca tarefa por ID dentro de uma organizacao (isolamento de tenant).
     */
    Optional<Todo> findByIdAndOrganizationId(Long id, Long organizationId);

    /**
     * Verifica se tarefa existe dentro de uma organizacao.
     */
    boolean existsByIdAndOrganizationId(Long id, Long organizationId);

    /**
     * Conta tarefas de uma organizacao.
     */
    long countByOrganizationId(Long organizationId);

    /**
     * Conta tarefas de uma organizacao por status.
     */
    long countByOrganizationIdAndConcluido(Long organizationId, Boolean concluido);

    // ==================== CONSULTAS LEGADAS (DEPRECADAS) ====================

    /**
     * @deprecated Use findByOrganizationIdAndConcluidoOrderByDataCriacaoDesc para multi-tenancy.
     */
    @Deprecated
    List<Todo> findByConcluidoOrderByDataCriacaoDesc(Boolean concluido);

    /**
     * @deprecated Use findByOrganizationIdOrderByDataCriacaoDesc para multi-tenancy.
     */
    @Deprecated
    List<Todo> findAllByOrderByDataCriacaoDesc();

}

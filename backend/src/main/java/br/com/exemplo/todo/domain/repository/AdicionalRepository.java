package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Adicional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdicionalRepository extends JpaRepository<Adicional, Long> {

    @EntityGraph(attributePaths = "itens")
    List<Adicional> findByOrganizationIdAndAtivoTrueOrderByNomeAsc(Long organizationId);

    @EntityGraph(attributePaths = "itens")
    List<Adicional> findByOrganizationIdAndCategoriaIdAndAtivoTrueOrderByNomeAsc(Long organizationId, Long categoriaId);

    @EntityGraph(attributePaths = "itens")
    Optional<Adicional> findByIdAndOrganizationIdAndAtivoTrue(Long id, Long organizationId);

    boolean existsByIdAndOrganizationIdAndAtivoTrue(Long id, Long organizationId);

    @Modifying
    @Query("update Adicional a set a.ativo = false where a.organizationId = :orgId and a.categoriaId = :categoriaId")
    void softDeleteByCategoria(Long orgId, Long categoriaId);
}


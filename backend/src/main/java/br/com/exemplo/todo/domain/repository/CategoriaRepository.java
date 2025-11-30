package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Categoria;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    @EntityGraph(attributePaths = "opcoes")
    List<Categoria> findByOrganizationIdAndAtivoTrueOrderByOrdemAscNomeAsc(Long organizationId);

    @EntityGraph(attributePaths = "opcoes")
    List<Categoria> findByOrganizationIdAndAtivoTrueAndCulinariaIdOrderByOrdemAscNomeAsc(
            Long organizationId, Integer culinariaId);

    @EntityGraph(attributePaths = "opcoes")
    Optional<Categoria> findByIdAndOrganizationIdAndAtivoTrue(Long id, Long organizationId);

    boolean existsByOrganizationIdAndOrdemAndAtivoTrue(Long organizationId, Integer ordem);

    Optional<Categoria> findByOrganizationIdAndOrdemAndAtivoTrue(Long organizationId, Integer ordem);
}

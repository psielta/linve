package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository para acesso a dados de Organization.
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    /**
     * Busca organizacao pelo slug.
     */
    Optional<Organization> findBySlug(String slug);

    /**
     * Verifica se existe organizacao com o slug.
     */
    boolean existsBySlug(String slug);

    /**
     * Busca organizacao ativa pelo slug.
     */
    Optional<Organization> findBySlugAndAtivaTrue(String slug);
}

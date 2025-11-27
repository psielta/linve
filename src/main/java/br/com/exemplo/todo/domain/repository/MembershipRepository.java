package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para acesso a dados de Membership.
 */
@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    /**
     * Busca membership ativa de um usuario em uma organizacao.
     */
    Optional<Membership> findByUserIdAndOrganizationIdAndAtivoTrue(Long userId, Long organizationId);

    /**
     * Busca todas as memberships ativas de um usuario.
     */
    List<Membership> findByUserIdAndAtivoTrueOrderByDataIngressoAsc(Long userId);

    /**
     * Busca a primeira membership ativa de um usuario (organizacao padrao).
     */
    Optional<Membership> findFirstByUserIdAndAtivoTrueOrderByDataIngressoAsc(Long userId);

    /**
     * Lista membros de uma organizacao.
     */
    List<Membership> findByOrganizationIdAndAtivoTrueOrderByDataIngressoAsc(Long organizationId);

    /**
     * Verifica se usuario e membro de uma organizacao.
     */
    boolean existsByUserIdAndOrganizationIdAndAtivoTrue(Long userId, Long organizationId);

    /**
     * Conta membros de uma organizacao.
     */
    long countByOrganizationIdAndAtivoTrue(Long organizationId);

    /**
     * Conta membros por papel em uma organizacao.
     */
    long countByOrganizationIdAndPapelAndAtivoTrue(Long organizationId, MembershipRole papel);

    /**
     * Busca membership por usuario, organizacao e papel.
     */
    Optional<Membership> findByUserIdAndOrganizationIdAndPapelAndAtivoTrue(
            Long userId, Long organizationId, MembershipRole papel);

    /**
     * Atualiza o papel de um membership.
     */
    @Modifying
    @Query("UPDATE Membership m SET m.papel = :papel WHERE m.id = :id")
    void updatePapel(@Param("id") Long id, @Param("papel") MembershipRole papel);
}

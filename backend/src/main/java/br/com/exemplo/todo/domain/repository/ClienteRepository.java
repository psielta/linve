package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @EntityGraph(attributePaths = {"enderecos", "enderecos.municipio", "enderecos.municipio.uf"})
    List<Cliente> findByOrganizationIdAndAtivoTrueOrderByNomeAsc(Long organizationId);

    @EntityGraph(attributePaths = {"enderecos", "enderecos.municipio", "enderecos.municipio.uf"})
    Optional<Cliente> findByIdAndOrganizationIdAndAtivoTrue(Long id, Long organizationId);

    Optional<Cliente> findByDocumentoAndOrganizationIdAndAtivoTrue(String documento, Long organizationId);

    boolean existsByDocumentoAndOrganizationIdAndAtivoTrue(String documento, Long organizationId);

    boolean existsByDocumentoAndOrganizationIdAndIdNotAndAtivoTrue(String documento, Long organizationId, Long id);

    @Modifying
    @Query("update Cliente c set c.ativo = false, c.dataAtualizacao = CURRENT_TIMESTAMP where c.id = :id and c.organizationId = :organizationId")
    void softDelete(Long id, Long organizationId);
}

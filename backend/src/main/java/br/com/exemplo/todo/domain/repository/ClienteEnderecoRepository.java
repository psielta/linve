package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.ClienteEndereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteEnderecoRepository extends JpaRepository<ClienteEndereco, Long> {

    List<ClienteEndereco> findByClienteIdAndOrganizationIdAndAtivoTrue(Long clienteId, Long organizationId);

    Optional<ClienteEndereco> findByIdAndOrganizationIdAndAtivoTrue(Long id, Long organizationId);

    @Modifying
    @Query("update ClienteEndereco e set e.ativo = false, e.dataAtualizacao = CURRENT_TIMESTAMP where e.cliente.id = :clienteId and e.organizationId = :organizationId")
    void softDeleteByCliente(Long clienteId, Long organizationId);

    @Modifying
    @Query("update ClienteEndereco e set e.ativo = false, e.dataAtualizacao = CURRENT_TIMESTAMP where e.cliente.id = :clienteId and e.organizationId = :organizationId and e.id not in :idsToKeep")
    void softDeleteExcept(Long clienteId, Long organizationId, List<Long> idsToKeep);
}

package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.AdicionalItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdicionalItemRepository extends JpaRepository<AdicionalItem, Long> {

    List<AdicionalItem> findByOrganizationIdAndAdicionalIdAndAtivoTrue(Long organizationId, Long adicionalId);

    @Modifying
    @Query("update AdicionalItem ai set ai.ativo = false where ai.organizationId = :orgId and ai.adicional.id = :adicionalId")
    void softDeleteByAdicional(Long orgId, Long adicionalId);
}


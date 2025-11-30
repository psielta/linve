package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByOrganizationIdAndAtivoTrueOrderByNomeAsc(Long organizationId);

    List<Produto> findByOrganizationIdAndCategoriaIdAndAtivoTrueOrderByNomeAsc(Long organizationId, Long categoriaId);

    Optional<Produto> findByIdAndOrganizationIdAndAtivoTrue(Long id, Long organizationId);

    boolean existsByIdAndOrganizationIdAndAtivoTrue(Long id, Long organizationId);

    @Modifying
    @Query("update Produto p set p.ativo = false, p.dataAtualizacao = CURRENT_TIMESTAMP where p.categoriaId = :categoriaId and p.organizationId = :organizationId")
    void softDeleteByCategoria(Long categoriaId, Long organizationId);
}

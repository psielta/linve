package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.ProdutoPreco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoPrecoRepository extends JpaRepository<ProdutoPreco, Long> {

    List<ProdutoPreco> findByProdutoIdAndAtivoTrueOrderByValorAsc(Long produtoId);

    Optional<ProdutoPreco> findByIdAndProdutoIdAndAtivoTrue(Long id, Long produtoId);

    List<ProdutoPreco> findByOrganizationIdAndCategoriaOpcaoIdAndAtivoTrue(Long organizationId, Long categoriaOpcaoId);

    @Modifying
    @Query("update ProdutoPreco pp set pp.ativo = false, pp.dataAtualizacao = CURRENT_TIMESTAMP where pp.produto.id = :produtoId")
    void softDeleteByProduto(Long produtoId);

    @Modifying
    @Query("""
            update ProdutoPreco pp
            set pp.ativo = false, pp.dataAtualizacao = CURRENT_TIMESTAMP
            where pp.organizationId = :organizationId
              and pp.categoriaOpcaoId = :categoriaOpcaoId
            """)
    void softDeleteByOpcao(Long organizationId, Long categoriaOpcaoId);
}


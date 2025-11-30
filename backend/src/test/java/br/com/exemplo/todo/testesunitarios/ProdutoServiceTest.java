package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.dto.produto.ProdutoInput;
import br.com.exemplo.todo.api.dto.produto.ProdutoOpcaoInput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.CategoriaOpcao;
import br.com.exemplo.todo.domain.model.entity.Produto;
import br.com.exemplo.todo.domain.model.entity.ProdutoPreco;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.CategoriaOpcaoRepository;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.repository.ProdutoPrecoRepository;
import br.com.exemplo.todo.domain.repository.ProdutoRepository;
import br.com.exemplo.todo.domain.service.ProdutoService;
import br.com.exemplo.todo.domain.service.exception.ProdutoPrecoCategoriaInvalidaException;
import br.com.exemplo.todo.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProdutoService")
class ProdutoServiceTest {

    private static final Long ORG_ID = 1L;
    private static final Long USER_ID = 10L;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private ProdutoPrecoRepository produtoPrecoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private CategoriaOpcaoRepository categoriaOpcaoRepository;

    @InjectMocks
    private ProdutoService service;

    private Categoria categoria;
    private CategoriaOpcao opcao1;
    private CategoriaOpcao opcao2;

    @BeforeEach
    void setUp() {
        TenantContext.set(ORG_ID, USER_ID, MembershipRole.MEMBER);

        categoria = new Categoria();
        categoria.setId(100L);
        categoria.setOrganizationId(ORG_ID);
        categoria.setAtivo(true);

        opcao1 = new CategoriaOpcao();
        opcao1.setId(201L);
        opcao1.setNome("P");
        opcao1.setAtivo(true);
        opcao1.setCategoria(categoria);

        opcao2 = new CategoriaOpcao();
        opcao2.setId(202L);
        opcao2.setNome("M");
        opcao2.setAtivo(true);
        opcao2.setCategoria(categoria);

        categoria.setOpcoes(List.of(opcao1, opcao2));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("criar")
    class Criar {
        @Test
        @DisplayName("deve criar produto com precos quando opcoes pertencem a categoria")
        void deveCriarProduto() {
            ProdutoInput input = new ProdutoInput();
            input.setId_categoria(categoria.getId());
            input.setNome("Produto X");
            input.setDescricao("Desc");
            input.setOpcoes(List.of(opcao(201L, 10.0), opcao(202L, 12.0)));

            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoria.getId(), ORG_ID))
                    .thenReturn(Optional.of(categoria));
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> {
                Produto p = inv.getArgument(0);
                p.setId(1L);
                p.getPrecos().forEach(pp -> {
                    pp.setId(pp.getCategoriaOpcaoId() + 1000);
                });
                return p;
            });

            Produto produto = service.criar(input);

            assertThat(produto.getId()).isEqualTo(1L);
            assertThat(produto.getPrecos()).hasSize(2);
            assertThat(produto.getPrecos().get(0).getOrganizationId()).isEqualTo(ORG_ID);
            verify(produtoRepository).save(any(Produto.class));
        }

        @Test
        @DisplayName("deve falhar quando opcao nao pertence a categoria")
        void deveFalharOpcaoErrada() {
            ProdutoInput input = new ProdutoInput();
            input.setId_categoria(categoria.getId());
            input.setNome("Produto X");
            input.setOpcoes(List.of(opcao(999L, 10.0)));

            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoria.getId(), ORG_ID))
                    .thenReturn(Optional.of(categoria));

            assertThatThrownBy(() -> service.criar(input))
                    .isInstanceOf(ProdutoPrecoCategoriaInvalidaException.class);
        }
    }

    @Nested
    @DisplayName("atualizar")
    class Atualizar {
        @Test
        @DisplayName("deve sincronizar precos (manter, adicionar, desativar)")
        void deveSincronizarPrecos() {
            Produto existente = new Produto();
            existente.setId(1L);
            existente.setOrganizationId(ORG_ID);
            existente.setCategoriaId(categoria.getId());
            existente.setNome("Old");
            existente.setDescricao("Old");
            existente.setAtivo(true);
            existente.setDataCriacao(LocalDateTime.now());

            ProdutoPreco preco1 = new ProdutoPreco();
            preco1.setId(1000L);
            preco1.setOrganizationId(ORG_ID);
            preco1.setCategoriaOpcaoId(201L);
            preco1.setValor(new BigDecimal("10.00"));
            preco1.setProduto(existente);
            preco1.setAtivo(true);

            ProdutoPreco preco2 = new ProdutoPreco();
            preco2.setId(1001L);
            preco2.setOrganizationId(ORG_ID);
            preco2.setCategoriaOpcaoId(202L);
            preco2.setValor(new BigDecimal("12.00"));
            preco2.setProduto(existente);
            preco2.setAtivo(true);

            existente.setPrecos(List.of(preco1, preco2));

            ProdutoInput input = new ProdutoInput();
            input.setId_categoria(categoria.getId());
            input.setNome("Novo");
            input.setDescricao("Nova");
            input.setOpcoes(List.of(
                    opcao(201L, 11.0), // atualizado
                    opcao(999L, 15.0)  // invalido -> validaçao
            ));

            when(produtoRepository.findByIdAndOrganizationIdAndAtivoTrue(1L, ORG_ID))
                    .thenReturn(Optional.of(existente));
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoria.getId(), ORG_ID))
                    .thenReturn(Optional.of(categoria));

            assertThatThrownBy(() -> service.atualizar(1L, input))
                    .isInstanceOf(ProdutoPrecoCategoriaInvalidaException.class);
        }
    }

    @Nested
    @DisplayName("excluir")
    class Excluir {
        @Test
        @DisplayName("deve soft delete produto e precos")
        void deveSoftDelete() {
            Produto produto = new Produto();
            produto.setId(1L);
            produto.setOrganizationId(ORG_ID);
            produto.setCategoriaId(categoria.getId());
            produto.setAtivo(true);

            ProdutoPreco preco = new ProdutoPreco();
            preco.setId(1L);
            preco.setProduto(produto);
            preco.setOrganizationId(ORG_ID);
            preco.setCategoriaOpcaoId(201L);
            preco.setValor(new BigDecimal("10"));
            preco.setAtivo(true);
            produto.setPrecos(List.of(preco));

            when(produtoRepository.findByIdAndOrganizationIdAndAtivoTrue(1L, ORG_ID))
                    .thenReturn(Optional.of(produto));

            service.excluir(1L);

            assertThat(produto.getAtivo()).isFalse();
            assertThat(preco.getAtivo()).isFalse();
            verify(produtoRepository).save(produto);
        }
    }

    private ProdutoOpcaoInput opcao(Long idOpcao, double valor) {
        ProdutoOpcaoInput input = new ProdutoOpcaoInput();
        input.setId_opcao(idOpcao);
        input.setValor(BigDecimal.valueOf(valor));
        return input;
    }
}


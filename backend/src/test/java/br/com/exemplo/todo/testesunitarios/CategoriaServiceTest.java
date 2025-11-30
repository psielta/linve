package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.dto.categoria.CategoriaDisponibilidadeDto;
import br.com.exemplo.todo.api.dto.categoria.CategoriaInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoInput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.CategoriaOpcao;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.service.CategoriaService;
import br.com.exemplo.todo.domain.service.exception.CategoriaNaoEncontradaException;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoriaService")
class CategoriaServiceTest {

    private static final Long ORG_ID = 1L;
    private static final Long USER_ID = 10L;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private br.com.exemplo.todo.domain.service.CulinariaService culinariaService;

    @InjectMocks
    private CategoriaService service;

    private Categoria categoria;
    private CategoriaInput inputBasico;

    @BeforeEach
    void setUp() {
        TenantContext.set(ORG_ID, USER_ID, MembershipRole.MEMBER);

        categoria = new Categoria();
        categoria.setId(100L);
        categoria.setOrganizationId(ORG_ID);
        categoria.setCulinariaId(4);
        categoria.setNome("Açaís");
        categoria.setDescricao("Categoria de açaís");
        categoria.setOrdem(1);
        categoria.setAtivo(true);
        categoria.setDataCriacao(LocalDateTime.now());

        CategoriaOpcao opcao = new CategoriaOpcao();
        opcao.setId(1L);
        opcao.setCategoria(categoria);
        opcao.setNome("300ml");
        opcao.setAtivo(true);
        categoria.setOpcoes(new java.util.ArrayList<>(java.util.List.of(opcao)));

        inputBasico = new CategoriaInput();
        inputBasico.setIdCulinaria(4);
        inputBasico.setNome("Açaís");
        inputBasico.setDescricao("Categoria de açaís");
        inputBasico.setOrdem(1);
        inputBasico.setOpcaoMeia("");
        inputBasico.setOpcoes(List.of("300ml", "500ml"));
        CategoriaDisponibilidadeDto disp = new CategoriaDisponibilidadeDto();
        disp.setDomingo(false);
        inputBasico.setDisponivel(disp);
        inputBasico.setInicio("00:00");
        inputBasico.setFim("23:00");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("listar")
    class Listar {

        @Test
        @DisplayName("deve listar categorias da organizacao atual")
        void deveListarCategorias() {
            when(categoriaRepository.findByOrganizationIdAndAtivoTrueOrderByOrdemAscNomeAsc(ORG_ID))
                    .thenReturn(List.of(categoria));

            List<Categoria> resultado = service.listar(null);

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getNome()).isEqualTo("Açaís");
            verify(categoriaRepository).findByOrganizationIdAndAtivoTrueOrderByOrdemAscNomeAsc(ORG_ID);
        }
    }

    @Nested
    @DisplayName("buscarPorId")
    class BuscarPorId {

        @Test
        @DisplayName("deve retornar categoria quando existe na organizacao")
        void deveRetornarQuandoExiste() {
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(100L, ORG_ID))
                    .thenReturn(Optional.of(categoria));

            Categoria encontrada = service.buscarPorId(100L);

            assertThat(encontrada).isNotNull();
            assertThat(encontrada.getId()).isEqualTo(100L);
            assertThat(encontrada.getOrganizationId()).isEqualTo(ORG_ID);
        }

        @Test
        @DisplayName("deve lançar excecao quando categoria nao existe")
        void deveLancarQuandoNaoExiste() {
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(999L, ORG_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.buscarPorId(999L))
                    .isInstanceOf(CategoriaNaoEncontradaException.class);
        }
    }

    @Nested
    @DisplayName("criar")
    class Criar {

        @Test
        @DisplayName("deve criar categoria com sucesso")
        void deveCriarCategoria() {
            when(categoriaRepository.findByOrganizationIdAndOrdemAndAtivoTrue(ORG_ID, 1))
                    .thenReturn(Optional.empty());
            when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> {
                Categoria cat = invocation.getArgument(0);
                cat.setId(10L);
                cat.getOpcoes().forEach(o -> o.setId(1L));
                return cat;
            });

            Categoria criada = service.criar(inputBasico);

            assertThat(criada.getId()).isEqualTo(10L);
            assertThat(criada.getOrganizationId()).isEqualTo(ORG_ID);
            assertThat(criada.getCriadoPor()).isEqualTo(USER_ID);
            assertThat(criada.getOpcoes()).hasSize(2);
            assertThat(criada.getOpcoes().get(0).getCategoria()).isNotNull();
        }

        @Test
        @DisplayName("deve falhar quando opcao_meia invalida")
        void deveFalharOpcaoMeiaInvalida() {
            inputBasico.setOpcaoMeia("X");

            assertThatThrownBy(() -> service.criar(inputBasico))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("opcao_meia");
        }

        @Test
        @DisplayName("deve falhar quando horarios invalidos")
        void deveFalharHorariosInvalidos() {
            inputBasico.setInicio("23:00");
            inputBasico.setFim("22:00");

            assertThatThrownBy(() -> service.criar(inputBasico))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("atualizar")
    class Atualizar {

        @Test
        @DisplayName("deve atualizar categoria existente")
        void deveAtualizarCategoria() {
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(100L, ORG_ID))
                    .thenReturn(Optional.of(categoria));
            when(categoriaRepository.findByOrganizationIdAndOrdemAndAtivoTrue(ORG_ID, 1))
                    .thenReturn(Optional.of(categoria));
            when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

            inputBasico.setNome("Novos Açaís");
            inputBasico.setOpcoes(List.of("300ml", "700ml"));

            Categoria atualizada = service.atualizar(100L, inputBasico);

            assertThat(atualizada.getNome()).isEqualTo("Novos Açaís");
            assertThat(atualizada.getOpcoes().stream().filter(o -> Boolean.TRUE.equals(o.getAtivo())))
                    .extracting(CategoriaOpcao::getNome)
                    .contains("300ml", "700ml");
        }
    }

    @Nested
    @DisplayName("excluir")
    class Excluir {

        @Test
        @DisplayName("deve fazer soft delete da categoria e opcoes")
        void deveSoftDelete() {
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(100L, ORG_ID))
                    .thenReturn(Optional.of(categoria));
            when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

            service.excluir(100L);

            assertThat(categoria.getAtivo()).isFalse();
            assertThat(categoria.getOpcoes()).allMatch(o -> Boolean.FALSE.equals(o.getAtivo()));
            verify(categoriaRepository).save(categoria);
        }
    }

    @Nested
    @DisplayName("opcoes")
    class Opcoes {

        @Test
        @DisplayName("deve listar apenas opcoes ativas")
        void deveListarOpcoesAtivas() {
            CategoriaOpcao inativa = new CategoriaOpcao();
            inativa.setId(2L);
            inativa.setCategoria(categoria);
            inativa.setNome("1000ml");
            inativa.setAtivo(false);

            categoria.setOpcoes(new java.util.ArrayList<>(
                    java.util.List.of(categoria.getOpcoes().get(0), inativa)));

            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(100L, ORG_ID))
                    .thenReturn(Optional.of(categoria));

            List<CategoriaOpcao> opcoes = service.listarOpcoes(100L);

            assertThat(opcoes).hasSize(1);
            assertThat(opcoes.get(0).getNome()).isEqualTo("300ml");
        }

        @Test
        @DisplayName("deve adicionar nova opcao")
        void deveAdicionarOpcao() {
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(100L, ORG_ID))
                    .thenReturn(Optional.of(categoria));
            when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

            CategoriaOpcaoInput input = new CategoriaOpcaoInput();
            input.setNome("500ml");

            CategoriaOpcao criada = service.adicionarOpcao(100L, input);

            assertThat(criada.getNome()).isEqualTo("500ml");
            assertThat(criada.getCategoria()).isEqualTo(categoria);
        }

        @Test
        @DisplayName("deve desativar opcao")
        void deveDesativarOpcao() {
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(100L, ORG_ID))
                    .thenReturn(Optional.of(categoria));
            when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

            service.desativarOpcao(100L, 1L);

            assertThat(categoria.getOpcoes().get(0).getAtivo()).isFalse();
        }
    }
}

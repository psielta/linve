package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.dto.adicional.AdicionalInput;
import br.com.exemplo.todo.api.dto.adicional.AdicionalOpcaoInput;
import br.com.exemplo.todo.domain.model.entity.Adicional;
import br.com.exemplo.todo.domain.model.entity.AdicionalItem;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.AdicionalItemRepository;
import br.com.exemplo.todo.domain.repository.AdicionalRepository;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.service.AdicionalService;
import br.com.exemplo.todo.domain.service.exception.AdicionalSelecaoInvalidaException;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdicionalService")
class AdicionalServiceTest {

    private static final Long ORG_ID = 1L;
    private static final Long USER_ID = 10L;

    @Mock
    private AdicionalRepository adicionalRepository;

    @Mock
    private AdicionalItemRepository adicionalItemRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private AdicionalService service;

    private Categoria categoria;

    @BeforeEach
    void setUp() {
        TenantContext.set(ORG_ID, USER_ID, MembershipRole.MEMBER);
        categoria = new Categoria();
        categoria.setId(100L);
        categoria.setOrganizationId(ORG_ID);
        categoria.setAtivo(true);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("criar")
    class Criar {
        @Test
        @DisplayName("deve lançar erro quando selecao Q sem limite")
        void deveValidarSelecaoQ() {
            AdicionalInput input = novoInput("Q");
            input.setLimite(null);
            input.setMinimo(0);

            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoria.getId(), ORG_ID))
                    .thenReturn(Optional.of(categoria));

            assertThatThrownBy(() -> service.criar(input))
                    .isInstanceOf(AdicionalSelecaoInvalidaException.class);
        }

        @Test
        @DisplayName("deve criar adicional com itens e status default")
        void deveCriarAdicional() {
            AdicionalInput input = novoInput("M");
            input.setLimite(3);

            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoria.getId(), ORG_ID))
                    .thenReturn(Optional.of(categoria));
            when(adicionalRepository.save(any(Adicional.class))).thenAnswer(inv -> {
                Adicional a = inv.getArgument(0);
                a.setId(1L);
                long base = 10;
                for (AdicionalItem item : a.getItens()) {
                    item.setId(base++);
                }
                return a;
            });

            Adicional adicional = service.criar(input);

            assertThat(adicional.getId()).isEqualTo(1L);
            assertThat(adicional.getItens()).hasSize(2);
            assertThat(adicional.getItens().get(0).getOrganizationId()).isEqualTo(ORG_ID);
            verify(adicionalRepository).save(any(Adicional.class));
        }
    }

    @Nested
    @DisplayName("atualizar")
    class Atualizar {
        @Test
        @DisplayName("deve sincronizar itens (atualizar, adicionar, desativar)")
        void deveSincronizarItens() {
            Adicional existente = new Adicional();
            existente.setId(1L);
            existente.setOrganizationId(ORG_ID);
            existente.setCategoriaId(categoria.getId());
            existente.setNome("Extras");
            existente.setAtivo(true);
            existente.setDataCriacao(LocalDateTime.now());
            existente.setItens(new ArrayList<>());

            AdicionalItem itemA = new AdicionalItem();
            itemA.setId(10L);
            itemA.setOrganizationId(ORG_ID);
            itemA.setAdicional(existente);
            itemA.setNome("A");
            itemA.setValor(new BigDecimal("1.00"));
            itemA.setAtivo(true);

            AdicionalItem itemB = new AdicionalItem();
            itemB.setId(11L);
            itemB.setOrganizationId(ORG_ID);
            itemB.setAdicional(existente);
            itemB.setNome("B");
            itemB.setValor(new BigDecimal("2.00"));
            itemB.setAtivo(true);

            existente.getItens().addAll(List.of(itemA, itemB));

            AdicionalInput input = novoInput("M");
            input.setOpcoes(List.of(opcao("A", 1.5), opcao("C", 3.0))); // A atualiza, B sai, C entra

            when(adicionalRepository.findByIdAndOrganizationIdAndAtivoTrue(1L, ORG_ID))
                    .thenReturn(Optional.of(existente));
            when(categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoria.getId(), ORG_ID))
                    .thenReturn(Optional.of(categoria));
            when(adicionalRepository.save(any(Adicional.class))).thenAnswer(inv -> inv.getArgument(0));

            Adicional atualizado = service.atualizar(1L, input);

            assertThat(atualizado.getItens()).hasSize(3);
            AdicionalItem aAtualizado = atualizado.getItens().stream().filter(i -> i.getNome().equals("A")).findFirst().orElseThrow();
            assertThat(aAtualizado.getValor()).isEqualByComparingTo("1.5");

            AdicionalItem bDesativado = atualizado.getItens().stream().filter(i -> i.getNome().equals("B")).findFirst().orElseThrow();
            assertThat(bDesativado.getAtivo()).isFalse();

            AdicionalItem cNovo = atualizado.getItens().stream().filter(i -> i.getNome().equals("C")).findFirst().orElseThrow();
            assertThat(cNovo.getValor()).isEqualByComparingTo("3.0");
        }
    }

    @Nested
    @DisplayName("excluir")
    class Excluir {
        @Test
        @DisplayName("deve soft delete adicional e itens")
        void deveSoftDelete() {
            Adicional adicional = new Adicional();
            adicional.setId(1L);
            adicional.setOrganizationId(ORG_ID);
            adicional.setCategoriaId(categoria.getId());
            adicional.setAtivo(true);

            AdicionalItem item = new AdicionalItem();
            item.setId(1L);
            item.setAdicional(adicional);
            item.setOrganizationId(ORG_ID);
            item.setNome("X");
            item.setValor(new BigDecimal("1"));
            item.setAtivo(true);
            adicional.setItens(List.of(item));

            when(adicionalRepository.findByIdAndOrganizationIdAndAtivoTrue(1L, ORG_ID))
                    .thenReturn(Optional.of(adicional));

            service.excluir(1L);

            assertThat(adicional.getAtivo()).isFalse();
            assertThat(item.getAtivo()).isFalse();
            verify(adicionalRepository).save(adicional);
        }
    }

    private AdicionalInput novoInput(String selecao) {
        AdicionalInput input = new AdicionalInput();
        input.setIdCategoria(categoria.getId());
        input.setNome("Escolha um adicional");
        input.setSelecao(selecao);
        input.setLimite(3);
        input.setMinimo(0);
        input.setOpcoes(List.of(opcao("Choc", 1.0), opcao("Morango", 2.0)));
        return input;
    }

    private AdicionalOpcaoInput opcao(String nome, double valor) {
        AdicionalOpcaoInput o = new AdicionalOpcaoInput();
        o.setNome(nome);
        o.setValor(BigDecimal.valueOf(valor));
        o.setStatus(true);
        return o;
    }
}

package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.domain.exception.UfNaoEncontradaException;
import br.com.exemplo.todo.domain.model.entity.Uf;
import br.com.exemplo.todo.domain.repository.UfRepository;
import br.com.exemplo.todo.domain.service.UfService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@DisplayName("UfService")
class UfServiceTest {

    @Mock
    private UfRepository repository;

    private UfService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new UfService(repository);
    }

    @Test
    @DisplayName("deve listar todas as UFs ordenadas por sigla")
    void deveListarTodas() {
        Uf uf1 = uf("BA", "Bahia");
        Uf uf2 = uf("SE", "Sergipe");

        when(repository.findAllByOrderBySiglaAsc()).thenReturn(List.of(uf1, uf2));

        var lista = service.listarTodas();

        assertThat(lista).containsExactly(uf1, uf2);
        verify(repository).findAllByOrderBySiglaAsc();
    }

    @Test
    @DisplayName("deve buscar UF por sigla existente")
    void deveBuscarPorSiglaExistente() {
        Uf uf = uf("SE", "Sergipe");
        when(repository.findBySiglaIgnoreCase("SE")).thenReturn(Optional.of(uf));

        var found = service.buscarPorSigla("SE");

        assertThat(found).isEqualTo(uf);
        verify(repository).findBySiglaIgnoreCase("SE");
    }

    @Test
    @DisplayName("deve lancar excecao quando UF nao encontrada")
    void deveLancarQuandoNaoEncontrar() {
        when(repository.findBySiglaIgnoreCase("XX")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorSigla("XX"))
                .isInstanceOf(UfNaoEncontradaException.class);

        verify(repository).findBySiglaIgnoreCase("XX");
    }

    private Uf uf(String sigla, String nome) {
        Uf uf = new Uf();
        uf.setSigla(sigla);
        uf.setNome(nome);
        return uf;
    }
}

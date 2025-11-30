package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.domain.exception.CulinariaNotFoundException;
import br.com.exemplo.todo.domain.model.entity.Culinaria;
import br.com.exemplo.todo.domain.repository.CulinariaRepository;
import br.com.exemplo.todo.domain.service.CulinariaService;
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

@DisplayName("CulinariaService")
class CulinariaServiceTest {

    @Mock
    private CulinariaRepository repository;

    private CulinariaService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new CulinariaService(repository);
    }

    @Test
    @DisplayName("deve listar todas as culinarias ordenadas")
    void deveListarTodas() {
        Culinaria c1 = culinaria(1, "A", false);
        Culinaria c2 = culinaria(2, "B", true);

        when(repository.findAllByOrderByNomeAsc()).thenReturn(List.of(c1, c2));

        var lista = service.listarTodas();

        assertThat(lista).containsExactly(c1, c2);
        verify(repository).findAllByOrderByNomeAsc();
    }

    @Test
    @DisplayName("deve listar apenas meio a meio")
    void deveListarMeioMeio() {
        Culinaria c = culinaria(2, "B", true);
        when(repository.findByMeioMeioTrueOrderByNomeAsc()).thenReturn(List.of(c));

        var lista = service.listarMeioMeio();

        assertThat(lista).containsExactly(c);
        verify(repository).findByMeioMeioTrueOrderByNomeAsc();
    }

    @Test
    @DisplayName("deve buscar por id existente")
    void deveBuscarPorIdExistente() {
        Culinaria c = culinaria(1, "A", false);
        when(repository.findById(1)).thenReturn(Optional.of(c));

        var found = service.buscarPorId(1);

        assertThat(found).isEqualTo(c);
        verify(repository).findById(1);
    }

    @Test
    @DisplayName("deve lançar exceção quando nao encontrar")
    void deveLancarQuandoNaoEncontrar() {
        when(repository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99))
                .isInstanceOf(CulinariaNotFoundException.class);

        verify(repository).findById(99);
    }

    private Culinaria culinaria(Integer id, String nome, boolean meioMeio) {
        Culinaria c = new Culinaria();
        c.setId(id);
        c.setNome(nome);
        c.setMeioMeio(meioMeio);
        return c;
    }
}

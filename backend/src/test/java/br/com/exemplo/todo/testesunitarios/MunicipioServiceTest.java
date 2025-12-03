package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.domain.model.entity.Municipio;
import br.com.exemplo.todo.domain.model.entity.Uf;
import br.com.exemplo.todo.domain.repository.MunicipioRepository;
import br.com.exemplo.todo.domain.service.MunicipioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("MunicipioService")
class MunicipioServiceTest {

    @Mock
    private MunicipioRepository repository;

    private MunicipioService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new MunicipioService(repository);
    }

    @Test
    @DisplayName("deve listar todos os municipios ordenados")
    void deveListarTodos() {
        Municipio m1 = municipio(1L, "Aracaju", "SE");
        Municipio m2 = municipio(2L, "Belem", "PA");

        when(repository.findAllByOrderByNomeAsc()).thenReturn(List.of(m1, m2));

        var lista = service.listarTodos();

        assertThat(lista).containsExactly(m1, m2);
        verify(repository).findAllByOrderByNomeAsc();
    }

    @Test
    @DisplayName("deve listar municipios por UF")
    void deveListarPorUf() {
        Municipio m1 = municipio(1L, "Aracaju", "SE");
        Municipio m2 = municipio(2L, "Lagarto", "SE");

        when(repository.findByUfSiglaIgnoreCaseOrderByNomeAsc("SE")).thenReturn(List.of(m1, m2));

        var lista = service.listarPorUf("SE");

        assertThat(lista).containsExactly(m1, m2);
        verify(repository).findByUfSiglaIgnoreCaseOrderByNomeAsc("SE");
    }

    @Test
    @DisplayName("deve retornar lista vazia quando UF nao tem municipios")
    void deveRetornarListaVaziaQuandoUfNaoTemMunicipios() {
        when(repository.findByUfSiglaIgnoreCaseOrderByNomeAsc("XX")).thenReturn(List.of());

        var lista = service.listarPorUf("XX");

        assertThat(lista).isEmpty();
        verify(repository).findByUfSiglaIgnoreCaseOrderByNomeAsc("XX");
    }

    private Municipio municipio(Long codigo, String nome, String siglaUf) {
        Uf uf = new Uf();
        uf.setSigla(siglaUf);

        Municipio m = new Municipio();
        m.setCodigo(codigo);
        m.setNome(nome);
        m.setUf(uf);
        return m;
    }
}

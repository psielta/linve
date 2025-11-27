package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.model.input.TodoInput;
import br.com.exemplo.todo.domain.model.entity.Todo;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.TodoRepository;
import br.com.exemplo.todo.domain.service.TodoService;
import br.com.exemplo.todo.domain.service.exception.TodoNaoEncontradoException;
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
import org.modelmapper.ModelMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TodoService")
class TodoServiceTest {

    private static final Long ORG_ID = 1L;
    private static final Long USER_ID = 100L;

    @Mock
    private TodoRepository repository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private TodoService service;

    private Todo todo;
    private TodoInput todoInput;

    @BeforeEach
    void setUp() {
        // Configura TenantContext para os testes
        TenantContext.set(ORG_ID, USER_ID, MembershipRole.MEMBER);

        todo = new Todo();
        todo.setId(1L);
        todo.setTitulo("Comprar pão");
        todo.setDescricao("Ir à padaria");
        todo.setConcluido(false);
        todo.setDataCriacao(LocalDateTime.now());
        todo.setOrganizationId(ORG_ID);
        todo.setCriadoPor(USER_ID);

        todoInput = new TodoInput();
        todoInput.setTitulo("Comprar pão");
        todoInput.setDescricao("Ir à padaria");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("listarTodos")
    class ListarTodos {

        @Test
        @DisplayName("deve retornar lista de todos ordenada por data de criação")
        void deveRetornarListaOrdenada() {
            when(repository.findByOrganizationIdOrderByDataCriacaoDesc(ORG_ID)).thenReturn(List.of(todo));

            List<Todo> resultado = service.listarTodos();

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getTitulo()).isEqualTo("Comprar pão");
            verify(repository).findByOrganizationIdOrderByDataCriacaoDesc(ORG_ID);
        }

        @Test
        @DisplayName("deve retornar lista vazia quando não há tarefas")
        void deveRetornarListaVazia() {
            when(repository.findByOrganizationIdOrderByDataCriacaoDesc(ORG_ID)).thenReturn(List.of());

            List<Todo> resultado = service.listarTodos();

            assertThat(resultado).isEmpty();
        }
    }

    @Nested
    @DisplayName("listarPorStatus")
    class ListarPorStatus {

        @Test
        @DisplayName("deve retornar tarefas concluídas quando concluido=true")
        void deveRetornarConcluidas() {
            todo.setConcluido(true);
            when(repository.findByOrganizationIdAndConcluidoOrderByDataCriacaoDesc(ORG_ID, true))
                    .thenReturn(List.of(todo));

            List<Todo> resultado = service.listarPorStatus(true);

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getConcluido()).isTrue();
        }

        @Test
        @DisplayName("deve retornar tarefas pendentes quando concluido=false")
        void deveRetornarPendentes() {
            when(repository.findByOrganizationIdAndConcluidoOrderByDataCriacaoDesc(ORG_ID, false))
                    .thenReturn(List.of(todo));

            List<Todo> resultado = service.listarPorStatus(false);

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getConcluido()).isFalse();
        }
    }

    @Nested
    @DisplayName("buscarPorId")
    class BuscarPorId {

        @Test
        @DisplayName("deve retornar tarefa quando ID existe")
        void deveRetornarTarefaQuandoExiste() {
            when(repository.findByIdAndOrganizationId(1L, ORG_ID)).thenReturn(Optional.of(todo));

            Todo resultado = service.buscarPorId(1L);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getId()).isEqualTo(1L);
            assertThat(resultado.getTitulo()).isEqualTo("Comprar pão");
        }

        @Test
        @DisplayName("deve lançar exceção quando ID não existe")
        void deveLancarExcecaoQuandoNaoExiste() {
            when(repository.findByIdAndOrganizationId(999L, ORG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.buscarPorId(999L))
                    .isInstanceOf(TodoNaoEncontradoException.class)
                    .hasMessageContaining("999");
        }
    }

    @Nested
    @DisplayName("criar")
    class Criar {

        @Test
        @DisplayName("deve criar tarefa com sucesso")
        void deveCriarComSucesso() {
            Todo novoTodo = new Todo();
            novoTodo.setTitulo("Comprar pão");
            novoTodo.setDescricao("Ir à padaria");

            when(modelMapper.map(todoInput, Todo.class)).thenReturn(novoTodo);
            when(repository.save(any(Todo.class))).thenAnswer(invocation -> {
                Todo t = invocation.getArgument(0);
                t.setId(1L);
                return t;
            });

            Todo resultado = service.criar(todoInput);

            assertThat(resultado.getId()).isEqualTo(1L);
            assertThat(resultado.getTitulo()).isEqualTo("Comprar pão");
            assertThat(resultado.getConcluido()).isFalse();
            assertThat(resultado.getDataCriacao()).isNotNull();
            assertThat(resultado.getOrganizationId()).isEqualTo(ORG_ID);
            assertThat(resultado.getCriadoPor()).isEqualTo(USER_ID);
        }
    }

    @Nested
    @DisplayName("atualizar")
    class Atualizar {

        @Test
        @DisplayName("deve atualizar tarefa existente")
        void deveAtualizarComSucesso() {
            todoInput.setTitulo("Comprar leite");
            todoInput.setDescricao("No supermercado");

            when(repository.findByIdAndOrganizationId(1L, ORG_ID)).thenReturn(Optional.of(todo));
            when(repository.save(any(Todo.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Todo resultado = service.atualizar(1L, todoInput);

            assertThat(resultado.getTitulo()).isEqualTo("Comprar leite");
            assertThat(resultado.getDescricao()).isEqualTo("No supermercado");
        }

        @Test
        @DisplayName("deve lançar exceção quando tarefa não existe")
        void deveLancarExcecaoQuandoNaoExiste() {
            when(repository.findByIdAndOrganizationId(999L, ORG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.atualizar(999L, todoInput))
                    .isInstanceOf(TodoNaoEncontradoException.class);
        }
    }

    @Nested
    @DisplayName("excluir")
    class Excluir {

        @Test
        @DisplayName("deve excluir tarefa existente")
        void deveExcluirComSucesso() {
            when(repository.findByIdAndOrganizationId(1L, ORG_ID)).thenReturn(Optional.of(todo));

            service.excluir(1L);

            verify(repository).delete(todo);
        }

        @Test
        @DisplayName("deve lançar exceção quando tarefa não existe")
        void deveLancarExcecaoQuandoNaoExiste() {
            when(repository.findByIdAndOrganizationId(999L, ORG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.excluir(999L))
                    .isInstanceOf(TodoNaoEncontradoException.class);
        }
    }

    @Nested
    @DisplayName("marcarConcluido")
    class MarcarConcluido {

        @Test
        @DisplayName("deve marcar tarefa como concluída")
        void deveMarcarComoConcluida() {
            when(repository.findByIdAndOrganizationId(1L, ORG_ID)).thenReturn(Optional.of(todo));
            when(repository.save(any(Todo.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Todo resultado = service.marcarConcluido(1L);

            assertThat(resultado.getConcluido()).isTrue();
            assertThat(resultado.getDataConclusao()).isNotNull();
        }
    }

    @Nested
    @DisplayName("reabrir")
    class Reabrir {

        @Test
        @DisplayName("deve reabrir tarefa concluída")
        void deveReabrirTarefa() {
            todo.setConcluido(true);
            todo.setDataConclusao(LocalDateTime.now());

            when(repository.findByIdAndOrganizationId(1L, ORG_ID)).thenReturn(Optional.of(todo));
            when(repository.save(any(Todo.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Todo resultado = service.reabrir(1L);

            assertThat(resultado.getConcluido()).isFalse();
            assertThat(resultado.getDataConclusao()).isNull();
        }
    }

}

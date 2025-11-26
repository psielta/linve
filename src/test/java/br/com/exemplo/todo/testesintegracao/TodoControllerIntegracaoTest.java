package br.com.exemplo.todo.testesintegracao;

import br.com.exemplo.todo.api.model.input.TodoInput;
import br.com.exemplo.todo.api.model.output.TodoOutput;
import br.com.exemplo.todo.domain.model.entity.Todo;
import br.com.exemplo.todo.domain.repository.TodoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("testes")
@DisplayName("TodoController - Testes de Integração")
class TodoControllerIntegracaoTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TodoRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Nested
    @DisplayName("GET /todos")
    class ListarTodos {

        @Test
        @DisplayName("deve retornar lista vazia quando não há tarefas")
        void deveRetornarListaVazia() {
            ResponseEntity<TodoOutput[]> response = restTemplate.getForEntity(
                    "/todos", TodoOutput[].class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isEmpty();
        }

        @Test
        @DisplayName("deve retornar lista com tarefas cadastradas")
        void deveRetornarListaComTarefas() {
            criarTodoNoBanco("Tarefa 1", "Descrição 1");
            criarTodoNoBanco("Tarefa 2", "Descrição 2");

            ResponseEntity<TodoOutput[]> response = restTemplate.getForEntity(
                    "/todos", TodoOutput[].class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(2);
        }

        @Test
        @DisplayName("deve filtrar por tarefas pendentes")
        void deveFiltrarPorPendentes() {
            criarTodoNoBanco("Pendente", "Desc", false);
            criarTodoNoBanco("Concluída", "Desc", true);

            ResponseEntity<TodoOutput[]> response = restTemplate.getForEntity(
                    "/todos?concluido=false", TodoOutput[].class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            assertThat(response.getBody()[0].getTitulo()).isEqualTo("Pendente");
        }
    }

    @Nested
    @DisplayName("GET /todos/{id}")
    class BuscarPorId {

        @Test
        @DisplayName("deve retornar tarefa quando ID existe")
        void deveRetornarTarefaQuandoExiste() {
            Todo todo = criarTodoNoBanco("Minha Tarefa", "Descrição");

            ResponseEntity<TodoOutput> response = restTemplate.getForEntity(
                    "/todos/" + todo.getId(), TodoOutput.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTitulo()).isEqualTo("Minha Tarefa");
        }

        @Test
        @DisplayName("deve retornar 404 quando ID não existe")
        void deveRetornar404QuandoNaoExiste() {
            ResponseEntity<ProblemDetail> response = restTemplate.getForEntity(
                    "/todos/999", ProblemDetail.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTitle()).isEqualTo("Tarefa não encontrada");
        }
    }

    @Nested
    @DisplayName("POST /todos")
    class CriarTodo {

        @Test
        @DisplayName("deve criar tarefa com sucesso")
        void deveCriarComSucesso() {
            TodoInput input = new TodoInput();
            input.setTitulo("Nova Tarefa");
            input.setDescricao("Descrição da tarefa");

            ResponseEntity<TodoOutput> response = restTemplate.postForEntity(
                    "/todos", input, TodoOutput.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getId()).isNotNull();
            assertThat(response.getBody().getTitulo()).isEqualTo("Nova Tarefa");
            assertThat(response.getBody().getConcluido()).isFalse();
        }

        @Test
        @DisplayName("deve retornar 400 quando título está vazio")
        void deveRetornar400QuandoTituloVazio() {
            TodoInput input = new TodoInput();
            input.setTitulo("");
            input.setDescricao("Descrição");

            ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                    "/todos", input, ProblemDetail.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTitle()).isEqualTo("Campos inválidos.");
        }
    }

    @Nested
    @DisplayName("PUT /todos/{id}")
    class AtualizarTodo {

        @Test
        @DisplayName("deve atualizar tarefa existente")
        void deveAtualizarComSucesso() {
            Todo todo = criarTodoNoBanco("Título Original", "Descrição Original");

            TodoInput input = new TodoInput();
            input.setTitulo("Título Atualizado");
            input.setDescricao("Descrição Atualizada");

            ResponseEntity<TodoOutput> response = restTemplate.exchange(
                    "/todos/" + todo.getId(),
                    HttpMethod.PUT,
                    new HttpEntity<>(input),
                    TodoOutput.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTitulo()).isEqualTo("Título Atualizado");
        }
    }

    @Nested
    @DisplayName("DELETE /todos/{id}")
    class ExcluirTodo {

        @Test
        @DisplayName("deve excluir tarefa existente")
        void deveExcluirComSucesso() {
            Todo todo = criarTodoNoBanco("Para Excluir", "Descrição");

            ResponseEntity<Void> response = restTemplate.exchange(
                    "/todos/" + todo.getId(),
                    HttpMethod.DELETE,
                    null,
                    Void.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            assertThat(repository.findById(todo.getId())).isEmpty();
        }
    }

    @Nested
    @DisplayName("PATCH /todos/{id}/concluir")
    class MarcarConcluido {

        @Test
        @DisplayName("deve marcar tarefa como concluída")
        void deveMarcarComoConcluida() {
            Todo todo = criarTodoNoBanco("Tarefa Pendente", "Descrição");

            ResponseEntity<TodoOutput> response = restTemplate.exchange(
                    "/todos/" + todo.getId() + "/concluir",
                    HttpMethod.PATCH,
                    null,
                    TodoOutput.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getConcluido()).isTrue();
            assertThat(response.getBody().getDataConclusao()).isNotNull();
        }
    }

    @Nested
    @DisplayName("PATCH /todos/{id}/reabrir")
    class ReabrirTodo {

        @Test
        @DisplayName("deve reabrir tarefa concluída")
        void deveReabrirTarefa() {
            Todo todo = criarTodoNoBanco("Tarefa Concluída", "Descrição", true);

            ResponseEntity<TodoOutput> response = restTemplate.exchange(
                    "/todos/" + todo.getId() + "/reabrir",
                    HttpMethod.PATCH,
                    null,
                    TodoOutput.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getConcluido()).isFalse();
            assertThat(response.getBody().getDataConclusao()).isNull();
        }
    }

    // Métodos auxiliares

    private Todo criarTodoNoBanco(String titulo, String descricao) {
        return criarTodoNoBanco(titulo, descricao, false);
    }

    private Todo criarTodoNoBanco(String titulo, String descricao, boolean concluido) {
        Todo todo = new Todo();
        todo.setTitulo(titulo);
        todo.setDescricao(descricao);
        todo.setConcluido(concluido);
        todo.setDataCriacao(LocalDateTime.now());
        if (concluido) {
            todo.setDataConclusao(LocalDateTime.now());
        }
        return repository.save(todo);
    }

}

package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.model.input.TodoInput;
import br.com.exemplo.todo.domain.model.entity.Todo;
import br.com.exemplo.todo.domain.repository.TodoRepository;
import br.com.exemplo.todo.domain.service.exception.TodoNaoEncontradoException;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class TodoService {

    private final TodoRepository repository;
    private final ModelMapper modelMapper;

    /**
     * Lista todas as tarefas da organizacao atual ordenadas por data de criacao.
     *
     * @return lista de tarefas
     */
    public List<Todo> listarTodos() {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Listando tarefas da organizacao {}", orgId);
        return repository.findByOrganizationIdOrderByDataCriacaoDesc(orgId);
    }

    /**
     * Lista tarefas da organizacao atual filtrando por status de conclusao.
     *
     * @param concluido true para tarefas concluidas, false para pendentes
     * @return lista de tarefas filtradas
     */
    public List<Todo> listarPorStatus(Boolean concluido) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Listando tarefas da organizacao {} com status concluido={}", orgId, concluido);
        return repository.findByOrganizationIdAndConcluidoOrderByDataCriacaoDesc(orgId, concluido);
    }

    /**
     * Busca uma tarefa pelo ID dentro da organizacao atual.
     *
     * @param id ID da tarefa
     * @return a tarefa encontrada
     * @throws TodoNaoEncontradoException se a tarefa nao existir na organizacao
     */
    public Todo buscarPorId(Long id) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Buscando tarefa {} na organizacao {}", id, orgId);
        return repository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new TodoNaoEncontradoException(id));
    }

    /**
     * Cria uma nova tarefa na organizacao atual.
     *
     * @param input dados da tarefa a ser criada
     * @return a tarefa criada
     */
    @Transactional
    public Todo criar(TodoInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Long userId = TenantContext.getUserId();
        log.debug("Criando nova tarefa na organizacao {}: {}", orgId, input.getTitulo());

        Todo todo = modelMapper.map(input, Todo.class);
        todo.setOrganizationId(orgId);
        todo.setCriadoPor(userId);
        todo.setDataCriacao(LocalDateTime.now());
        todo.setConcluido(false);

        Todo salvo = repository.save(todo);
        log.info("Tarefa criada com ID {} na organizacao {}", salvo.getId(), orgId);

        return salvo;
    }

    /**
     * Atualiza uma tarefa existente.
     *
     * @param id    ID da tarefa a ser atualizada
     * @param input novos dados da tarefa
     * @return a tarefa atualizada
     * @throws TodoNaoEncontradoException se a tarefa não existir
     */
    @Transactional
    public Todo atualizar(Long id, TodoInput input) {
        log.debug("Atualizando tarefa com ID {}", id);

        Todo todoExistente = buscarPorId(id);

        todoExistente.setTitulo(input.getTitulo());
        todoExistente.setDescricao(input.getDescricao());

        Todo atualizado = repository.save(todoExistente);
        log.info("Tarefa ID {} atualizada", id);

        return atualizado;
    }

    /**
     * Exclui uma tarefa pelo ID.
     *
     * @param id ID da tarefa a ser excluída
     * @throws TodoNaoEncontradoException se a tarefa não existir
     */
    @Transactional
    public void excluir(Long id) {
        log.debug("Excluindo tarefa com ID {}", id);

        Todo todo = buscarPorId(id);
        repository.delete(todo);

        log.info("Tarefa ID {} excluída", id);
    }

    /**
     * Marca uma tarefa como concluída.
     *
     * @param id ID da tarefa
     * @return a tarefa atualizada
     * @throws TodoNaoEncontradoException se a tarefa não existir
     */
    @Transactional
    public Todo marcarConcluido(Long id) {
        log.debug("Marcando tarefa ID {} como concluída", id);

        Todo todo = buscarPorId(id);
        todo.setConcluido(true);
        todo.setDataConclusao(LocalDateTime.now());

        Todo atualizado = repository.save(todo);
        log.info("Tarefa ID {} marcada como concluída", id);

        return atualizado;
    }

    /**
     * Reabre uma tarefa (marca como não concluída).
     *
     * @param id ID da tarefa
     * @return a tarefa atualizada
     * @throws TodoNaoEncontradoException se a tarefa não existir
     */
    @Transactional
    public Todo reabrir(Long id) {
        log.debug("Reabrindo tarefa ID {}", id);

        Todo todo = buscarPorId(id);
        todo.setConcluido(false);
        todo.setDataConclusao(null);

        Todo atualizado = repository.save(todo);
        log.info("Tarefa ID {} reaberta", id);

        return atualizado;
    }

}

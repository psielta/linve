package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.model.input.TodoInput;
import br.com.exemplo.todo.api.model.output.TodoOutput;
import br.com.exemplo.todo.api.openapi.TodoControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.Todo;
import br.com.exemplo.todo.domain.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/todos", produces = {"application/json", "application/problem+json"})
@PreAuthorize("@tenantSecurity.isMember()")
public class TodoController implements TodoControllerOpenApi {

    private final TodoService todoService;
    private final ModelMapper modelMapper;

    @Override
    @GetMapping
    public List<TodoOutput> listar(@RequestParam(required = false) Boolean concluido) {
        log.debug("GET /todos - concluido={}", concluido);

        List<Todo> todos;
        if (concluido != null) {
            todos = todoService.listarPorStatus(concluido);
        } else {
            todos = todoService.listarTodos();
        }

        return todos.stream()
                .map(this::toOutput)
                .toList();
    }

    @Override
    @GetMapping("/{id}")
    public TodoOutput buscar(@PathVariable Long id) {
        log.debug("GET /todos/{}", id);

        Todo todo = todoService.buscarPorId(id);
        return toOutput(todo);
    }

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TodoOutput criar(@RequestBody @Valid TodoInput input) {
        log.debug("POST /todos - titulo={}", input.getTitulo());

        Todo todo = todoService.criar(input);
        return toOutput(todo);
    }

    @Override
    @PutMapping("/{id}")
    public TodoOutput atualizar(@PathVariable Long id, @RequestBody @Valid TodoInput input) {
        log.debug("PUT /todos/{} - titulo={}", id, input.getTitulo());

        Todo todo = todoService.atualizar(id, input);
        return toOutput(todo);
    }

    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        log.debug("DELETE /todos/{}", id);

        todoService.excluir(id);
    }

    @Override
    @PatchMapping("/{id}/concluir")
    public TodoOutput marcarConcluido(@PathVariable Long id) {
        log.debug("PATCH /todos/{}/concluir", id);

        Todo todo = todoService.marcarConcluido(id);
        return toOutput(todo);
    }

    @Override
    @PatchMapping("/{id}/reabrir")
    public TodoOutput reabrir(@PathVariable Long id) {
        log.debug("PATCH /todos/{}/reabrir", id);

        Todo todo = todoService.reabrir(id);
        return toOutput(todo);
    }

    private TodoOutput toOutput(Todo todo) {
        return modelMapper.map(todo, TodoOutput.class);
    }

}

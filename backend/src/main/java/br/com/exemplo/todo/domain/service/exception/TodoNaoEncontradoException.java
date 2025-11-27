package br.com.exemplo.todo.domain.service.exception;

public class TodoNaoEncontradoException extends RuntimeException {

    public TodoNaoEncontradoException(String message) {
        super(message);
    }

    public TodoNaoEncontradoException(Long id) {
        this(String.format("Tarefa com ID %d não encontrada", id));
    }

}

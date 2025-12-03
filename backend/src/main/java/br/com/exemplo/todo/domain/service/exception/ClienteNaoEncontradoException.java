package br.com.exemplo.todo.domain.service.exception;

public class ClienteNaoEncontradoException extends RuntimeException {

    public ClienteNaoEncontradoException(String message) {
        super(message);
    }

    public ClienteNaoEncontradoException(Long id) {
        this(String.format("Cliente com ID %d nao encontrado", id));
    }
}

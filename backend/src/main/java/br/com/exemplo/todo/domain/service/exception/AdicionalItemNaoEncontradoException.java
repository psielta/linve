package br.com.exemplo.todo.domain.service.exception;

public class AdicionalItemNaoEncontradoException extends RuntimeException {
    public AdicionalItemNaoEncontradoException() {
        super("Item de adicional nao encontrado");
    }
}


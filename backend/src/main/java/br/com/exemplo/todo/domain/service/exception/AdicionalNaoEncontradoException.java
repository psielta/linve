package br.com.exemplo.todo.domain.service.exception;

public class AdicionalNaoEncontradoException extends RuntimeException {
    public AdicionalNaoEncontradoException() {
        super("Adicional nao encontrado");
    }
}


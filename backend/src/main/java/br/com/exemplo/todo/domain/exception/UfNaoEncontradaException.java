package br.com.exemplo.todo.domain.exception;

public class UfNaoEncontradaException extends RuntimeException {

    public UfNaoEncontradaException(String message) {
        super(message);
    }

    public UfNaoEncontradaException(String sigla, boolean isSigla) {
        this(String.format("UF com sigla '%s' nao encontrada", sigla));
    }
}

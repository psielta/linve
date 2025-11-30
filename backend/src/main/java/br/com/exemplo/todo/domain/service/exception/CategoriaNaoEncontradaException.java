package br.com.exemplo.todo.domain.service.exception;

public class CategoriaNaoEncontradaException extends RuntimeException {

    public CategoriaNaoEncontradaException(String message) {
        super(message);
    }

    public CategoriaNaoEncontradaException(Long id) {
        this(String.format("Categoria com ID %d nao encontrada", id));
    }
}


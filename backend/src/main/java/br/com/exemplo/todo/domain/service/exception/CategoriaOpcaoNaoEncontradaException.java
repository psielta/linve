package br.com.exemplo.todo.domain.service.exception;

public class CategoriaOpcaoNaoEncontradaException extends RuntimeException {

    public CategoriaOpcaoNaoEncontradaException(String message) {
        super(message);
    }

    public CategoriaOpcaoNaoEncontradaException(Long id) {
        this(String.format("Opcao de categoria com ID %d nao encontrada", id));
    }
}


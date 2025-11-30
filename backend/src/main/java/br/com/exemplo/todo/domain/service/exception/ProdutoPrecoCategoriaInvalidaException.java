package br.com.exemplo.todo.domain.service.exception;

public class ProdutoPrecoCategoriaInvalidaException extends RuntimeException {
    public ProdutoPrecoCategoriaInvalidaException() {
        super("Opcao de categoria nao pertence a categoria do produto");
    }
}


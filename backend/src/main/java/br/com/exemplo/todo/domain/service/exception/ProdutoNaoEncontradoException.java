package br.com.exemplo.todo.domain.service.exception;

public class ProdutoNaoEncontradoException extends RuntimeException {
    public ProdutoNaoEncontradoException(Long id) {
        super(String.format("Produto com ID %d nao encontrado", id));
    }
}


package br.com.exemplo.todo.domain.service.exception;

public class ProdutoPrecoNaoEncontradoException extends RuntimeException {
    public ProdutoPrecoNaoEncontradoException(Long id) {
        super(String.format("Preco de produto com ID %d nao encontrado", id));
    }
}


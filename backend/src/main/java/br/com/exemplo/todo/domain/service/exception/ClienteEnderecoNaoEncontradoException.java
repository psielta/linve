package br.com.exemplo.todo.domain.service.exception;

public class ClienteEnderecoNaoEncontradoException extends RuntimeException {

    public ClienteEnderecoNaoEncontradoException(String message) {
        super(message);
    }

    public ClienteEnderecoNaoEncontradoException(Long id) {
        this(String.format("Endereco de cliente com ID %d nao encontrado", id));
    }
}

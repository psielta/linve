package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando usuario nao e encontrado na organizacao.
 */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException() {
        super("Usuario nao encontrado");
    }

    public UserNotFoundException(Long userId) {
        super(String.format("Usuario com ID %d nao encontrado", userId));
    }

    public UserNotFoundException(String message) {
        super(message);
    }
}

package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando um email ja esta cadastrado.
 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("Email ja cadastrado: " + email);
    }
}

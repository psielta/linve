package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando ha erro de autenticacao.
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}

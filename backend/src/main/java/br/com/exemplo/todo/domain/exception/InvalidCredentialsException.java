package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando credenciais sao invalidas (email/senha incorretos).
 */
public class InvalidCredentialsException extends AuthenticationException {

    public InvalidCredentialsException() {
        super("Credenciais invalidas");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}

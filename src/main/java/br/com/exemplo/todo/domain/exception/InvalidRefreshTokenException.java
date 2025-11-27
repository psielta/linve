package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando o refresh token e invalido ou expirado.
 */
public class InvalidRefreshTokenException extends AuthenticationException {

    public InvalidRefreshTokenException() {
        super("Refresh token invalido ou expirado");
    }

    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}

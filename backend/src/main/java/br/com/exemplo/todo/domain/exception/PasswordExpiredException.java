package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando a senha do usuario esta expirada e precisa ser trocada.
 */
public class PasswordExpiredException extends AuthenticationException {

    public PasswordExpiredException() {
        super("Senha expirada. Por favor, altere sua senha.");
    }

    public PasswordExpiredException(String message) {
        super(message);
    }
}

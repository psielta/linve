package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando admin tenta desativar a si mesmo.
 */
public class CannotModifySelfException extends RuntimeException {

    public CannotModifySelfException() {
        super("Voce nao pode desativar sua propria conta");
    }

    public CannotModifySelfException(String message) {
        super(message);
    }
}

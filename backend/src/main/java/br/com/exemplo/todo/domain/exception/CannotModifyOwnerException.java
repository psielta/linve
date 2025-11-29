package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando tenta modificar o proprietario (OWNER) da organizacao.
 */
public class CannotModifyOwnerException extends RuntimeException {

    public CannotModifyOwnerException() {
        super("Nao e permitido modificar o proprietario da organizacao");
    }

    public CannotModifyOwnerException(String message) {
        super(message);
    }
}

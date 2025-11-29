package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando organizacao nao e encontrada.
 */
public class OrganizationNotFoundException extends RuntimeException {

    public OrganizationNotFoundException(Long organizationId) {
        super(String.format("Organizacao com ID %d nao encontrada", organizationId));
    }

    public OrganizationNotFoundException(String message) {
        super(message);
    }
}

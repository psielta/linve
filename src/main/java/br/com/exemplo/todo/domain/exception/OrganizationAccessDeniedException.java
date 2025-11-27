package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando usuario tenta acessar organizacao sem permissao.
 */
public class OrganizationAccessDeniedException extends RuntimeException {

    public OrganizationAccessDeniedException(Long organizationId) {
        super("Acesso negado a organizacao: " + organizationId);
    }

    public OrganizationAccessDeniedException(String message) {
        super(message);
    }
}

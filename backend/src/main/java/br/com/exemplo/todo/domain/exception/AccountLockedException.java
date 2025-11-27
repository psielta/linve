package br.com.exemplo.todo.domain.exception;

/**
 * Excecao lancada quando a conta esta bloqueada por tentativas de login.
 */
public class AccountLockedException extends AuthenticationException {

    public AccountLockedException() {
        super("Conta bloqueada temporariamente devido a multiplas tentativas de login");
    }

    public AccountLockedException(String message) {
        super(message);
    }
}

package br.com.exemplo.todo.domain.exception;

public class CulinariaNotFoundException extends RuntimeException {
    public CulinariaNotFoundException(Integer id) {
        super("Culinaria nao encontrada: " + id);
    }
}

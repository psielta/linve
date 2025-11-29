package br.com.exemplo.todo.domain.exception;

import java.util.UUID;

public class StoredFileNotFoundException extends RuntimeException {
    public StoredFileNotFoundException(UUID id) {
        super("Arquivo nao encontrado: " + id);
    }
}

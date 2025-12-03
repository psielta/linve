package br.com.exemplo.todo.domain.service.exception;

public class DocumentoInvalidoException extends RuntimeException {

    public DocumentoInvalidoException(String documento) {
        super(String.format("Documento %s nao e um CPF ou CNPJ valido", documento));
    }
}

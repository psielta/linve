package br.com.exemplo.todo.domain.service.exception;

public class DocumentoJaCadastradoException extends RuntimeException {

    public DocumentoJaCadastradoException(String message) {
        super(message);
    }

    public DocumentoJaCadastradoException(String documento, boolean isCpf) {
        this(String.format("%s %s ja esta cadastrado para outro cliente",
                isCpf ? "CPF" : "CNPJ", documento));
    }
}

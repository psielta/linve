package br.com.exemplo.todo.domain.service.exception;

public class MunicipioNaoEncontradoException extends RuntimeException {

    public MunicipioNaoEncontradoException(String message) {
        super(message);
    }

    public MunicipioNaoEncontradoException(Long codigoIbge) {
        this(String.format("Municipio com codigo IBGE %d nao encontrado", codigoIbge));
    }
}

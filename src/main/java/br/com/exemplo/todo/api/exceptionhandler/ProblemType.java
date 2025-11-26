package br.com.exemplo.todo.api.exceptionhandler;

import br.com.exemplo.todo.domain.service.exception.TodoNaoEncontradoException;
import lombok.Getter;
import lombok.NonNull;

import java.net.URI;
import java.util.stream.Stream;

@Getter
public enum ProblemType {

    TODO_NAO_ENCONTRADO(TodoNaoEncontradoException.class,
            "Tarefa não encontrada", "todo-nao-encontrado"),

    CAMPO_INVALIDO(IllegalArgumentException.class,
            "Campo inválido", "campo-invalido"),

    ERRO_SISTEMA(Exception.class,
            "Erro de sistema não previsto", "erro-de-sistema-nao-previsto");

    private final Class<? extends Exception> classeErro;
    private final String titulo;
    private final String path;

    ProblemType(Class<? extends Exception> classeErro, String titulo, String path) {
        this.classeErro = classeErro;
        this.titulo = titulo;
        this.path = path;
    }

    public URI getURI() {
        return URI.create(String.format("/api/errors/%s", path));
    }

    public static <E extends Exception> ProblemType from(@NonNull final E e) {
        Class<? extends Exception> classeErro = e.getClass();
        return Stream.of(values())
                .filter(t -> t.getClasseErro().equals(classeErro))
                .findFirst()
                .orElse(ERRO_SISTEMA);
    }

}

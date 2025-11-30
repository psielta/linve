package br.com.exemplo.todo.api.exceptionhandler;

import br.com.exemplo.todo.domain.exception.AccountLockedException;
import br.com.exemplo.todo.domain.exception.CannotModifyOwnerException;
import br.com.exemplo.todo.domain.exception.CannotModifySelfException;
import br.com.exemplo.todo.domain.exception.EmailAlreadyExistsException;
import br.com.exemplo.todo.domain.exception.InvalidCredentialsException;
import br.com.exemplo.todo.domain.exception.InvalidRefreshTokenException;
import br.com.exemplo.todo.domain.exception.OrganizationAccessDeniedException;
import br.com.exemplo.todo.domain.exception.OrganizationNotFoundException;
import br.com.exemplo.todo.domain.exception.StoredFileNotFoundException;
import br.com.exemplo.todo.domain.exception.StorageException;
import br.com.exemplo.todo.domain.exception.CulinariaNotFoundException;
import br.com.exemplo.todo.domain.exception.PasswordExpiredException;
import br.com.exemplo.todo.domain.exception.UserNotFoundException;
import br.com.exemplo.todo.domain.service.exception.CategoriaNaoEncontradaException;
import br.com.exemplo.todo.domain.service.exception.CategoriaOpcaoNaoEncontradaException;
import br.com.exemplo.todo.domain.service.exception.TodoNaoEncontradoException;
import lombok.Getter;
import lombok.NonNull;

import java.net.URI;
import java.util.stream.Stream;

@Getter
public enum ProblemType {

    TODO_NAO_ENCONTRADO(TodoNaoEncontradoException.class,
            "Tarefa nao encontrada", "todo-nao-encontrado"),

    CATEGORIA_NAO_ENCONTRADA(CategoriaNaoEncontradaException.class,
            "Categoria nao encontrada", "categoria-nao-encontrada"),

    CATEGORIA_OPCAO_NAO_ENCONTRADA(CategoriaOpcaoNaoEncontradaException.class,
            "Opcao de categoria nao encontrada", "categoria-opcao-nao-encontrada"),

    CAMPO_INVALIDO(IllegalArgumentException.class,
            "Campo invalido", "campo-invalido"),

    CREDENCIAIS_INVALIDAS(InvalidCredentialsException.class,
            "Credenciais invalidas", "credenciais-invalidas"),

    CONTA_BLOQUEADA(AccountLockedException.class,
            "Conta bloqueada", "conta-bloqueada"),

    TOKEN_INVALIDO(InvalidRefreshTokenException.class,
            "Token invalido", "token-invalido"),

    EMAIL_JA_CADASTRADO(EmailAlreadyExistsException.class,
            "Email ja cadastrado", "email-ja-cadastrado"),

    ACESSO_NEGADO_ORGANIZACAO(OrganizationAccessDeniedException.class,
            "Acesso negado a organizacao", "acesso-negado-organizacao"),

    ORGANIZACAO_NAO_ENCONTRADA(OrganizationNotFoundException.class,
            "Organizacao nao encontrada", "organizacao-nao-encontrada"),

    USUARIO_NAO_ENCONTRADO(UserNotFoundException.class,
            "Usuario nao encontrado", "usuario-nao-encontrado"),

    ARQUIVO_NAO_ENCONTRADO(StoredFileNotFoundException.class,
            "Arquivo nao encontrado", "arquivo-nao-encontrado"),

    ERRO_ARMAZENAMENTO(StorageException.class,
            "Erro ao acessar o armazenamento de arquivos", "erro-armazenamento"),

    CULINARIA_NAO_ENCONTRADA(CulinariaNotFoundException.class,
            "Culinaria nao encontrada", "culinaria-nao-encontrada"),

    NAO_PODE_MODIFICAR_OWNER(CannotModifyOwnerException.class,
            "Nao e permitido modificar o proprietario", "nao-pode-modificar-owner"),

    NAO_PODE_MODIFICAR_SI_MESMO(CannotModifySelfException.class,
            "Nao e permitido modificar sua propria conta", "nao-pode-modificar-si-mesmo"),

    SENHA_EXPIRADA(PasswordExpiredException.class,
            "Senha expirada", "senha-expirada"),

    ERRO_SISTEMA(Exception.class,
            "Erro de sistema nao previsto", "erro-de-sistema-nao-previsto");

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

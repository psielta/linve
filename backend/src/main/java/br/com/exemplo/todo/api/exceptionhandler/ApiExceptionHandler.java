package br.com.exemplo.todo.api.exceptionhandler;

import br.com.exemplo.todo.domain.exception.AccountLockedException;
import br.com.exemplo.todo.domain.exception.AuthenticationException;
import br.com.exemplo.todo.domain.exception.CannotModifyOwnerException;
import br.com.exemplo.todo.domain.exception.CannotModifySelfException;
import br.com.exemplo.todo.domain.exception.EmailAlreadyExistsException;
import br.com.exemplo.todo.domain.exception.InvalidCredentialsException;
import br.com.exemplo.todo.domain.exception.InvalidRefreshTokenException;
import br.com.exemplo.todo.domain.exception.OrganizationAccessDeniedException;
import br.com.exemplo.todo.domain.exception.StoredFileNotFoundException;
import br.com.exemplo.todo.domain.exception.StorageException;
import br.com.exemplo.todo.domain.exception.CulinariaNotFoundException;
import br.com.exemplo.todo.domain.exception.PasswordExpiredException;
import br.com.exemplo.todo.domain.exception.UserNotFoundException;
import br.com.exemplo.todo.domain.service.exception.CategoriaNaoEncontradaException;
import br.com.exemplo.todo.domain.service.exception.CategoriaOpcaoNaoEncontradaException;
import br.com.exemplo.todo.domain.service.exception.AdicionalNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.AdicionalItemNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.AdicionalSelecaoInvalidaException;
import br.com.exemplo.todo.domain.service.exception.ProdutoNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.ProdutoPrecoCategoriaInvalidaException;
import br.com.exemplo.todo.domain.service.exception.ProdutoPrecoNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.TodoNaoEncontradoException;
import br.com.exemplo.todo.domain.exception.UfNaoEncontradaException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.Instant;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(@NonNull Exception ex, @Nullable Object body,
            @NonNull HttpHeaders headers, @NonNull HttpStatusCode statusCode, @NonNull WebRequest request) {

        // Estrategia de log: 5xx = ERROR (erros reais), 4xx = INFO (erros de cliente)
        if (statusCode.is5xxServerError()) {
            log.error("Erro interno: ", ex);
        } else {
            log.info("Erro cliente [{}]: {} | URI: {}",
                    statusCode.value(),
                    ex.getMessage(),
                    request.getDescription(false));
        }

        return super.handleExceptionInternal(ex, body, headers, statusCode, request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(@NonNull MethodArgumentNotValidException ex,
            @NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {

        HttpStatus httpStatus = HttpStatus.BAD_REQUEST;

        log.info("Validacao falhou: {} campos invalidos | URI: {}",
                ex.getBindingResult().getErrorCount(),
                request.getDescription(false));

        ProblemDetail problemDetail = createProblem(ex, httpStatus);
        problemDetail.setTitle("Campos invalidos.");

        StringBuilder detailMessage = new StringBuilder("Um ou mais campos sao invalidos - ");
        ex.getBindingResult().getFieldErrors().forEach(error ->
                detailMessage.append(String.format("[%s: %s] ", error.getField(), error.getDefaultMessage()))
        );
        problemDetail.setDetail(detailMessage.toString());

        return handleExceptionInternal(ex, problemDetail, headers, httpStatus, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Object> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, WebRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetail problemDetail = createProblem(ex, status);
        problemDetail.setDetail(String.format("Parametro invalido [%s: %s] ", ex.getPropertyName(), ex.getValue()));

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(TodoNaoEncontradoException.class)
    public ResponseEntity<Object> handleTodoNaoEncontradoException(
            TodoNaoEncontradoException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(CategoriaNaoEncontradaException.class)
    public ResponseEntity<Object> handleCategoriaNaoEncontradaException(
            CategoriaNaoEncontradaException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(CategoriaOpcaoNaoEncontradaException.class)
    public ResponseEntity<Object> handleCategoriaOpcaoNaoEncontradaException(
            CategoriaOpcaoNaoEncontradaException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(ProdutoNaoEncontradoException.class)
    public ResponseEntity<Object> handleProdutoNaoEncontradoException(
            ProdutoNaoEncontradoException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(ProdutoPrecoNaoEncontradoException.class)
    public ResponseEntity<Object> handleProdutoPrecoNaoEncontradoException(
            ProdutoPrecoNaoEncontradoException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(ProdutoPrecoCategoriaInvalidaException.class)
    public ResponseEntity<Object> handleProdutoPrecoCategoriaInvalidaException(
            ProdutoPrecoCategoriaInvalidaException ex, WebRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler({AdicionalNaoEncontradoException.class, AdicionalItemNaoEncontradoException.class})
    public ResponseEntity<Object> handleAdicionalNotFound(RuntimeException ex, WebRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);
        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(AdicionalSelecaoInvalidaException.class)
    public ResponseEntity<Object> handleAdicionalSelecaoInvalida(
            AdicionalSelecaoInvalidaException ex, WebRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetail problemDetail = createProblem(ex, status);
        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Object> handleInvalidCredentialsException(
            InvalidCredentialsException ex, WebRequest request) {

        HttpStatus status = HttpStatus.UNAUTHORIZED;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Object> handleAccountLockedException(
            AccountLockedException ex, WebRequest request) {

        HttpStatus status = HttpStatus.LOCKED;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<Object> handleInvalidRefreshTokenException(
            InvalidRefreshTokenException ex, WebRequest request) {

        HttpStatus status = HttpStatus.UNAUTHORIZED;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Object> handleEmailAlreadyExistsException(
            EmailAlreadyExistsException ex, WebRequest request) {

        HttpStatus status = HttpStatus.CONFLICT;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(OrganizationAccessDeniedException.class)
    public ResponseEntity<Object> handleOrganizationAccessDeniedException(
            OrganizationAccessDeniedException ex, WebRequest request) {

        HttpStatus status = HttpStatus.FORBIDDEN;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFoundException(
            UserNotFoundException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(CannotModifyOwnerException.class)
    public ResponseEntity<Object> handleCannotModifyOwnerException(
            CannotModifyOwnerException ex, WebRequest request) {

        HttpStatus status = HttpStatus.FORBIDDEN;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(CannotModifySelfException.class)
    public ResponseEntity<Object> handleCannotModifySelfException(
            CannotModifySelfException ex, WebRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(PasswordExpiredException.class)
    public ResponseEntity<Object> handlePasswordExpiredException(
            PasswordExpiredException ex, WebRequest request) {

        HttpStatus status = HttpStatus.FORBIDDEN;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(StoredFileNotFoundException.class)
    public ResponseEntity<Object> handleStoredFileNotFoundException(
            StoredFileNotFoundException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<Object> handleStorageException(StorageException ex, WebRequest request) {

        HttpStatus status = HttpStatus.BAD_GATEWAY;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(CulinariaNotFoundException.class)
    public ResponseEntity<Object> handleCulinariaNotFoundException(
            CulinariaNotFoundException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(UfNaoEncontradaException.class)
    public ResponseEntity<Object> handleUfNaoEncontradaException(
            UfNaoEncontradaException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {

        HttpStatus status = HttpStatus.FORBIDDEN;
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, "Acesso negado");
        problemDetail.setType(ProblemType.ACESSO_NEGADO_ORGANIZACAO.getURI());
        problemDetail.setTitle("Acesso negado");
        problemDetail.setProperty("timestamp", Instant.now());

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ProblemDetail problemDetail = createProblem(ex, status);

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    private static <E extends Exception> ProblemDetail createProblem(E ex, HttpStatus status) {
        ProblemType type = ProblemType.from(ex);
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
        problemDetail.setType(type.getURI());
        problemDetail.setTitle(type.getTitulo());
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

}






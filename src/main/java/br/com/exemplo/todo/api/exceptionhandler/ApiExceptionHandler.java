package br.com.exemplo.todo.api.exceptionhandler;

import br.com.exemplo.todo.domain.service.exception.TodoNaoEncontradoException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
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

        // Estratégia de log: 5xx = ERROR (erros reais), 4xx = INFO (erros de cliente)
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

        log.info("Validação falhou: {} campos inválidos | URI: {}",
                ex.getBindingResult().getErrorCount(),
                request.getDescription(false));

        ProblemDetail problemDetail = createProblem(ex, httpStatus);
        problemDetail.setTitle("Campos inválidos.");

        StringBuilder detailMessage = new StringBuilder("Um ou mais campos são inválidos - ");
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
        problemDetail.setDetail(String.format("Parâmetro inválido [%s: %s] ", ex.getPropertyName(), ex.getValue()));

        return handleExceptionInternal(ex, problemDetail, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(TodoNaoEncontradoException.class)
    public ResponseEntity<Object> handleTodoNaoEncontradoException(
            TodoNaoEncontradoException ex, WebRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetail problemDetail = createProblem(ex, status);

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

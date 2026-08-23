package global.oei.application.web.config.web;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.filter.CorrelationIdFilter;

/**
 * Central HTTP exception mapping for every REST resource.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleResponseStatusException(
            final ResponseStatusException exception,
            final HttpServletRequest request) {
        return buildProblem(
                exception.getStatusCode(),
                exception.getReason() != null ? exception.getReason() : exception.getStatusCode().toString(),
                request,
                "urn:oei:error:http-status");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValid(
            final MethodArgumentNotValidException exception,
            final HttpServletRequest request) {
        final ProblemDetail problem = buildProblem(
                HttpStatus.BAD_REQUEST,
                "Request validation failed.",
                request,
                "urn:oei:error:validation");
        final Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage() != null
                    ? fieldError.getDefaultMessage()
                    : "Invalid value");
        }
        problem.setProperty("errors", fieldErrors);
        return problem;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(
            final ConstraintViolationException exception,
            final HttpServletRequest request) {
        final ProblemDetail problem = buildProblem(
                HttpStatus.BAD_REQUEST,
                "Request validation failed.",
                request,
                "urn:oei:error:validation");
        final Map<String, String> violations = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                violations.put(violation.getPropertyPath().toString(), violation.getMessage()));
        problem.setProperty("errors", violations);
        return problem;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgumentException(
            final IllegalArgumentException exception,
            final HttpServletRequest request) {
        return buildProblem(
                HttpStatus.BAD_REQUEST,
                exception.getMessage() != null ? exception.getMessage() : "Invalid request.",
                request,
                "urn:oei:error:bad-request");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleIllegalStateException(
            final IllegalStateException exception,
            final HttpServletRequest request) {
        LOG.warn("Business/state conflict on {}: {}", request.getRequestURI(), exception.getMessage());
        return buildProblem(
                HttpStatus.CONFLICT,
                exception.getMessage() != null ? exception.getMessage() : "State conflict.",
                request,
                "urn:oei:error:state-conflict");
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpectedException(
            final Exception exception,
            final HttpServletRequest request) {
        LOG.error("Unhandled server exception on {}", request.getRequestURI(), exception);
        return buildProblem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error.",
                request,
                "urn:oei:error:internal");
    }

    private static ProblemDetail buildProblem(
            final HttpStatusCode status,
            final String detail,
            final HttpServletRequest request,
            final String type) {
        final ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(HttpStatus.valueOf(status.value()).getReasonPhrase());
        problem.setType(URI.create(type));
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("path", request.getRequestURI());
        final String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
        if (correlationId != null && !correlationId.isBlank()) {
            problem.setProperty("correlationId", correlationId);
        }
        return problem;
    }
}


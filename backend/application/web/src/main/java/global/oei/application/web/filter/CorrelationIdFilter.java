package global.oei.application.web.filter;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.jspecify.annotations.NonNull;
import org.slf4j.MDC;

/**
 * Servlet filter that propagates a {@code X-Correlation-ID} header (set by the Angular
 * frontend's {@code HttpLoggingInterceptor}) into the SLF4J MDC so that every log line
 * emitted during the same request carries the same {@code correlationId}.  If the header
 * is absent or blank a random UUID is generated for the server-side span.
 *
 * <p>The MDC key {@code correlationId} is included by the Logstash encoder (see
 * {@code logback-spring.xml}) as a top-level JSON field and extracted by Promtail as a
 * label — matching the key the frontend already logs
 * ({@code logging.service.ts}: {@code correlationId}).</p>
 *
 * <p>{@code @Order(1)} ensures this runs before Spring Security filters so the
 * correlation ID is available in security-layer log statements too.</p>
 */
@Component
@Order(1)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Correlation-ID";
    public static final String MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(
            final @NonNull HttpServletRequest request,
            final HttpServletResponse response,
            final FilterChain filterChain)
            throws ServletException, IOException {

        final String correlationId = resolveCorrelationId(request);
        MDC.put(MDC_KEY, correlationId);
        // Echo the correlation ID back so the frontend can correlate async responses
        response.setHeader(HEADER, correlationId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    private static String resolveCorrelationId(final HttpServletRequest request) {
        final String header = request.getHeader(HEADER);
        return (header != null && !header.isBlank()) ? header : UUID.randomUUID().toString();
    }
}

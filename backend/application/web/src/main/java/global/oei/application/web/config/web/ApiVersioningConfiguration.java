package global.oei.application.web.config.web;

import org.jspecify.annotations.NonNull;
import org.springframework.boot.webmvc.autoconfigure.WebMvcRegistrations;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

/**
 * Enables Spring MVC native API versioning via the {@code API-Version} request header while
 * keeping the current path-based {@code /v1} routes working as the default version.
 */
@Configuration(proxyBeanMethods = false)
public class ApiVersioningConfiguration implements WebMvcConfigurer, WebMvcRegistrations {

    static final String API_VERSION_HEADER = "API-Version";
    static final String DEFAULT_API_VERSION = "1";

    /**
     * Configures native API versioning via the {@code API-Version} HTTP header.
     *
     * <p><strong>Fallback behaviour:</strong> if no {@code API-Version} header is sent, the
     * request is routed to version {@code 1}, which is the only supported version today.</p>
     */
    @Override
    public void configureApiVersioning(final ApiVersionConfigurer configurer) {
        configurer
                .useRequestHeader(API_VERSION_HEADER)
                .setDefaultVersion(DEFAULT_API_VERSION);
    }

    @Override
    public RequestMappingHandlerMapping getRequestMappingHandlerMapping() {
        return new ApiV1RequestMappingHandlerMapping();
    }
}

final class ApiV1RequestMappingHandlerMapping extends RequestMappingHandlerMapping {

    private static final String API_PREFIX = "/api/";
    private static final String VERSION_SEGMENT = "/v1";

    @Override
    protected RequestMappingInfo getMappingForMethod(final java.lang.reflect.@NonNull Method method, final @NonNull Class<?> handlerType) {
        final RequestMappingInfo mapping = super.getMappingForMethod(method, handlerType);
        if (mapping == null || hasDeclaredVersion(mapping) || !isApiV1Path(mapping)) {
            return mapping;
        }
        return mapping.mutate().version(ApiVersioningConfiguration.DEFAULT_API_VERSION).build();
    }

    private static boolean hasDeclaredVersion(final RequestMappingInfo mapping) {
        return mapping.getVersionCondition().getVersion() != null;
    }

    private static boolean isApiV1Path(final RequestMappingInfo mapping) {
        return mapping.getPatternValues().stream()
                .anyMatch(path -> path.startsWith(API_PREFIX)
                        && (path.contains(VERSION_SEGMENT + "/") || path.endsWith(VERSION_SEGMENT)));
    }
}



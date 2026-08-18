package global.oei.application.web.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed binding for Loki endpoint configuration consumed by logback-spring.xml.
 */
@ConfigurationProperties(prefix = "oei.logging.loki")
public record OeiLokiLoggingProperties(String url) {
}


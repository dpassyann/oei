package global.oei.infrastructure.mail;

import java.util.Set;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

/**
 * Registers a second, {@code TemplateMode.TEXT} Thymeleaf resolver dedicated to the plain-text
 * fallback of each email (see {@code .prompt/plan/store/03-emails-transactionnels.md §1}: a
 * distinct {@code .txt} template per email, never a degraded HTML-stripped fallback).
 *
 * <p>Spring Boot's autoconfigured resolver only handles the default {@code .html}/{@code HTML}
 * mode pair; Spring picks up both {@link ITemplateResolver} beans and adds them to the same
 * {@code SpringTemplateEngine}. This resolver only ever matches {@code email/*-text} template
 * names (via {@link ClassLoaderTemplateResolver#setResolvablePatterns(Set)}) and is tried before
 * Boot's default resolver, so it never shadows ordinary HTML templates elsewhere in the
 * application. A plain {@link ClassLoaderTemplateResolver} is used (rather than
 * {@code SpringResourceTemplateResolver}) so this resolver — and the tests exercising it — never
 * require a live {@code ApplicationContext}.</p>
 */
@Configuration
public class EmailTemplateConfiguration {

    @Bean
    public ITemplateResolver emailTextTemplateResolver() {
        final ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".txt");
        resolver.setTemplateMode(TemplateMode.TEXT);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setResolvablePatterns(Set.of("email/*-text"));
        resolver.setOrder(0);
        resolver.setCheckExistence(true);
        return resolver;
    }
}

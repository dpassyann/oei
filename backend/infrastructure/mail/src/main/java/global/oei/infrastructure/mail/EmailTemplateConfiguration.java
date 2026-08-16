package global.oei.infrastructure.mail;

import java.nio.charset.StandardCharsets;
import java.util.Set;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

/**
 * Registers a second, {@code TemplateMode.TEXT} Thymeleaf resolver dedicated to the plain-text
 * fallback of each email (see {@code .prompt/plan/store/03-emails-transactionnels.md §1}: a
 * distinct {@code .txt} template per email, never a degraded HTML-stripped fallback), and the
 * {@link MessageSource} every email template's {@code #{...}} expressions resolve through.
 *
 * <p>Spring Boot's autoconfigured resolver only handles the default {@code .html}/{@code HTML}
 * mode pair; Spring picks up both {@link ITemplateResolver} beans and adds them to the same
 * {@code SpringTemplateEngine}. This resolver only ever matches {@code email/*-text} template
 * names (via {@link ClassLoaderTemplateResolver#setResolvablePatterns(Set)}) and is tried before
 * Boot's default resolver, so it never shadows ordinary HTML templates elsewhere in the
 * application. A plain {@link ClassLoaderTemplateResolver} is used (rather than
 * {@code SpringResourceTemplateResolver}) so this resolver — and the tests exercising it — never
 * require a live {@code ApplicationContext}.</p>
 *
 * <p>The message source bean is deliberately named {@code messageSource}: within a real
 * {@code ApplicationContext}, {@code SpringTemplateEngine} (which implements
 * {@code ApplicationContextAware}) automatically resolves {@code #{...}} expressions against
 * exactly that bean name, with no further wiring needed. {@code EmailNotificationAdapterTest}
 * (a plain unit test, no {@code ApplicationContext}) wires the same bean directly into a
 * standalone {@code SpringTemplateEngine} via {@code setTemplateEngineMessageSource(...)}.</p>
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

    /**
     * Backs every {@code #{...}} expression in {@code src/main/resources/templates/email/*} —
     * basename {@code email/messages} resolves {@code email/messages_fr.properties},
     * {@code email/messages_en.properties}, {@code email/messages_es.properties},
     * {@code email/messages_de.properties}, {@code email/messages_it.properties},
     * {@code email/messages_pt.properties} (plain {@code email/messages.properties}, French, as
     * the ultimate fallback) — never a hardcoded French/English string in a template itself.
     */
    @Bean
    public MessageSource messageSource() {
        final ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:email/messages");
        messageSource.setDefaultEncoding(StandardCharsets.UTF_8.name());
        messageSource.setFallbackToSystemLocale(false);
        messageSource.setUseCodeAsDefaultMessage(true);
        return messageSource;
    }
}

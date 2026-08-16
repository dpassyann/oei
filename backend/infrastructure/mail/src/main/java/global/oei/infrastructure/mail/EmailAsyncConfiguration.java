package global.oei.infrastructure.mail;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Dedicated thread pool for {@link EmailNotificationAdapter}: a slow/failed SMTP send must
 * never block/fail the HTTP request or transaction that triggered it (see
 * {@code EmailNotificationPort}'s Javadoc and {@code .prompt/plan/store/03-emails-transactionnels.md §3}).
 *
 * <p>A small, dedicated {@code @Async} executor is chosen over Spring's default
 * {@code SimpleAsyncTaskExecutor} (unbounded, one thread per task) so that a burst of
 * transactional emails cannot exhaust threads meant for other {@code @Async} work elsewhere
 * in the application; it is also chosen over an event-driven ({@code @EventListener(async)})
 * design because the three call sites already inject {@code EmailNotificationPort} directly
 * and a dedicated method per use case (see the port's Javadoc) reads more clearly than
 * introducing a new domain event type for each one at this stage.</p>
 */
@Configuration
@EnableAsync
public class EmailAsyncConfiguration {

    public static final String EXECUTOR_BEAN_NAME = "mailTaskExecutor";

    @Bean(EXECUTOR_BEAN_NAME)
    public Executor mailTaskExecutor() {
        final ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("oei-mail-");
        executor.initialize();
        return executor;
    }
}

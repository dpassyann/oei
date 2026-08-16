package global.oei.acceptance;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import global.oei.application.web.OeiBackendApplication;
import io.cucumber.spring.CucumberContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Bridges Cucumber to Spring's {@code TestContextManager}: every step-definition class in
 * this module is a Spring bean (constructor-injected), sharing one real application context
 * per scenario run, booted against a real Testcontainers Postgres (never H2) with the real
 * Liquibase changelog + demo data applied — exactly the environment production runs in.
 * {@link AcceptanceTestSecurityConfig} replaces the real OAuth2 JWT decoder with one that
 * trusts any {@code subject|role1,role2} token verbatim, since there is no real Keycloak
 * realm available in this test environment (see that class's own Javadoc).
 *
 * <p>{@code AcceptanceTestSecurityConfig} is listed directly in {@code @SpringBootTest(classes
 * = ...)} rather than via {@code @Import} on this class: with an explicit {@code classes}
 * attribute, Spring Boot's test bootstrapper registers exactly those classes as primary
 * sources and never adds this carrier class itself, so an {@code @Import} placed here would be
 * silently ignored (verified against {@code SpringBootTestContextBootstrapper}: it only walks
 * up from the test class to auto-detect a {@code @SpringBootConfiguration} when {@code classes}
 * is left unset).
 *
 * <p>Deliberately does NOT use {@code @Testcontainers}/{@code @Container}: those are a JUnit
 * Jupiter extension, and Cucumber never runs JUnit extensions against this class (it only
 * uses it as a plain {@code @CucumberContextConfiguration} carrier). The container is instead
 * started eagerly in a static initializer, once per JVM, shared across every scenario.
 *
 * <p>{@code STRIPE_WIRE_MOCK} plays the same role for the store "pay by card" scenario as
 * {@link AcceptanceTestSecurityConfig} plays for authentication: {@code oei.payment.stripe.
 * api-base-url} is redirected to this local stub so {@code StripePaymentProviderAdapter}
 * (wired for real, unmodified, by {@code OeiWiringConfiguration}) never reaches the real
 * Stripe API, even in sandbox mode — see {@code store.feature}.</p>
 */
@CucumberContextConfiguration
@SpringBootTest(classes = {OeiBackendApplication.class, AcceptanceTestSecurityConfig.class},
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CucumberSpringConfiguration {

    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static final WireMockServer STRIPE_WIRE_MOCK = new WireMockServer(WireMockConfiguration.options().dynamicPort());

    static {
        POSTGRES.start();
        STRIPE_WIRE_MOCK.start();
        STRIPE_WIRE_MOCK.stubFor(WireMock.post(WireMock.urlEqualTo("/payment_intents"))
                .willReturn(WireMock.aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"id":"pi_acceptance_test","object":"payment_intent","status":"succeeded","amount":990,"currency":"eur"}
                                """)));
    }

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("oei.payment.stripe.api-base-url", STRIPE_WIRE_MOCK::baseUrl);
    }
}

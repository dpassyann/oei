package global.oei.application.web.config.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;

/**
 * OpenAPI/Swagger configuration for the OEI HTTP adapter.
 */
@Configuration(proxyBeanMethods = false)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI(
            @Value("${spring.application.version:1.0.0-SNAPSHOT}") final String version,
            @Value("${spring.application.name:oei-backend}") final String title,
            @Value("${spring.application.description:OEI Backend API}") final String description) {

        return new OpenAPI()
                .components(new Components())
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .info(new Info()
                        .title(title)
                        .version(version)
                        .description(description)
                        .license(new License()
                                .name("OEI Proprietary")
                                .url("https://theitorder.global"))
                        .contact(new Contact()
                                .name("OEI Platform Team")
                                .email("platform@theitorder.global")
                                .url("https://theitorder.global")));
    }
}



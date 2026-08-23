package global.oei.application.web.config.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;

class ApiVersioningConfigurationTest {

    @Test
    void givenApiV1Route_whenHeaderMissing_thenDefaultVersionOneStillMatches() throws Exception {
        final MockMvc mockMvc = mockMvc();

        mockMvc.perform(get("/api/member/v1/version-probe"))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }

    @Test
    void givenApiV1Route_whenHeaderMatchesVersionOne_thenRequestIsHandled() throws Exception {
        final MockMvc mockMvc = mockMvc();

        mockMvc.perform(get("/api/member/v1/version-probe").header(ApiVersioningConfiguration.API_VERSION_HEADER, "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }

    @Test
    void givenApiV1Route_whenHeaderRequestsAnotherVersion_thenNoHandlerMatches() throws Exception {
        final MockMvc mockMvc = mockMvc();

        mockMvc.perform(get("/api/member/v1/version-probe").header(ApiVersioningConfiguration.API_VERSION_HEADER, "2"))
                .andExpect(status().isBadRequest());
    }

    private static MockMvc mockMvc() {
        final ApiVersioningConfiguration configuration = new ApiVersioningConfiguration();
        final TestApiVersionConfigurer configurer = new TestApiVersionConfigurer();
        configuration.configureApiVersioning(configurer);
        return MockMvcBuilders.standaloneSetup(new VersionProbeResource())
                .setCustomHandlerMapping(ApiV1RequestMappingHandlerMapping::new)
                .setApiVersionStrategy(configurer.strategy())
                .build();
    }

    private static final class TestApiVersionConfigurer extends ApiVersionConfigurer {

        org.springframework.web.accept.ApiVersionStrategy strategy() {
            return super.getApiVersionStrategy();
        }
    }

    @RestController
    private static final class VersionProbeResource {

        @GetMapping("/api/member/v1/version-probe")
        String probe() {
            return "ok";
        }
    }
}



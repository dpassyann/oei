package global.oei.infrastructure.client.linkedin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import global.oei.domain.shared.profile.LinkedinBasicIdentity;
import global.oei.infrastructure.client.linkedin.generated.model.LinkedinUserInfoDto;

class LinkedinProfileClientTest {

    @Test
    void givenAccessToken_whenFetchingBasicIdentity_thenAddsBearerPrefix() {
        final LinkedinUserInfoDto responseBody = new LinkedinUserInfoDto();
        responseBody.setSub("sub-1");
        responseBody.setName("Jane Doe");
        responseBody.setLocale("fr-FR");

        final LinkedinProfileClient client = new LinkedinProfileClient(authorizationHeader -> {
            assertThat((String) authorizationHeader).isEqualTo("Bearer token-123");
            return ResponseEntity.ok(responseBody);
        });

        final LinkedinBasicIdentity identity = client.fetchBasicIdentity("token-123");

        assertThat(identity.displayName()).isEqualTo("Jane Doe");
        assertThat(identity.legalName()).isEqualTo("Jane Doe");
        assertThat(identity.locale()).isEqualTo("fr-FR");
        assertThat(identity.country()).isEqualTo("fr-FR");
    }

    @Test
    void givenBlankAccessToken_whenFetchingBasicIdentity_thenThrowsIllegalArgumentException() {
        final LinkedinProfileClient client = new LinkedinProfileClient(unusedAuthorizationHeader -> {
            throw new IllegalStateException("should not be called");
        });

        assertThatThrownBy(() -> client.fetchBasicIdentity("  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("accessToken must not be blank");
    }
}


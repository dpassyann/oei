package global.oei.domain.shared.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Set;

import org.junit.jupiter.api.Test;

class AuthenticatedIdentityTest {

    @Test
    void hasRole_trueWhenRolePresent() {
        final AuthenticatedIdentity identity =
                new AuthenticatedIdentity("sub-1", "jane@oei.org", "Jane Doe", Set.of("member", "member-gold"), null);

        assertThat(identity.hasRole("member-gold")).isTrue();
        assertThat(identity.hasRole("admin")).isFalse();
    }

    @Test
    void constructor_defaultsNullRolesToEmptySet() {
        final AuthenticatedIdentity identity = new AuthenticatedIdentity("sub-1", null, null, null, null);

        assertThat(identity.roles()).isEmpty();
    }

    @Test
    void constructor_rejectsBlankSubject() {
        assertThatThrownBy(() -> new AuthenticatedIdentity("  ", null, null, Set.of(), null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNullSubject() {
        assertThatThrownBy(() -> new AuthenticatedIdentity(null, null, null, Set.of(), null))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void roles_areImmutable() {
        final AuthenticatedIdentity identity = new AuthenticatedIdentity("sub-1", null, null, Set.of("member"), null);

        assertThatThrownBy(() -> identity.roles().add("admin"))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}

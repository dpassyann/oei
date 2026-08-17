package global.oei.domain.shared.member;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MemberTest {

    @Test
    void constructor_acceptsFullyPopulatedMember() {
        new Member(
                MemberId.newId(),
                "jane-doe",
                "Jane Doe",
                "Jane Marie Doe",
                "fr",
                "CH",
                AccountType.REAL,
                Instant.now());
    }

    @Test
    void constructor_rejectsNullId() {
        assertThatThrownBy(() -> new Member(null, "slug", "Name", "Legal", "fr", "CH", AccountType.REAL, Instant.now()))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void constructor_rejectsBlankPublicSlug() {
        assertThatThrownBy(() -> new Member(
                        MemberId.newId(), "  ", "Name", "Legal", "fr", "CH", AccountType.REAL, Instant.now()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNullAccountType() {
        assertThatThrownBy(() -> new Member(
                        MemberId.newId(), "slug", "Name", "Legal", "fr", "CH", null, Instant.now()))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void constructor_rejectsNullCreatedAt() {
        assertThatThrownBy(() -> new Member(
                        MemberId.newId(), "slug", "Name", "Legal", "fr", "CH", AccountType.REAL, null))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void isDemoAccount_trueOnlyForDemoAccountType() {
        final Member demo = new Member(
                MemberId.newId(), "slug", "Name", "Legal", "fr", "CH", AccountType.DEMO, Instant.now());
        final Member real = new Member(
                MemberId.newId(), "slug", "Name", "Legal", "fr", "CH", AccountType.REAL, Instant.now());

        assertThat(demo.isDemoAccount()).isTrue();
        assertThat(real.isDemoAccount()).isFalse();
    }
}

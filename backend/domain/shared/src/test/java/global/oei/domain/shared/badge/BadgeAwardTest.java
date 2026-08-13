package global.oei.domain.shared.badge;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;

class BadgeAwardTest {

    @Test
    void constructor_acceptsValidAward() {
        new BadgeAward("a1", "b1", MemberId.newId(), Instant.now(), BadgeAwardSource.AUTOMATIC, null, false);
    }

    @Test
    void constructor_rejectsNullSource() {
        assertThatThrownBy(() -> new BadgeAward("a1", "b1", MemberId.newId(), Instant.now(), null, null, false))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void constructor_rejectsNullMemberId() {
        assertThatThrownBy(() -> new BadgeAward("a1", "b1", null, Instant.now(), BadgeAwardSource.AUTOMATIC, null, false))
                .isInstanceOf(NullPointerException.class);
    }
}

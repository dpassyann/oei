package global.oei.domain.shared.member;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MemberIdTest {

    @Test
    void newId_generatesDistinctRandomIds() {
        assertThat(MemberId.newId()).isNotEqualTo(MemberId.newId());
    }

    @Test
    void of_parsesValidUuidString() {
        final UUID raw = UUID.randomUUID();

        assertThat(MemberId.of(raw.toString())).isEqualTo(new MemberId(raw));
    }

    @Test
    void of_rejectsInvalidUuidString() {
        assertThatThrownBy(() -> MemberId.of("not-a-uuid"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNullValue() {
        assertThatThrownBy(() -> new MemberId(null))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void equality_isBasedOnWrappedUuid() {
        final UUID raw = UUID.randomUUID();

        assertThat(new MemberId(raw)).isEqualTo(new MemberId(raw)).hasSameHashCodeAs(new MemberId(raw));
    }

    @Test
    void toString_returnsUuidRepresentation() {
        final UUID raw = UUID.randomUUID();

        assertThat(new MemberId(raw)).hasToString(raw.toString());
    }
}

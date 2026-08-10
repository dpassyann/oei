package org.oei.domain.shared.member;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;

import org.junit.jupiter.api.Test;

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
                Instant.now());
    }

    @Test
    void constructor_rejectsNullId() {
        assertThatThrownBy(() -> new Member(null, "slug", "Name", "Legal", "fr", "CH", Instant.now()))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void constructor_rejectsBlankPublicSlug() {
        assertThatThrownBy(() -> new Member(MemberId.newId(), "  ", "Name", "Legal", "fr", "CH", Instant.now()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNullCreatedAt() {
        assertThatThrownBy(() -> new Member(MemberId.newId(), "slug", "Name", "Legal", "fr", "CH", null))
                .isInstanceOf(NullPointerException.class);
    }
}

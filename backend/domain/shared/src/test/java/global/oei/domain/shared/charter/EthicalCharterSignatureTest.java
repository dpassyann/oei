package global.oei.domain.shared.charter;

import global.oei.domain.shared.member.MemberId;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EthicalCharterSignatureTest {

    @Test
    void constructor_acceptsValidSignature() {
        new EthicalCharterSignature(UUID.randomUUID(), MemberId.newId(), "2026.1", Instant.now());
    }

    @Test
    void constructor_rejectsBlankVersion() {
        assertThatThrownBy(() -> new EthicalCharterSignature(UUID.randomUUID(), MemberId.newId(), " ", Instant.now()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNullMemberId() {
        assertThatThrownBy(() -> new EthicalCharterSignature(UUID.randomUUID(), null, "2026.1", Instant.now()))
                .isInstanceOf(NullPointerException.class);
    }
}

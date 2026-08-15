package global.oei.domain.shared.home;

import java.time.Instant;
import java.util.Objects;

/**
 * An email address captured from the public "receive the white paper" form. Per this
 * operation's OpenAPI summary, this is simulated (no real mailing list/CRM integration is
 * wired yet) but is genuinely persisted, never a silent no-op.
 */
public record Lead(String id, String email, Instant submittedAt) {

    public Lead {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(submittedAt, "submittedAt must not be null");
    }
}

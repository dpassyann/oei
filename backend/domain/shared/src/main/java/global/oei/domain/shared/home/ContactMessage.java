package global.oei.domain.shared.home;

import java.time.Instant;
import java.util.Objects;

/**
 * A message submitted from the public contact form. Per this operation's OpenAPI summary, no
 * real email is sent yet, but the message is genuinely persisted for later follow-up, never a
 * silent no-op.
 */
public record ContactMessage(String id, String name, String email, String subject, String message, Instant submittedAt) {

    public ContactMessage {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(message, "message must not be null");
        Objects.requireNonNull(submittedAt, "submittedAt must not be null");
    }
}

package global.oei.domain.shared.store;

import java.util.Objects;

/**
 * Value object carried by an {@link OrderLine}, never a standalone entity: a member can
 * customize several card sets differently across (or within) orders.
 *
 * <p>{@code displayName}/{@code title}/{@code email}/{@code phone} are copies taken at
 * customization time from {@code Member}/{@code ProfessionalProfile} (the member may override
 * them locally without touching their global profile) — never live references. Likewise
 * {@code membershipTierAtOrder} is captured once and must never change retroactively if the
 * member's tier changes later. {@code qrCodeUrl} is generated (same mocked posture as
 * {@code DigitalBusinessCard#qrCodeUrl()}), never user-supplied.</p>
 */
public record BusinessCardCustomization(
        String templateId,
        String displayName,
        String title,
        String email,
        String phone,
        String qrCodeUrl,
        String membershipTierAtOrder) {

    public BusinessCardCustomization {
        Objects.requireNonNull(templateId, "templateId must not be null");
        Objects.requireNonNull(displayName, "displayName must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(qrCodeUrl, "qrCodeUrl must not be null");
        Objects.requireNonNull(membershipTierAtOrder, "membershipTierAtOrder must not be null");
    }
}

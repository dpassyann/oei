package global.oei.domain.core.publicprofile;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.publicprofile.DigitalBusinessCard;
import global.oei.domain.shared.publicprofile.GenerateDigitalBusinessCardUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Enforces the "always mocked" invariant documented on {@link DigitalBusinessCard}: no real
 * QR-image renderer or vCard file generator exists in this iteration, so every card this
 * service builds carries deterministic, mocked URLs derived from {@code publicSlug}.
 */
@Slf4j
@RequiredArgsConstructor
public class GenerateDigitalBusinessCardService implements GenerateDigitalBusinessCardUseCase {

    private static final String THEME = "default";

    @Override
    public DigitalBusinessCard execute(final MemberId memberId, final String publicSlug, final MembershipTier tier) {
        log.debug("GenerateDigitalBusinessCardService: execute called");
        final String qrCodeUrl = "https://oei.example.org/card/" + publicSlug + "/qr.png";
        final String vCardUrl = "https://oei.example.org/card/" + publicSlug + ".vcf";
        return new DigitalBusinessCard(memberId, publicSlug, qrCodeUrl, vCardUrl, THEME, tier);
    }
}

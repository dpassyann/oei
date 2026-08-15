package global.oei.domain.core.publicprofile;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.publicprofile.DigitalBusinessCard;

class GenerateDigitalBusinessCardServiceTest {

    private final GenerateDigitalBusinessCardService service = new GenerateDigitalBusinessCardService();

    @Test
    void execute_buildsAMockedCardDerivedFromTheSlug() {
        final DigitalBusinessCard card = service.execute(MemberId.newId(), "alice-nguyen", MembershipTier.GOLD);

        assertThat(card.publicSlug()).isEqualTo("alice-nguyen");
        assertThat(card.qrCodeUrl()).contains("alice-nguyen");
        assertThat(card.vCardUrl()).contains("alice-nguyen");
        assertThat(card.tier()).isEqualTo(MembershipTier.GOLD);
    }
}

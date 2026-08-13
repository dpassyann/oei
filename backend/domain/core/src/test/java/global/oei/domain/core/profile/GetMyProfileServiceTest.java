package global.oei.domain.core.profile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;

class GetMyProfileServiceTest {

    private final ProfileLookupPort port = mock(ProfileLookupPort.class);
    private final GetMyProfileService service = new GetMyProfileService(port);

    @Test
    void execute_returnsStoredProfileWhenPresent() {
        final MemberId memberId = MemberId.newId();
        final ProfessionalProfile stored = new ProfessionalProfile(
                memberId, "Title", null, null, Availability.AVAILABLE, List.of(), List.of(), List.of(), List.of(),
                List.of(), List.of(), List.of(), null, 50);
        when(port.findByMemberId(memberId)).thenReturn(Optional.of(stored));

        assertThat(service.execute(memberId)).isEqualTo(stored);
    }

    @Test
    void execute_returnsBlankProfileWhenNoneStoredYet() {
        final MemberId memberId = MemberId.newId();
        when(port.findByMemberId(memberId)).thenReturn(Optional.empty());

        final ProfessionalProfile blank = service.execute(memberId);

        assertThat(blank.memberId()).isEqualTo(memberId);
        assertThat(blank.completenessScore()).isZero();
        assertThat(blank.skills()).isEmpty();
    }
}

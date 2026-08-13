package global.oei.domain.core.profile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;

class UpdateMyProfileServiceTest {

    private final ProfileLookupPort port = mock(ProfileLookupPort.class);
    private final UpdateMyProfileService service = new UpdateMyProfileService(port);

    @Test
    void execute_recomputesCompletenessBeforeSaving() {
        final ProfessionalProfile submitted = new ProfessionalProfile(
                MemberId.newId(), "Title", "Summary", "Location", Availability.AVAILABLE, List.of("Cloud"),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), null, 0);
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final ProfessionalProfile saved = service.execute(submitted);

        assertThat(saved.completenessScore()).isEqualTo(33);
    }
}
